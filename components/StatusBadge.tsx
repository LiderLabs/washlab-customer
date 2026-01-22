"use client"

import { ORDER_STAGES, OrderStatus } from "@/types"
import { cn } from "@/lib/utils"

interface StatusBadgeProps {
  status: OrderStatus
  size?: "sm" | "md" | "lg"
}

export const StatusBadge = ({ status, size = "md" }: StatusBadgeProps) => {
  const stage = ORDER_STAGES.find((s) => s.status === status)

  const sizeClasses = {
    sm: "px-2.5 py-0.5 text-xs",
    md: "px-3 py-1 text-sm",
    lg: "px-4 py-1.5 text-base",
  }

  if (!stage) {
    return (
      <span
        className={cn(
          "inline-flex items-center gap-1.5 rounded-full font-medium border",
          sizeClasses[size],
          "bg-gray-100 dark:bg-gray-950 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-800"
        )}
      >
        <span className='w-1.5 h-1.5 rounded-full bg-current/40' />
        {status}
      </span>
    )
  }

  return (
    <span
      className={cn(
        "inline-flex items-center justify-center gap-1.5 rounded-full font-semibold leading-none border",
        sizeClasses[size],
        stage.color,
        stage.textColor,
        stage.borderColor
      )}
    >
      <span className='w-1.5 h-1.5 rounded-full bg-current/40' />
      {stage.label}
    </span>
  )
}
