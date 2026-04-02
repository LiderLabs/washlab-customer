import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'

const isProtectedRoute = createRouteMatcher([
  '/dashboard(.*)',
])

const isAuthRoute = createRouteMatcher([
  '/sign-in(.*)',
  '/sign-up(.*)',
  '/forgot-password(.*)',
])

export default clerkMiddleware(async (auth, req) => {
  const { userId } = await auth()

  // If logged in and trying to access auth pages, redirect to dashboard
  if (userId && isAuthRoute(req)) {
    return NextResponse.redirect(new URL('/dashboard', req.url))
  }

  // If not logged in and trying to access protected pages, redirect to sign-in
  if (!userId && isProtectedRoute(req)) {
    return NextResponse.redirect(new URL('/sign-in', req.url))
  }
})

export const config = {
  matcher: [
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    '/(api|trpc)(.*)',
  ],
}
