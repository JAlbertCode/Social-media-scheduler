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

    // Get the Twitter account
    const twitterAccount = await prisma.account.findFirst({
      where: {
        userId: session.user.id,
        provider: 'twitter'
      }
    })

    if (!twitterAccount?.access_token) {
      return NextResponse.json(
        { error: 'Twitter account not connected' },
        { status: 400 }
      )
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
    const platform = PlatformFactory.getPlatform('Twitter')
    const result = await platform.createPost(
      content,
      mediaIds || [],
      twitterAccount.access_token
    )

    // Store the post in our database
    const post = await prisma.post.create({
      data: {
        userId: session.user.id,
        content,
        platforms: ['Twitter'],
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
    console.error('Twitter post error:', error)
    return NextResponse.json(
      { error: 'Failed to post to Twitter' },
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

    const twitterAccount = await prisma.account.findFirst({
      where: {
        userId: session.user.id,
        provider: 'twitter'
      }
    })

    if (!twitterAccount?.access_token) {
      return NextResponse.json(
        { error: 'Twitter account not connected' },
        { status: 400 }
      )
    }

    const platform = PlatformFactory.getPlatform('Twitter')
    await platform.deletePost(postId, twitterAccount.access_token)

    // Update post status in our database
    await prisma.post.update({
      where: { id: postId },
      data: { status: 'FAILED' }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Twitter delete error:', error)
    return NextResponse.json(
      { error: 'Failed to delete Twitter post' },
      { status: 500 }
    )
  }
}