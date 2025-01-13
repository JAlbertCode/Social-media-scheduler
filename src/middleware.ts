import { withAuth } from "next-auth/middleware"

export default withAuth({
  pages: {
    signIn: "/auth/signin",
    error: "/auth/error",
  },
})

export const config = {
  matcher: [
    "/",
    "/schedule/:path*",
    "/compose/:path*",
    "/queue/:path*",
    "/settings/:path*",
  ],
}