"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

interface TooltipProps {
  children: React.ReactNode
  content: React.ReactNode
  side?: "top" | "bottom" | "left" | "right"
  className?: string
}

const TooltipProvider = ({ children }: { children: React.ReactNode }) => {
  return <>{children}</>
}

const Tooltip = ({ children, content, side = "top", className }: TooltipProps) => {
  const [isVisible, setIsVisible] = React.useState(false)
  const [position, setPosition] = React.useState({ x: 0, y: 0 })
  const triggerRef = React.useRef<HTMLDivElement>(null)

  const handleMouseEnter = () => {
    setIsVisible(true)
  }

  const handleMouseLeave = () => {
    setIsVisible(false)
  }

  const handleMouseMove = (e: React.MouseEvent) => {
    if (triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect()
      setPosition({
        x: rect.left + rect.width / 2,
        y: side === "top" ? rect.top - 8 : rect.bottom + 8
      })
    }
  }

  return (
    <div
      ref={triggerRef}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onMouseMove={handleMouseMove}
      className="relative inline-block"
    >
      {children}
      {isVisible && (
        <div
          className={cn(
            "fixed z-50 px-3 py-1.5 text-sm bg-popover border rounded-md shadow-md",
            "animate-in fade-in-0 zoom-in-95",
            className
          )}
          style={{
            left: position.x,
            top: position.y,
            transform: "translateX(-50%)"
          }}
        >
          {content}
        </div>
      )}
    </div>
  )
}

const TooltipTrigger = ({ children, asChild, ...props }: { children: React.ReactNode; asChild?: boolean }) => {
  return <div {...props}>{children}</div>
}

const TooltipContent = ({ children, side, className, ...props }: { children: React.ReactNode; side?: string; className?: string }) => {
  return <div className={cn(className)} {...props}>{children}</div>
}

export { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider }
