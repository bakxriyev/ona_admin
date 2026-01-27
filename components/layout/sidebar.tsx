"use client"

import {
  LayoutDashboard,
  Stethoscope,
  Newspaper,
  BookOpen,
  Briefcase,
  Shield,
  Compass,
  LogOut,
  User,
  ChevronLeft,
  ChevronRight,
} from "lucide-react"
import { useState } from "react"

interface SidebarProps {
  currentPage: string
  onPageChange: (page: string) => void
  adminData: any
  onLogout: () => void
}

export function Sidebar({
  currentPage,
  onPageChange,
  adminData,
  onLogout,
}: SidebarProps) {
  const [collapsed, setCollapsed] = useState(false)

  const menuItems = [
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
    { id: "admin", label: "Admin", icon: Shield },
    { id: "doctor", label: "Doctors", icon: Stethoscope },
    { id: "news", label: "News", icon: Newspaper },
    { id: "blog", label: "Blog", icon: BookOpen },
    { id: "services", label: "Services", icon: Briefcase },
    { id: "insurance", label: "Insurance", icon: Shield },
    { id: "career", label: "Careers", icon: Briefcase },
    { id: "direction", label: "Directions", icon: Compass },
    { id: "zayafka", label: "Zayafkalar", icon: User },
  ]

  return (
    <div
      className={`bg-gradient-to-br from-blue-900 to-indigo-900 text-white transition-all duration-300 ${
        collapsed ? "w-20" : "w-72"
      } flex flex-col min-h-screen`}
    >
      {/* ===== HEADER ===== */}
      <div className="relative p-4 border-b border-indigo-700 flex items-center">
        
        {/* Logo + text */}
        <div className="flex items-center gap-3 overflow-hidden">
          {/* LOGO */}
          <img
            src="/logo.jpg"
            alt="Logo"
            className={`
              transition-all duration-300
              ${collapsed ? "w-10 h-10 mx-auto" : "w-14 h-14"}
              object-contain
              brightness-0 invert
            `}
          />

          {/* Text */}
          {!collapsed && (
            <div className="leading-tight">
              <p className="text-sm font-bold">ADMIN</p>
              <p className="text-xs text-indigo-300">Dashboard</p>
            </div>
          )}
        </div>

        {/* COLLAPSE BUTTON – doim ko‘rinadi */}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="absolute -right-3 top-1/2 -translate-y-1/2 bg-indigo-800 hover:bg-indigo-700 p-1.5 rounded-full shadow-lg"
        >
          {collapsed ? (
            <ChevronRight size={20} />
          ) : (
            <ChevronLeft size={20} />
          )}
        </button>
      </div>

      {/* ===== NAV ===== */}
      <nav className="flex-1 p-3 space-y-2">
        {menuItems.map((item) => {
          const Icon = item.icon
          const isActive = currentPage === item.id

          return (
            <button
              key={item.id}
              onClick={() => onPageChange(item.id)}
              className={`w-full flex items-center gap-4 px-4 py-3 rounded-xl transition ${
                isActive
                  ? "bg-gradient-to-r from-cyan-500 to-blue-600 shadow-md"
                  : "hover:bg-indigo-800"
              }`}
            >
              <Icon size={22} />
              {!collapsed && (
                <span className="text-sm font-medium">{item.label}</span>
              )}
            </button>
          )
        })}
      </nav>

      {/* ===== LOGOUT ===== */}
      <div className="p-4 border-t border-indigo-700">
        <button
          onClick={onLogout}
          className="w-full flex items-center gap-4 px-4 py-3 rounded-xl hover:bg-red-700 transition"
        >
          <LogOut size={22} />
          {!collapsed && <span className="text-sm font-medium">Logout</span>}
        </button>
      </div>
    </div>
  )
}
