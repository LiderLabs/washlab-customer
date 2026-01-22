"use client"

import { Doc } from "@devlider001/washlab-backend/dataModel"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { LoyaltyTransactionTableRow } from "./LoyaltyTransactionTableRow"
import { Loader2, History } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"

interface LoyaltyTransactionTableProps {
  transactions: (Doc<"loyaltyTransactions"> & {
    order?: {
      _id: string
      orderNumber?: string
    } | null
  })[]
  isLoading?: boolean
  onViewDetails: (transaction: Doc<"loyaltyTransactions">) => void
}

export const LoyaltyTransactionTable = ({
  transactions,
  isLoading = false,
  onViewDetails,
}: LoyaltyTransactionTableProps) => {
  if (isLoading && transactions.length === 0) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    )
  }

  if (transactions.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <History className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="font-semibold text-lg mb-2">No transactions found</h3>
          <p className="text-muted-foreground text-center">
            You haven&apos;t earned or redeemed any loyalty points yet
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="rounded-md border">
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[120px] whitespace-nowrap">Type</TableHead>
              <TableHead className="w-[100px] whitespace-nowrap">Points</TableHead>
              <TableHead className="w-[100px] whitespace-nowrap">Balance After</TableHead>
              <TableHead className="w-[140px] whitespace-nowrap">Order</TableHead>
              <TableHead className="w-[200px] whitespace-nowrap">Description</TableHead>
              <TableHead className="w-[120px] whitespace-nowrap">Date</TableHead>
              <TableHead className="w-[80px] text-right whitespace-nowrap">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {transactions.map((transaction) => (
              <LoyaltyTransactionTableRow
                key={transaction._id}
                transaction={transaction}
                onViewDetails={onViewDetails}
              />
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}

