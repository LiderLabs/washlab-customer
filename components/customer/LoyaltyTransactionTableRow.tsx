"use client"

import { Doc } from "@devlider001/washlab-backend/dataModel"
import {
  TableCell,
  TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Package, Eye, TrendingUp, TrendingDown, Edit } from "lucide-react"
import { format } from "date-fns"
import { cn } from "@/lib/utils"
import { useRouter } from "next/navigation"

interface LoyaltyTransactionTableRowProps {
  transaction: Doc<"loyaltyTransactions"> & {
    order?: {
      _id: string
      orderNumber?: string
    } | null
  }
  onViewDetails: (transaction: Doc<"loyaltyTransactions">) => void
}

export const LoyaltyTransactionTableRow = ({
  transaction,
  onViewDetails,
}: LoyaltyTransactionTableRowProps) => {
  const router = useRouter()
  const pointsChange = transaction.points > 0 ? `+${transaction.points}` : `${transaction.points}`
  const isPositive = transaction.points > 0

  const typeConfig = {
    earned: {
      label: "Earned",
      icon: TrendingUp,
      className: "bg-green-100 dark:bg-green-950 text-green-700 dark:text-green-300 border-green-200 dark:border-green-800",
    },
    redeemed: {
      label: "Redeemed",
      icon: TrendingDown,
      className: "bg-orange-100 dark:bg-orange-950 text-orange-700 dark:text-orange-300 border-orange-200 dark:border-orange-800",
    },
    adjusted: {
      label: "Adjusted",
      icon: Edit,
      className: "bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800",
    },
    expired: {
      label: "Expired",
      icon: TrendingDown,
      className: "bg-gray-100 dark:bg-gray-950 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-800",
    },
  }

  const type = typeConfig[transaction.type]
  const Icon = type.icon

  return (
    <TableRow>
      <TableCell className="whitespace-nowrap">
        <span
          className={cn(
            "inline-flex items-center justify-center gap-1.5 rounded-full font-semibold border leading-none px-2.5 py-1 text-xs",
            type.className
          )}
        >
          <Icon className="w-3 h-3" />
          {type.label}
        </span>
      </TableCell>
      <TableCell className="whitespace-nowrap">
        <span className={cn(
          "font-semibold",
          isPositive ? "text-green-600 dark:text-green-400" : "text-orange-600 dark:text-orange-400"
        )}>
          {pointsChange}
        </span>
      </TableCell>
      <TableCell className="whitespace-nowrap font-medium">
        {transaction.balanceAfter}
      </TableCell>
      <TableCell className="whitespace-nowrap">
        {transaction.order ? (
          <div className="flex items-center gap-1.5">
            <Package className="h-3.5 w-3.5 text-muted-foreground" />
            <Button
              variant="link"
              className="h-auto p-0 text-sm font-medium"
              onClick={() => router.push(`/track?order=${transaction.order?.orderNumber}`)}
            >
              {transaction.order.orderNumber}
            </Button>
          </div>
        ) : (
          <span className="text-muted-foreground text-sm">—</span>
        )}
      </TableCell>
      <TableCell className="whitespace-nowrap text-sm text-muted-foreground max-w-[200px] truncate">
        {transaction.description || "—"}
      </TableCell>
      <TableCell className="whitespace-nowrap text-sm text-muted-foreground">
        {format(new Date(transaction.createdAt), "MMM d, yyyy")}
      </TableCell>
      <TableCell className="text-right whitespace-nowrap">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onViewDetails(transaction)}
        >
          <Eye className="h-3.5 w-3.5 mr-1.5" />
          View
        </Button>
      </TableCell>
    </TableRow>
  )
}

