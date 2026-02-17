'use client'

import { ClerkProvider, useAuth } from "@clerk/nextjs"
import { ConvexProviderWithClerk } from "convex/react-clerk"
import { ConvexReactClient } from "convex/react"
import { ReactNode } from "react"


const clerkKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY
const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL
const convex = convexUrl ? new ConvexReactClient(convexUrl) : null

export function AuthProvider({ children }: { children: ReactNode }) {
  // Skip Clerk/Convex when env vars are missing (e.g. build without env) so prerender doesn't throw
  if (!clerkKey) {
    return <>{children}</>
  }

  return (
    <ClerkProvider
      publishableKey={clerkKey}

      signInUrl="/sign-in"
      signUpUrl="/sign-up"
      afterSignInUrl="/dashboard"
      afterSignUpUrl="/dashboard"
    >

      {convex ? (
        <ConvexProviderWithClerk client={convex} useAuth={useAuth}>
          {children}
        </ConvexProviderWithClerk>
      ) : (
        children
      )}

    </ClerkProvider>
  )
}

