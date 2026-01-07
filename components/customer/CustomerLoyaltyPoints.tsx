"use client"

import { useState } from "react"
import { usePaginatedQuery, useQuery, useConvexAuth } from "convex/react"
import { api } from "@devlider001/washlab-backend/api"
import { Doc } from "@devlider001/washlab-backend/dataModel"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { LoyaltyTransactionTable } from "./LoyaltyTransactionTable"
import { TransactionDetailsDialog } from "./TransactionDetailsDialog"
import { Award, TrendingUp, Gift, Target, Loader2, History } from "lucide-react"
import { cn } from "@/lib/utils"

export default function CustomerLoyaltyPoints() {
  const { isAuthenticated } = useConvexAuth()
  const [selectedTransaction, setSelectedTransaction] = useState<Doc<"loyaltyTransactions"> | null>(null)

  // Fetch loyalty points balance
  const loyaltyBalance = useQuery(
    api.loyalty.getBalance,
    isAuthenticated ? {} : "skip"
  )

  // Fetch transactions (paginated)
  const {
    results: transactionsPages,
    status: transactionsStatus,
    loadMore: loadMoreTransactions,
  } = usePaginatedQuery(
    api.loyalty.getTransactions,
    isAuthenticated ? {} : "skip",
    { initialNumItems: 20 }
  )
  const allTransactions = transactionsPages?.flat() ?? []
  const hasMoreTransactions = transactionsStatus === "CanLoadMore"

  const isLoadingBalance = loyaltyBalance === undefined && isAuthenticated
  const isLoadingTransactions = transactionsStatus === "LoadingFirstPage" && allTransactions.length === 0

  const currentPoints = loyaltyBalance?.points || 0
  const totalEarned = loyaltyBalance?.totalEarned || 0
  const totalRedeemed = loyaltyBalance?.totalRedeemed || 0

  // Calculate progress to next reward
  const currentProgress = currentPoints % 10
  const pointsUntilNextReward = 10 - currentProgress
  const progressPercentage = (currentProgress / 10) * 100
  const freeWashesEarned = Math.floor(totalEarned / 10)

  // Check if they've earned a reward
  const hasEarnedReward = currentPoints >= 10 && currentProgress === 0

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Loyalty Points</h1>
        <p className="text-muted-foreground mt-1">
          Track your loyalty points and rewards
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Current Balance</CardTitle>
            <Award className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isLoadingBalance ? (
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            ) : (
              <>
                <div className="text-2xl font-bold">{currentPoints}</div>
                <p className="text-xs text-muted-foreground">
                  Available points
                </p>
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Earned</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isLoadingBalance ? (
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            ) : (
              <>
                <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                  +{totalEarned}
                </div>
                <p className="text-xs text-muted-foreground">
                  Lifetime earned
                </p>
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Free Washes Earned</CardTitle>
            <Gift className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isLoadingBalance ? (
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            ) : (
              <>
                <div className="text-2xl font-bold">{freeWashesEarned}</div>
                <p className="text-xs text-muted-foreground">
                  Rewards earned
                </p>
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Next Reward</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isLoadingBalance ? (
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            ) : (
              <>
                <div className="text-2xl font-bold">
                  {hasEarnedReward ? "🎉 Ready!" : pointsUntilNextReward}
                </div>
                <p className="text-xs text-muted-foreground">
                  {hasEarnedReward ? "Free wash available" : "points to next reward"}
                </p>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Progress Card */}
      <Card>
        <CardHeader>
          <CardTitle>Progress to Next Reward</CardTitle>
          <CardDescription>
            Earn 10 points to get a free wash
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoadingBalance ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <div className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium">
                    {hasEarnedReward ? "🎉 Free wash earned!" : `${pointsUntilNextReward} points to go`}
                  </span>
                  <span className="text-muted-foreground">
                    {currentProgress}/10 points
                  </span>
                </div>
                <div className="relative h-4 w-full overflow-hidden rounded-full bg-muted">
                  <div
                    className={cn(
                      "h-full transition-all duration-500",
                      hasEarnedReward
                        ? "bg-gradient-to-r from-green-500 to-emerald-500"
                        : "bg-gradient-to-r from-purple-500 to-pink-500"
                    )}
                    style={{ width: `${hasEarnedReward ? 100 : progressPercentage}%` }}
                  />
                </div>
              </div>

              {hasEarnedReward && (
                <div className="rounded-lg bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 p-4">
                  <p className="text-sm font-medium text-green-900 dark:text-green-100">
                    🎉 Congratulations! You&apos;ve earned a free wash! Redeem it on your next order.
                  </p>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Transaction History */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <History className="h-5 w-5" />
            Transaction History
          </CardTitle>
          <CardDescription>
            View all your loyalty point transactions
          </CardDescription>
        </CardHeader>
        <CardContent>
          <LoyaltyTransactionTable
            transactions={allTransactions}
            isLoading={isLoadingTransactions}
            onViewDetails={setSelectedTransaction}
          />

          {hasMoreTransactions && (
            <div className="flex justify-center mt-6">
              <Button
                variant="outline"
                onClick={() => loadMoreTransactions(20)}
                disabled={transactionsStatus === "LoadingMore"}
              >
                {transactionsStatus === "LoadingMore" ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Loading...
                  </>
                ) : (
                  "Load More"
                )}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Transaction Details Dialog */}
      {selectedTransaction && (
        <TransactionDetailsDialog
          open={!!selectedTransaction}
          onOpenChange={(open) => !open && setSelectedTransaction(null)}
          transaction={selectedTransaction}
        />
      )}
    </div>
  )
}

