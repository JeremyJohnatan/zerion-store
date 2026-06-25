import { withAuth } from "next-auth/middleware";

export default withAuth({
  callbacks: {
    authorized: ({ req, token }) => {
      const pathname = req.nextUrl.pathname;

      // Only ADMIN can access /admin
      if (pathname.startsWith("/admin")) {
        return token?.role === "ADMIN";
      }

      // Any logged in user can access /checkout and /profile
      if (pathname.startsWith("/checkout") || pathname.startsWith("/profile")) {
        return !!token;
      }

      return true;
    },
  },
  pages: {
    signIn: "/login",
  },
});

export const config = {
  matcher: ["/admin/:path*", "/checkout/:path*", "/profile/:path*"],
};
