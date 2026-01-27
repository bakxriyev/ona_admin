"use client"

import { useState, useEffect } from "react"
import { AlertCircle, CheckCircle, X } from "lucide-react"

interface CustomToastProps {
  message: string
  type: "success" | "error"
  onClose: () => void
  duration?: number
}

export function CustomToast({ message, type, onClose, duration = 3000 }: CustomToastProps) {
  const [isVisible, setIsVisible] = useState(true)

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false)
      onClose()
    }, duration)

    return () => clearTimeout(timer)
  }, [duration, onClose])

  if (!isVisible) return null

  const bgColor = type === "success" ? "bg-green-50 border-green-200" : "bg-red-50 border-red-200"
  const textColor = type === "success" ? "text-green-800" : "text-red-800"
  const Icon = type === "success" ? CheckCircle : AlertCircle

  return (
    <div
      className={`fixed top-4 right-4 ${bgColor} border rounded-lg shadow-lg p-4 max-w-sm z-50 animate-in slide-in-from-right-full`}
    >
      <div className="flex items-start gap-3">
        <Icon className={`w-5 h-5 flex-shrink-0 ${textColor}`} />
        <div className="flex-1">
          <p className={`text-sm font-medium ${textColor}`}>{message}</p>
        </div>
        <button onClick={() => setIsVisible(false)} className={`${textColor} hover:opacity-70`}>
          <X size={18} />
        </button>
      </div>
    </div>
  )
}
