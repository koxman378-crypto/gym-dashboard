"use client"

import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/src/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default:
          "border-zinc-200 bg-zinc-100 text-zinc-800 shadow-none",
        secondary:
          "border-zinc-200 bg-white text-zinc-700 shadow-none",
        destructive:
          "border-zinc-300 bg-zinc-200 text-zinc-800 shadow-none",
        outline: "text-foreground border-2 hover:bg-accent/50",
        success:
          "border-zinc-300 bg-zinc-50 text-zinc-700 shadow-none",
        warning:
          "border-zinc-300 bg-zinc-50 text-zinc-700 shadow-none",
        info:
          "border-zinc-300 bg-zinc-50 text-zinc-700 shadow-none",
        active:
          "border-zinc-300 bg-zinc-100 text-zinc-800 shadow-none",
        inactive:
          "border-zinc-300 bg-white text-zinc-600 shadow-none",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  )
}

export { Badge, badgeVariants }
