"use client"

import { useState, useEffect } from "react"
import { LoginForm } from "@/components/auth/login-form"
import { ProtectedLayout } from "@/components/layout/protected-layout"

export default function Page() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [adminData, setAdminData] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem("authToken")
    const savedAdminData = localStorage.getItem("adminData")

    console.log("[v0] Checking session - Token:", !!token, "AdminData:", !!savedAdminData)

    if (token && savedAdminData) {
      try {
        const parsedData = JSON.parse(savedAdminData)
        setAdminData(parsedData)
        setIsAuthenticated(true)
        console.log("[v0] Session restored from localStorage")
      } catch (err) {
        console.log("[v0] Failed to parse admin data:", err)
        localStorage.removeItem("authToken")
        localStorage.removeItem("adminData")
      }
    }
    setIsLoading(false)
  }, [])

  const handleLoginSuccess = (data: any) => {
    console.log("[v0] handleLoginSuccess called with:", data)
    setAdminData(data)
    setIsAuthenticated(true)
  }

  const handleLogout = () => {
    console.log("[v0] Logging out")
    localStorage.removeItem("authToken")
    localStorage.removeItem("adminData")
    setIsAuthenticated(false)
    setAdminData(null)
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
        <div className="text-white text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
          <p className="mt-4 text-lg">Loading...</p>
        </div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return <LoginForm onLoginSuccess={handleLoginSuccess} />
  }

  return <ProtectedLayout adminData={adminData} onLogout={handleLogout} />
}
