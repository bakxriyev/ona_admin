"use client"

import type React from "react"
import { useState } from "react"
import { Mail, Lock, Eye, EyeOff, Loader2, AlertCircle, CheckCircle } from "lucide-react"

interface LoginFormProps {
  onLoginSuccess: (data: any) => void
}

export function LoginForm({ onLoginSuccess }: LoginFormProps) {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

  const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setSuccess("")
    setLoading(true)

    try {
      console.log("[v0] Starting login request with email:", email)

      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 10000)

      const response = await fetch(`${BACKEND_URL}/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
        signal: controller.signal,
      })

      clearTimeout(timeoutId)
      console.log("[v0] Response status:", response.status)

      if (!response.ok) {
        let errorData
        try {
          errorData = await response.json()
        } catch {
          errorData = { error: `HTTP ${response.status}: ${response.statusText}` }
        }
        console.log("[v0] Error response:", errorData)
        throw new Error(errorData.error || errorData.message || "Invalid email or password")
      }

      const data = await response.json()
      console.log("[v0] Login successful, response data:", data)

      const token = data.token || data.access_token || data.accessToken || "admin_token"
      localStorage.setItem("authToken", token)
      localStorage.setItem("adminData", JSON.stringify(data))
      console.log("[v0] Saved auth data to localStorage")

      setSuccess("Login successful! Redirecting...")
      setTimeout(() => {
        console.log("[v0] Calling onLoginSuccess")
        onLoginSuccess(data)
      }, 300)
    } catch (err) {
      console.log("[v0] Login error:", err)
      if (err instanceof Error && err.name === "AbortError") {
        setError("Request timeout - backend not responding. Check if backend is running.")
      } else {
        setError(err instanceof Error ? err.message : "Login failed")
      }
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 relative overflow-hidden">
      <div className="relative z-10 w-full px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
            {/* Left side - Healthcare image and branding */}
            <div className="hidden lg:flex flex-col justify-center items-center ">
              <img src="/logo.jpg" alt="Healthcare professional" className="w-full h-full object-cover rounded-3xl" />

              <div className="mt-8 text-center">
                <div className="flex items-center justify-center gap-2 mb-4">
                
                  <span className="text-2xl font-bold text-white mb-24">"SOG`LOM ONA BOLA" CLINIC</span>
                </div>
               
              </div>
            </div>

            {/* Right side - Login form */}
            <div className="order-1 lg:order-2">
              <div className="bg-white/10 backdrop-blur-xl rounded-3xl p-8 sm:p-10 shadow-2xl border border-white/20">
                {/* Mobile logo */}
                <div className="lg:hidden mb-8 text-center">
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <span className="text-xl font-bold text-white">ONA BOLA CLINIC</span>
                  </div>
                </div>

                <div className="text-center mb-8">
                  <h1 className="text-3xl sm:text-4xl font-bold text-white mb-2">Login</h1>
                  <p className="text-gray-300">Log in to your admin account</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Email field */}
                  <div className="relative">
                    <label className="block text-sm font-semibold text-gray-200 mb-2">Email Address</label>
                    <div className="relative">
                      <Mail className="absolute left-4 top-3.5 w-5 h-5 text-gray-400" />
                      <input
                        type="email"
                        placeholder="Enter your email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        disabled={loading}
                        required
                        className="w-full pl-12 pr-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                      />
                    </div>
                  </div>

                  {/* Password field */}
                  <div className="relative">
                    <label className="block text-sm font-semibold text-gray-200 mb-2">Password</label>
                    <div className="relative">
                      <Lock className="absolute left-4 top-3.5 w-5 h-5 text-gray-400" />
                      <input
                        type={showPassword ? "text" : "password"}
                        placeholder="Enter your password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        disabled={loading}
                        required
                        className="w-full pl-12 pr-12 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        disabled={loading}
                        className="absolute right-4 top-3.5 text-gray-400 hover:text-gray-300 transition-colors disabled:opacity-50"
                      >
                        {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                      </button>
                    </div>
                  </div>

                  {/* Forgot password link */}
              

                  {/* Error message */}
                  {error && (
                    <div className="flex items-center gap-3 p-4 bg-red-500/20 border border-red-500/50 rounded-lg text-red-200 animate-in fade-in slide-in-from-top-2">
                      <AlertCircle size={20} className="flex-shrink-0" />
                      <span className="text-sm font-medium">{error}</span>
                    </div>
                  )}

                  {/* Success message */}
                  {success && (
                    <div className="flex items-center gap-3 p-4 bg-green-500/20 border border-green-500/50 rounded-lg text-green-200 animate-in fade-in slide-in-from-top-2">
                      <CheckCircle size={20} className="flex-shrink-0" />
                      <span className="text-sm font-medium">{success}</span>
                    </div>
                  )}

                  {/* Login button */}
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3 px-4 bg-gradient-to-r from-blue-500 to-teal-500 hover:from-blue-600 hover:to-teal-600 text-white font-semibold rounded-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg hover:shadow-xl transform hover:scale-105 active:scale-95"
                  >
                    {loading ? (
                      <>
                        <Loader2 size={20} className="animate-spin" />
                        <span>Signing in...</span>
                      </>
                    ) : (
                      <>
                        <span>Log In</span>
                      </>
                    )}
                  </button>
                </form>

                {/* Footer note */}
                <p className="mt-8 text-center text-gray-400 text-sm">
                  This is an admin-only panel. Contact your administrator for access.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes blob {
          0%, 100% {
            transform: translate(0, 0) scale(1);
          }
          33% {
            transform: translate(30px, -50px) scale(1.1);
          }
          66% {
            transform: translate(-20px, 20px) scale(0.9);
          }
        }

        .animate-blob {
          animation: blob 7s infinite;
        }

        .animation-delay-2000 {
          animation-delay: 2s;
        }

        .animation-delay-4000 {
          animation-delay: 4s;
        }

        @media (prefers-reduced-motion: reduce) {
          .animate-blob {
            animation: none;
          }
        }
      `}</style>
    </div>
  )
}
