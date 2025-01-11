import NextAuth from "next-auth"
import GoogleProvider from "next-auth/providers/google"
import TwitterProvider from "next-auth/providers/twitter"
import LinkedInProvider from "next-auth/providers/linkedin"
import InstagramProvider from "next-auth/providers/instagram"
import { PrismaAdapter } from "@auth/prisma-adapter"
import { prisma } from "@/lib/prisma"

const handler = NextAuth({
  adapter: PrismaAdapter(prisma),
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      authorization: {
        params: {
          scope: 'https://www.googleapis.com/auth/userinfo.profile https://www.googleapis.com/auth/userinfo.email https://www.googleapis.com/auth/drive.file',
          access_type: 'offline',
          prompt: 'consent',
        }
      }
    }),
    TwitterProvider({
      clientId: process.env.TWITTER_CLIENT_ID!,
      clientSecret: process.env.TWITTER_CLIENT_SECRET!,
      version: "2.0",
    }),
    LinkedInProvider({
      clientId: process.env.LINKEDIN_CLIENT_ID!,
      clientSecret: process.env.LINKEDIN_CLIENT_SECRET!,
      authorization: {
        params: {
          scope: 'r_liteprofile r_emailaddress w_member_social',
        }
      }
    }),
    InstagramProvider({
      clientId: process.env.INSTAGRAM_CLIENT_ID!,
      clientSecret: process.env.INSTAGRAM_CLIENT_SECRET!,
    }),
    {
      id: 'tiktok',
      name: 'TikTok',
      type: 'oauth',
      authorization: 'https://www.tiktok.com/auth/authorize/',
      token: 'https://open.tiktokapis.com/v2/oauth/token/',
      userinfo: 'https://open.tiktokapis.com/v2/user/info/',
      clientId: process.env.TIKTOK_CLIENT_KEY,
      clientSecret: process.env.TIKTOK_CLIENT_SECRET,
      profile(profile) {
        return {
          id: profile.user.open_id,
          name: profile.user.display_name,
          image: profile.user.avatar_url,
        }
      }
    },
    {
      id: 'notion',
      name: 'Notion',
      type: 'oauth',
      authorization: {
        url: 'https://api.notion.com/v1/oauth/authorize',
        params: {
          owner: 'user',
          response_type: 'code'
        }
      },
      token: 'https://api.notion.com/v1/oauth/token',
      userinfo: {
        url: 'https://api.notion.com/v1/users/me',
        async request({ client, tokens }) {
          const response = await client.userinfo(tokens.access_token)
          return response
        }
      },
      clientId: process.env.NOTION_CLIENT_ID,
      clientSecret: process.env.NOTION_CLIENT_SECRET,
      profile(profile) {
        return {
          id: profile.bot.owner.user.id,
          name: profile.bot.owner.user.name,
          email: profile.bot.owner.user.person?.email,
        }
      }
    }
  ],
  callbacks: {
    async session({ session, user }) {
      session.user.id = user.id
      return session
    },
    async signIn({ user, account, profile }) {
      return true
    },
  },
  pages: {
    signIn: '/auth/signin',
  }
})

export { handler as GET, handler as POST }