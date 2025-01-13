import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { prisma } from '@/lib/prisma'
import { PlatformFactory } from '@/lib/platforms'

export async function POST(request: Request) {
  try {
    // Verify authentication
    const session = await getServerSession()
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get the LinkedIn account
    const linkedInAccount = await prisma.account.findFirst({
      where: {
        userId: session.user.id,
        provider: 'linkedin'
      }
    })

    if (!linkedInAccount?.access_token) {
      return NextResponse.json(
        { error: 'LinkedIn account not connected' },
        { status: 400 }
      )
    }

    // Check token expiration
    if (linkedInAccount.expires_at && linkedInAccount.expires_at < Date.now()) {
      if (!linkedInAccount.refresh_token) {
        return NextResponse.json(
          { error: 'LinkedIn token expired' },
          { status: 401 }
        )
      }

      // Refresh the token
      const platform = PlatformFactory.getPlatform('LinkedIn')
      const newTokenData = await platform.refreshToken(linkedInAccount.refresh_token)

      // Update token in database
      await prisma.account.update({
        where: { id: linkedInAccount.id },
        data: {
          access_token: newTokenData.accessToken,
          refresh_token: newTokenData.refreshToken,
          expires_at: newTokenData.expiresAt?.getTime()
        }
      })

      linkedInAccount.access_token = newTokenData.accessToken
    }

    // Get request data
    const data = await request.json()
    const { content, mediaIds } = data

    // Validate content
    if (!content) {
      return NextResponse.json(
        { error: 'Content is required' },
        { status: 400 }
      )
    }

    // Create the post
    const platform = PlatformFactory.getPlatform('LinkedIn')
    const result = await platform.createPost(
      content,
      mediaIds || [],
      linkedInAccount.access_token
    )

    // Store the post in our database
    const post = await prisma.post.create({
      data: {
        userId: session.user.id,
        content,
        platforms: ['LinkedIn'],
        publishedTime: new Date(),
        status: 'PUBLISHED',
        media: mediaIds ? { mediaIds } : undefined,
      }
    })

    return NextResponse.json({ 
      success: true,
      id: result.id,
      url: result.url,
      postId: post.id
    })
  } catch (error) {
    console.error('LinkedIn post error:', error)
    return NextResponse.json(
      { error: 'Failed to post to LinkedIn' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: Request) {
  try {
    const session = await getServerSession()
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const postId = searchParams.get('postId')

    if (!postId) {
      return NextResponse.json(
        { error: 'Post ID is required' },
        { status: 400 }
      )
    }

    const linkedInAccount = await prisma.account.findFirst({
      where: {
        userId: session.user.id,
        provider: 'linkedin'
      }
    })

    if (!linkedInAccount?.access_token) {
      return NextResponse.json(
        { error: 'LinkedIn account not connected' },
        { status: 400 }
      )
    }

    // Check token expiration and refresh if needed
    if (linkedInAccount.expires_at && linkedInAccount.expires_at < Date.now() && linkedInAccount.refresh_token) {
      const platform = PlatformFactory.getPlatform('LinkedIn')
      const newTokenData = await platform.refreshToken(linkedInAccount.refresh_token)

      await prisma.account.update({
        where: { id: linkedInAccount.id },
        data: {
          access_token: newTokenData.accessToken,
          refresh_token: newTokenData.refreshToken,
          expires_at: newTokenData.expiresAt?.getTime()
        }
      })

      linkedInAccount.access_token = newTokenData.accessToken
    }

    const platform = PlatformFactory.getPlatform('LinkedIn')
    await platform.deletePost(postId, linkedInAccount.access_token)

    // Update post status in our database
    await prisma.post.update({
      where: { id: postId },
      data: { status: 'FAILED' }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('LinkedIn delete error:', error)
    return NextResponse.json(
      { error: 'Failed to delete LinkedIn post' },
      { status: 500 }
    )
  }
}