"use client"

import { Doc } from "@devlider001/washlab-backend/dataModel"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { StatusBadge } from "@/components/StatusBadge"
import { OrderStatus } from "@/types"
import {
  TableRow,
  TableCell,
} from "@/components/ui/table"
import {
  Package,
  Calendar,
  DollarSign,
  Copy,
  Check,
  Eye,
  MapPin,
} from "lucide-react"
import { format } from "date-fns"
import { useState } from "react"
import { toast } from "sonner"

interface OrderTableRowProps {
  order: Doc<"orders">
  onViewDetails: (order: Doc<"orders">) => void
}

// Map backend status to frontend OrderStatus type
const mapStatus = (status: string): OrderStatus => {
  const statusMap: Record<string, OrderStatus> = {
    pending: "pending_dropoff",
    in_progress: "washing",
    ready_for_pickup: "ready",
    delivered: "out_for_delivery",
    completed: "completed",
    cancelled: "cancelled", // Correctly map cancelled status
  }
  return statusMap[status] || "pending_dropoff"
}

export const OrderTableRow = ({
  order,
  onViewDetails,
}: OrderTableRowProps) => {
  const [copied, setCopied] = useState(false)

  const handleCopyOrderNumber = async () => {
    try {
      await navigator.clipboard.writeText(order.orderNumber)
      setCopied(true)
      toast.success("Order number copied to clipboard")
      setTimeout(() => setCopied(false), 2000)
    } catch {
      toast.error("Failed to copy order number")
    }
  }

  return (
    <TableRow className="hover:bg-muted/50 cursor-pointer" onClick={() => onViewDetails(order)}>
      {/* Order Number */}
      <TableCell className="font-medium whitespace-nowrap">
        <div className="flex items-center gap-2">
          <Package className="h-4 w-4 text-muted-foreground shrink-0" />
          <span className="min-w-0">{order.orderNumber}</span>
          <button
            onClick={(e) => {
              e.stopPropagation()
              handleCopyOrderNumber()
            }}
            className="shrink-0 p-1 hover:bg-muted rounded transition-colors"
            title="Copy order number"
          >
            {copied ? (
              <Check className="h-3.5 w-3.5 text-green-600" />
            ) : (
              <Copy className="h-3.5 w-3.5 text-muted-foreground hover:text-foreground" />
            )}
          </button>
        </div>
      </TableCell>

      {/* Service Type */}
      <TableCell className="whitespace-nowrap">
        <Badge variant="outline" className="capitalize text-xs">
          {order.serviceType.replace(/_/g, " ")}
        </Badge>
      </TableCell>

      {/* Order Type */}
      <TableCell className="whitespace-nowrap">
        <Badge variant="outline" className="text-xs">
          <span className="capitalize">{order.orderType.replace(/_/g, " ")}</span>
        </Badge>
      </TableCell>

      {/* Status */}
      <TableCell className="whitespace-nowrap">
        <StatusBadge status={mapStatus(order.status)} size="sm" />
      </TableCell>

      {/* Payment Status */}
      <TableCell className="whitespace-nowrap">
        <Badge
          variant={order.paymentStatus === "paid" ? "default" : "secondary"}
          className="text-xs"
        >
          {order.paymentStatus}
        </Badge>
      </TableCell>

      {/* Delivery Badge */}
      <TableCell className="whitespace-nowrap">
        {order.isDelivery ? (
          <div className="flex items-center gap-1">
            <MapPin className="h-3.5 w-3.5 text-muted-foreground" />
            <Badge variant="outline" className="text-xs">
              Delivery
            </Badge>
          </div>
        ) : (
          <span className="text-xs text-muted-foreground">Pickup</span>
        )}
      </TableCell>

      {/* Weight */}
      <TableCell className="whitespace-nowrap">
        <span className="text-sm text-muted-foreground">
          {(order.actualWeight || order.estimatedWeight || 0).toFixed(1)} kg
        </span>
      </TableCell>

      {/* Amount */}
      <TableCell className="whitespace-nowrap">
        <div className="flex items-center gap-1">
          <DollarSign className="h-3.5 w-3.5 text-muted-foreground" />
          <span className="font-semibold">₵{order.finalPrice.toFixed(2)}</span>
        </div>
      </TableCell>

      {/* Date */}
      <TableCell className="whitespace-nowrap">
        <div className="flex items-center gap-1 text-sm text-muted-foreground">
          <Calendar className="h-3.5 w-3.5" />
          <span>{format(new Date(order.createdAt), "MMM d, yyyy")}</span>
        </div>
      </TableCell>

      {/* Actions */}
      <TableCell className="whitespace-nowrap">
        <Button
          variant="ghost"
          size="sm"
          onClick={(e) => {
            e.stopPropagation()
            onViewDetails(order)
          }}
        >
          <Eye className="h-4 w-4 mr-2" />
          View
        </Button>
      </TableCell>
    </TableRow>
  )
}

