"use client"

import { useEffect, useState } from "react"
import { Users, Stethoscope, Heart, Loader2, Briefcase, FileText, Newspaper, Shield } from "lucide-react"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"

export function Dashboard() {
  const [stats, setStats] = useState({
    totalAdmins: 0,
    totalDoctors: 0,
    totalUsers: 0,
    totalNews: 0,
    totalBlogs: 0,
    totalServices: 0,
    totalInsurance: 0,
    totalCareers: 0,
    totalDirections: 0,
  })
  const [loading, setLoading] = useState(true)
  const [chartData] = useState([
    { month: "Jan", value: 40 },
    { month: "Feb", value: 50 },
    { month: "Mar", value: 45 },
    { month: "Apr", value: 70 },
    { month: "May", value: 80 },
    { month: "Jun", value: 90 },
  ])

  useEffect(() => {
    fetchStats()
  }, [])

  const fetchStats = async () => {
    try {
      const backendUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"

      // Create all promises with timeout
      const fetchWithTimeout = (url: string, timeout = 5000) => {
        return Promise.race([
          fetch(url).then((r) => (r.ok ? r.json() : [])),
          new Promise((_, reject) => setTimeout(() => reject(new Error("Timeout")), timeout)),
        ]).catch(() => [])
      }

      // Fetch all in parallel for fast loading
      const [admins, doctors, users, news, blogs, services, insurance, careers, directions] = await Promise.all([
        fetchWithTimeout(`${backendUrl}/admin`),
        fetchWithTimeout(`${backendUrl}/doctor`),
        fetchWithTimeout(`${backendUrl}/users`),
        fetchWithTimeout(`${backendUrl}/news`),
        fetchWithTimeout(`${backendUrl}/blog`),
        fetchWithTimeout(`${backendUrl}/services`),
        fetchWithTimeout(`${backendUrl}/insurance`),
        fetchWithTimeout(`${backendUrl}/career`),
        fetchWithTimeout(`${backendUrl}/direction`),
      ])

      setStats({
        totalAdmins: Array.isArray(admins) ? admins.length : 0,
        totalDoctors: Array.isArray(doctors) ? doctors.length : 0,
        totalUsers: Array.isArray(users) ? users.length : 0,
        totalNews: Array.isArray(news) ? news.length : 0,
        totalBlogs: Array.isArray(blogs) ? blogs.length : 0,
        totalServices: Array.isArray(services) ? services.length : 0,
        totalInsurance: Array.isArray(insurance) ? insurance.length : 0,
        totalCareers: Array.isArray(careers) ? careers.length : 0,
        totalDirections: Array.isArray(directions) ? directions.length : 0,
      })

      console.log("[v0] Dashboard stats loaded successfully")
    } catch (error) {
      console.error("[v0] Error fetching dashboard stats:", error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <div className="text-center">
          <Loader2 size={48} className="animate-spin text-emerald-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  const statCards = [
    {
      label: "Active Doctors",
      value: stats.totalDoctors,
      icon: Stethoscope,
      color: "from-emerald-500 to-emerald-600",
    },
    {
      label: "Total Users",
      value: stats.totalUsers,
      icon: Users,
      color: "from-emerald-500 to-emerald-600",
    },
    {
      label: "Total Admins",
      value: stats.totalAdmins,
      icon: Shield,
      color: "from-emerald-500 to-emerald-600",
    },
    {
      label: "News Articles",
      value: stats.totalNews,
      icon: Newspaper,
      color: "from-emerald-500 to-emerald-600",
    },
    {
      label: "Blog Posts",
      value: stats.totalBlogs,
      icon: FileText,
      color: "from-emerald-500 to-emerald-600",
    },
    {
      label: "Services",
      value: stats.totalServices,
      icon: Briefcase,
      color: "from-emerald-500 to-emerald-600",
    },
    {
      label: "Insurance Plans",
      value: stats.totalInsurance,
      icon: Shield,
      color: "from-emerald-500 to-emerald-600",
    },
    {
      label: "Career Openings",
      value: stats.totalCareers,
      icon: Briefcase,
      color: "from-emerald-500 to-emerald-600",
    },
    {
      label: "Directions",
      value: stats.totalDirections,
      icon: Heart,
      color: "from-emerald-500 to-emerald-600",
    },
  ]

  return (
    <div className="p-6 lg:p-8 space-y-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center shadow-lg">
            <LayoutDashboard className="text-white" size={24} />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
            <p className="text-gray-600 text-sm">Clinic Management Overview</p>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
        {statCards.map((card, index) => {
          const Icon = card.icon
          return (
            <div
              key={index}
              className={`bg-gradient-to-br ${card.color} rounded-xl p-6 text-white shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-[1.02] cursor-pointer`}
            >
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="text-sm font-medium opacity-90 mb-2">{card.label}</p>
                  <p className="text-5xl font-bold">{card.value}</p>
                </div>
                <div className="bg-white/20 p-4 rounded-lg backdrop-blur-sm">
                  <Icon size={36} className="opacity-90" />
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Line Chart */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow-lg p-6 border border-gray-100">
          <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
            <div className="w-1 h-8 bg-emerald-500 rounded-full"></div>
            Growth Overview
          </h2>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="month" stroke="#6b7280" style={{ fontSize: "14px" }} />
              <YAxis stroke="#6b7280" style={{ fontSize: "14px" }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#fff",
                  border: "1px solid #e5e7eb",
                  borderRadius: "8px",
                  boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                }}
              />
              <Line
                type="monotone"
                dataKey="value"
                stroke="#10b981"
                strokeWidth={3}
                dot={{ fill: "#10b981", r: 6 }}
                activeDot={{ r: 8 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Calendar Widget */}
        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
          <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
            <div className="w-1 h-8 bg-emerald-500 rounded-full"></div>
            Calendar
          </h2>
          <div className="space-y-4">
            <div className="text-center">
              <p className="text-lg font-bold text-gray-900">December 2024</p>
            </div>
            <div className="grid grid-cols-7 gap-2 text-center text-xs font-medium">
              {["S", "M", "T", "W", "T", "F", "S"].map((day, i) => (
                <div key={i} className="font-bold text-gray-500 py-2">
                  {day}
                </div>
              ))}
              {Array.from({ length: 35 }).map((_, i) => {
                const day = i - 2
                return (
                  <div
                    key={i}
                    className={`py-2 rounded-lg text-sm font-medium transition-colors ${
                      day > 0 && day <= 31
                        ? day === 3
                          ? "bg-red-500 text-white font-bold shadow-md"
                          : "text-gray-700 hover:bg-emerald-50 cursor-pointer"
                        : "text-gray-300"
                    }`}
                  >
                    {day > 0 && day <= 31 ? day : ""}
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function LayoutDashboard(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect width="7" height="9" x="3" y="3" rx="1" />
      <rect width="7" height="5" x="14" y="3" rx="1" />
      <rect width="7" height="9" x="14" y="12" rx="1" />
      <rect width="7" height="5" x="3" y="16" rx="1" />
    </svg>
  )
}
