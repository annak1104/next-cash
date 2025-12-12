import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import createIntlMiddleware from "next-intl/middleware";
import { routing } from "./i18n/routing";

const isProtectedRoute = createRouteMatcher(["/portfolio(.*)"]);

const intlMiddleware = createIntlMiddleware(routing);

export default clerkMiddleware(async (auth, req) => {
  // Skip intl middleware for API routes
  if (req.nextUrl.pathname.startsWith("/api")) {
    if (isProtectedRoute(req)) {
      await auth.protect();
    }
    return;
  }

  const intlResult = intlMiddleware(req);
  if (intlResult) return intlResult;

  if (isProtectedRoute(req)) {
    await auth.protect();
  }

  return;
});

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
};
