"use client"

import { useState } from "react"
import { Sidebar } from "./sidebar"
import { Header } from "./header"
import { Dashboard } from "@/components/pages/dashboard"
import { AdminManagement } from "@/components/pages/admin-management"
import { DoctorManagement } from "@/components/pages/doctor-management"
import { NewsManagement } from "@/components/pages/news-management"
import { BlogManagement } from "@/components/pages/blog-management"
import { ServicesManagement } from "@/components/pages/services-management"
import { InsuranceManagement } from "@/components/pages/insurance-management"
import { CareerManagement } from "@/components/pages/career-management"
import { DirectionManagement } from "@/components/pages/direction-management"

interface ProtectedLayoutProps {
  adminData: any
  onLogout: () => void
}

export function ProtectedLayout({ adminData, onLogout }: ProtectedLayoutProps) {
  const [currentPage, setCurrentPage] = useState("dashboard")

  const renderPage = () => {
    switch (currentPage) {
      case "dashboard":
        return <Dashboard />
      case "admin":
        return <AdminManagement />
      case "doctor":
        return <DoctorManagement />
      case "news":
        return <NewsManagement />
      case "blog":
        return <BlogManagement />
      case "services":
        return <ServicesManagement />
      case "insurance":
        return <InsuranceManagement />
      case "career":
        return <CareerManagement />
      case "direction":
        return <DirectionManagement />
      default:
        return <Dashboard />
    }
  }

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      <Sidebar currentPage={currentPage} onPageChange={setCurrentPage} adminData={adminData} onLogout={onLogout} />

      <div className="flex-1 flex flex-col overflow-hidden">
        <Header adminData={adminData} onLogout={onLogout} />

        <main className="flex-1 overflow-y-auto">{renderPage()}</main>
      </div>
    </div>
  )
}
