"use client"

import { useUser } from "@clerk/nextjs"
import { useQuery, useConvexAuth } from "convex/react"
import { api } from "@devlider001/washlab-backend/api"
import { Id } from "@devlider001/washlab-backend/dataModel"
import { useEffect } from "react"
import { useRouter, usePathname } from "next/navigation"

export function useCurrentCustomer() {
    const { user: clerkUser, isLoaded: isClerkLoaded } = useUser()
    const { isLoading: isConvexAuthLoading, isAuthenticated: isConvexAuthenticated } = useConvexAuth()
    const router = useRouter()
    const pathname = usePathname()

    // Only query Convex when user is authenticated to Clerk AND Convex auth is ready
    // Pass "skip" to skip the query when not authenticated (prevents "Authentication required" errors)
    const convexUser = useQuery(
        api.customers.getProfile,
        clerkUser && isConvexAuthenticated && !isConvexAuthLoading ? {} : "skip"
    )

    // Check if user is admin/attendant (should be blocked from customer app)
    const isAdminOrAttendant = useQuery(
        api.customers.checkIsAdminOrAttendant,
        clerkUser && isConvexAuthenticated && !isConvexAuthLoading ? {} : "skip"
    )

    // Check if user needs to complete profile (only if not admin/attendant)
    const needsProfileCompletion = clerkUser && 
        isConvexAuthenticated && 
        !isConvexAuthLoading && 
        convexUser === null && 
        !isAdminOrAttendant &&
        pathname !== '/dashboard/complete-profile' &&
        pathname !== '/unauthorized'

    // Redirect to unauthorized page if user is admin/attendant
    useEffect(() => {
        if (!isClerkLoaded || isConvexAuthLoading) return
        if (isAdminOrAttendant === true && pathname !== '/unauthorized') {
            router.push('/unauthorized')
        }
    }, [isAdminOrAttendant, pathname, router, isClerkLoaded, isConvexAuthLoading])

    // Redirect to complete profile if needed
    useEffect(() => {
        if (needsProfileCompletion) {
            router.push('/dashboard/complete-profile')
        }
    }, [needsProfileCompletion, router])
    
    // Debug logging (only in development)
    useEffect(() => {
        if (process.env.NODE_ENV === 'development') {
            console.log("🔍 useCurrentCustomer Debug:", {
                clerkUser: clerkUser?.id,
                isClerkLoaded,
                isConvexAuthenticated,
                isConvexAuthLoading,
                convexUser: convexUser ? {
                    _id: convexUser._id,
                    name: convexUser.name,
                    email: convexUser.email,
                    phoneNumber: convexUser.phoneNumber,
                    status: convexUser.status
                } : convexUser === null ? 'null (needs registration)' : 'undefined (loading)',
                needsProfileCompletion
            })
        }
    }, [clerkUser, isClerkLoaded, isConvexAuthenticated, isConvexAuthLoading, convexUser, needsProfileCompletion])

    // Loading states
    const isLoading = !isClerkLoaded || 
        isConvexAuthLoading || 
        (clerkUser && isConvexAuthenticated && convexUser === undefined) ||
        (clerkUser && isConvexAuthenticated && isAdminOrAttendant === undefined)
    
    // User status checks (only valid when convexUser exists)
    const isActive = convexUser?.status === "active"
    const isBlocked = convexUser?.status === "blocked"
    const isSuspended = convexUser?.status === "suspended"
    const isRestricted = convexUser?.status === "restricted"
    const customerId = convexUser?._id as Id<"users"> | undefined

    return {
        clerkUser,
        convexUser,
        isLoading,
        isActive,
        isBlocked,
        isSuspended,
        isRestricted,
        customerId,
        isAuthenticated: !!clerkUser && !!convexUser,
        isAdminOrAttendant: isAdminOrAttendant === true,
        canPlaceOrders: isActive && !isBlocked && !isSuspended,
        needsProfileCompletion: needsProfileCompletion || false
    }
}
