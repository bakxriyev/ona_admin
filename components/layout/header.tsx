"use client"

import { Bell, Mail, ShoppingCart, Settings, LogOut, User } from "lucide-react"
import { useState } from "react"

interface HeaderProps {
  adminData: any
  onLogout: () => void
}

export function Header({ adminData, onLogout }: HeaderProps) {
  const [showMenu, setShowMenu] = useState(false)

  return (
    <header className="bg-gradient-to-br from-blue-900 to-black text-white shadow-lg">
      <div className="px-6 py-4 flex items-center justify-between">
        <div className="text-lg font-semibold">Clinic Management System</div>

        {/* Right side icons */}
        <div className="flex items-center gap-4">
          <div className="relative flex items-center gap-3">
            {/* Notification Badge */}
            

            {/* User Menu */}
            <div className="relative">
              <button
                onClick={() => setShowMenu(!showMenu)}
                className="flex items-center gap-2 hover:bg-gray-700 px-3 py-2 rounded-full transition-colors"
              >
                <div className="w-8 h-8 bg-emerald-500 rounded-full flex items-center justify-center font-bold text-sm">
                  {adminData?.full_name?.[0] || "A"}
                </div>
              </button>

              {showMenu && (
                <div className="absolute right-0 mt-2 w-48 bg-gray-700 rounded-lg shadow-lg p-2 z-50">
                  <div className="px-3 py-2 border-b border-gray-600 mb-2">
                    <p className="font-semibold">{adminData?.full_name || "Admin"}</p>
                    <p className="text-xs text-gray-400">{adminData?.email || "admin@clinic.com"}</p>
                  </div>
                  
                  <button
                    onClick={onLogout}
                    className="w-full flex items-center gap-2 px-3 py-2 hover:bg-gray-600 rounded transition-colors text-sm text-red-400 mt-2  border-gray-600 pt-2"
                  >
                    <LogOut size={16} />
                    Logout
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}
