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
  const timeoutRef = React.useRef<ReturnType<typeof setTimeout> | undefined>(undefined)

  const handleMouseEnter = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }
    setIsVisible(true)
  }

  const handleMouseLeave = () => {
    timeoutRef.current = setTimeout(() => {
      setIsVisible(false)
    }, 100)
  }

  const handleMouseMove = (e: React.MouseEvent) => {
    if (triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect()
      setPosition({
        x: rect.left + rect.width / 2,
        y: side === "top" ? rect.top - 12 : rect.bottom + 12
      })
    }
  }

  React.useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [])

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
            "fixed z-[9999] px-3 py-2 text-sm bg-popover border rounded-md shadow-lg",
            "animate-in fade-in-0 zoom-in-95 duration-150",
            "pointer-events-none",
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

const TooltipTrigger = ({ children, ...props }: { children: React.ReactNode }) => {
  return <div {...props}>{children}</div>
}

const TooltipContent = ({ children, className, ...props }: { children: React.ReactNode; className?: string }) => {
  return <div className={cn(className)} {...props}>{children}</div>
}

export { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider }
