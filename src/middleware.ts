import authConfig from "./auth.config";
import NextAuth from "next-auth";
import { apiAuthPrefix, authRoutes, publicRoutes } from "./routes";
import { currentUser } from "./lib/auth";
import { UserRole } from "@prisma/client";

// auth middleware function is invoked only with routes that match the config below

const { auth } = NextAuth(authConfig);

export default auth(async (req) => {
  const { nextUrl } = req;

  const user = await currentUser();

  const isLoggedIn = !!req.auth;
  const isApiAuthRoute = nextUrl.pathname.startsWith(apiAuthPrefix);
  const isPublicRoute = publicRoutes.includes(nextUrl.pathname);
  const isAuthRoute = authRoutes.includes(nextUrl.pathname);
  const isAdminRoute = nextUrl.pathname.startsWith("/admin/");

  if (isApiAuthRoute) {
    return; // We will not do anything
  }

  if (isAuthRoute) {
    if (isLoggedIn) {
      if (user?.role === UserRole.ADMIN) {
        return Response.redirect(new URL("/admin", nextUrl));
      } else if (user?.role === UserRole.USER) {
        return Response.redirect(new URL("/", nextUrl));
      }
    }
    return;
  }

  if (!isLoggedIn && !isPublicRoute) {
    return Response.redirect(new URL("/auth/login", nextUrl));
  }

  if (isLoggedIn && isAdminRoute && user?.role !== "ADMIN") {
    return Response.redirect(new URL("/auth/forbidden", nextUrl));
  }

  return; //  return;  means Allow this and don't do anything
});

export const config = {
  matcher: ["/((?!.*\\..*|_next).*)", "/", "/(api|trpc)(.*)"],
};
