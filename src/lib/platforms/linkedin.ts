import {
  SocialPlatform,
  SocialPlatformConfig,
  AccessTokenData,
  PlatformUser,
  MediaUploadResult,
  PostResult
} from './types'

interface LinkedInConfig extends SocialPlatformConfig {
  apiVersion: string
  apiBaseUrl: string
}

interface LinkedInTokenResponse {
  access_token: string
  expires_in: number
  refresh_token?: string
  scope?: string
}

interface LinkedInUser {
  id: string
  localizedFirstName: string
  localizedLastName: string
  profilePicture?: {
    'displayImage~': {
      elements: Array<{
        identifiers: Array<{
          identifier: string
        }>
      }>
    }
  }
}

interface LinkedInMediaUpload {
  value: {
    uploadMechanism: {
      'com.linkedin.digitalmedia.uploading.MediaUploadHttpRequest': {
        uploadUrl: string
      }
    },
    mediaArtifact: string,
    asset: string
  }
}

interface LinkedInMediaStatus {
  recipes: Array<{
    status: string
  }>
}

interface LinkedInShareResponse {
  id: string
  activity: string
  created: {
    time: number
  }
}

export class LinkedInPlatform extends SocialPlatform {
  private config: LinkedInConfig

  constructor() {
    const config: LinkedInConfig = {
      clientId: process.env.LINKEDIN_CLIENT_ID!,
      clientSecret: process.env.LINKEDIN_CLIENT_SECRET!,
      redirectUri: `${process.env.NEXTAUTH_URL}/api/auth/callback/linkedin`,
      scopes: [
        'r_liteprofile',
        'r_emailaddress',
        'w_member_social',
        'w_organization_social'
      ],
      authUrl: 'https://www.linkedin.com/oauth/v2/authorization',
      tokenUrl: 'https://www.linkedin.com/oauth/v2/accessToken',
      apiVersion: 'v2',
      apiBaseUrl: 'https://api.linkedin.com/v2'
    }
    super(config, 'LinkedIn')
    this.config = config
  }

  async authorize(code: string): Promise<AccessTokenData> {
    try {
      const params = new URLSearchParams({
        grant_type: 'authorization_code',
        code,
        redirect_uri: this.config.redirectUri,
        client_id: this.config.clientId,
        client_secret: this.config.clientSecret
      })

      const response = await fetch(this.config.tokenUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: params.toString()
      })

      if (!response.ok) {
        throw await response.json()
      }

      const data: LinkedInTokenResponse = await response.json()
      
      return {
        accessToken: data.access_token,
        refreshToken: data.refresh_token,
        expiresAt: new Date(Date.now() + data.expires_in * 1000)
      }
    } catch (error) {
      return this.handleError(error)
    }
  }

  async refreshToken(refreshToken: string): Promise<AccessTokenData> {
    try {
      const params = new URLSearchParams({
        grant_type: 'refresh_token',
        refresh_token: refreshToken,
        client_id: this.config.clientId,
        client_secret: this.config.clientSecret
      })

      const response = await fetch(this.config.tokenUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: params.toString()
      })

      if (!response.ok) {
        throw await response.json()
      }

      const data: LinkedInTokenResponse = await response.json()
      
      return {
        accessToken: data.access_token,
        refreshToken: data.refresh_token,
        expiresAt: new Date(Date.now() + data.expires_in * 1000)
      }
    } catch (error) {
      return this.handleError(error)
    }
  }

  getAuthUrl(): string {
    const params = new URLSearchParams({
      response_type: 'code',
      client_id: this.config.clientId,
      redirect_uri: this.config.redirectUri,
      scope: this.config.scopes.join(' '),
      state: 'linkedin'
    })

    return `${this.config.authUrl}?${params.toString()}`
  }

  async getUser(accessToken: string): Promise<PlatformUser> {
    try {
      const response = await fetch(
        `${this.config.apiBaseUrl}/me?projection=(id,localizedFirstName,localizedLastName,profilePicture(displayImage~:playableStreams))`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`
          }
        }
      )

      if (!response.ok) {
        throw await response.json()
      }

      const data: LinkedInUser = await response.json()
      
      const profileImage = data.profilePicture?.['displayImage~']?.elements?.[0]?.identifiers?.[0]?.identifier

      return {
        id: data.id,
        username: `${data.localizedFirstName} ${data.localizedLastName}`,
        displayName: `${data.localizedFirstName} ${data.localizedLastName}`,
        profileImage
      }
    } catch (error) {
      return this.handleError(error)
    }
  }

  async uploadMedia(
    file: Buffer,
    mediaType: string,
    accessToken: string
  ): Promise<MediaUploadResult> {
    try {
      // Initialize upload
      const initResponse = await fetch(
        `${this.config.apiBaseUrl}/assets?action=registerUpload`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            registerUploadRequest: {
              recipes: ['urn:li:digitalmediaRecipe:feedshare-image'],
              owner: 'urn:li:person:{PERSON_ID}',
              serviceRelationships: [{
                relationshipType: 'OWNER',
                identifier: 'urn:li:userGeneratedContent'
              }]
            }
          })
        }
      )

      if (!initResponse.ok) {
        throw await initResponse.json()
      }

      const initData: LinkedInMediaUpload = await initResponse.json()
      const uploadUrl = initData.value.uploadMechanism['com.linkedin.digitalmedia.uploading.MediaUploadHttpRequest'].uploadUrl

      // Upload the file
      const uploadResponse = await fetch(uploadUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': mediaType
        },
        body: file
      })

      if (!uploadResponse.ok) {
        throw await uploadResponse.json()
      }

      // Check media status
      const statusResponse = await fetch(
        `${this.config.apiBaseUrl}/assets/${initData.value.asset}`,
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`
          }
        }
      )

      if (!statusResponse.ok) {
        throw await statusResponse.json()
      }

      const statusData: LinkedInMediaStatus = await statusResponse.json()
      
      if (statusData.recipes[0].status !== 'AVAILABLE') {
        throw new Error('Media processing failed')
      }

      return {
        mediaId: initData.value.asset,
        mediaType: mediaType.startsWith('video') ? 'video' : 'image'
      }
    } catch (error) {
      return this.handleError(error)
    }
  }

  async createPost(
    content: string,
    mediaIds: string[],
    accessToken: string
  ): Promise<PostResult> {
    try {
      const payload: any = {
        author: 'urn:li:person:{PERSON_ID}',
        lifecycleState: 'PUBLISHED',
        specificContent: {
          'com.linkedin.ugc.ShareContent': {
            shareCommentary: {
              text: content
            },
            shareMediaCategory: mediaIds.length > 0 ? 'IMAGE' : 'NONE'
          }
        },
        visibility: {
          'com.linkedin.ugc.MemberNetworkVisibility': 'PUBLIC'
        }
      }

      if (mediaIds.length > 0) {
        payload.specificContent['com.linkedin.ugc.ShareContent'].media = mediaIds.map(id => ({
          status: 'READY',
          media: id
        }))
      }

      const response = await fetch(
        `${this.config.apiBaseUrl}/ugcPosts`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
            'X-Restli-Protocol-Version': '2.0.0'
          },
          body: JSON.stringify(payload)
        }
      )

      if (!response.ok) {
        throw await response.json()
      }

      const data: LinkedInShareResponse = await response.json()
      
      return {
        id: data.id,
        createdAt: new Date(data.created.time),
        platform: 'LinkedIn'
      }
    } catch (error) {
      return this.handleError(error)
    }
  }

  async deletePost(postId: string, accessToken: string): Promise<void> {
    try {
      const response = await fetch(
        `${this.config.apiBaseUrl}/ugcPosts/${postId}`,
        {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'X-Restli-Protocol-Version': '2.0.0'
          }
        }
      )

      if (!response.ok) {
        throw await response.json()
      }
    } catch (error) {
      return this.handleError(error)
    }
  }
}