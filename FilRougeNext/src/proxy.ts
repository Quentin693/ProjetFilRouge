import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";

export default auth((req) => {
  const { nextUrl, auth: session } = req;
  const isLoggedIn = !!session;
  const isAdmin = session?.user?.role === "ADMIN";
  const isOnboarded = session?.user?.onboarded;

  const isAuthPage =
    nextUrl.pathname.startsWith("/login") ||
    nextUrl.pathname.startsWith("/register");
  const isOnboardingPage = nextUrl.pathname.startsWith("/onboarding");
  const isAppPage =
    nextUrl.pathname.startsWith("/dashboard") ||
    nextUrl.pathname.startsWith("/reservations") ||
    nextUrl.pathname.startsWith("/settings");
  const isAdminPage = nextUrl.pathname.startsWith("/admin");
  const isHomePage = nextUrl.pathname === "/";

  // Redirect admin from home page directly to admin panel
  if (isHomePage && isLoggedIn && isAdmin) {
    return NextResponse.redirect(new URL("/admin", nextUrl));
  }

  // Redirect unauthenticated users from protected pages
  if ((isAppPage || isAdminPage || isOnboardingPage) && !isLoggedIn) {
    return NextResponse.redirect(new URL("/login", nextUrl));
  }

  // Redirect authenticated users away from auth pages
  if (isAuthPage && isLoggedIn) {
    if (!isOnboarded) {
      return NextResponse.redirect(new URL("/onboarding", nextUrl));
    }
    if (isAdmin) {
      return NextResponse.redirect(new URL("/admin", nextUrl));
    }
    return NextResponse.redirect(new URL("/dashboard", nextUrl));
  }

  // Redirect non-onboarded users to onboarding (except if already there)
  if (isLoggedIn && !isOnboarded && isAppPage) {
    return NextResponse.redirect(new URL("/onboarding", nextUrl));
  }

  // Redirect admin users away from regular app pages → admin panel
  if (isLoggedIn && isAdmin && isAppPage) {
    return NextResponse.redirect(new URL("/admin", nextUrl));
  }

  // Redirect non-admin users from admin pages
  if (isAdminPage && !isAdmin) {
    return NextResponse.redirect(new URL("/dashboard", nextUrl));
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|.*\\.png$|.*\\.jpg$|.*\\.svg$).*)",
  ],
};
