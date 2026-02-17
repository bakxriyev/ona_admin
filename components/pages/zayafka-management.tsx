"use client"

import { useState, useEffect } from "react"
import { Plus, Edit2, Trash2, Loader2, Shield, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { AdminForm } from "@/components/forms/admin-form"
import { Toast } from "@/components/ui/toast"
import { Modal } from "@/components/ui/modal"

function Pagination({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <nav className={`flex items-center gap-2 ${className}`}>{children}</nav>
}

function PaginationPrevious({ onClick, disabled, className = "" }: { onClick: () => void; disabled: boolean; className?: string }) {
  return (
    <Button variant="outline" onClick={onClick} disabled={disabled} className={`border-emerald-300 text-emerald-600 hover:bg-emerald-100 ${className}`}>
      Oldingi
    </Button>
  )
}

function PaginationNext({ onClick, disabled, className = "" }: { onClick: () => void; disabled: boolean; className?: string }) {
  return (
    <Button variant="outline" onClick={onClick} disabled={disabled} className={`border-emerald-300 text-emerald-600 hover:bg-emerald-100 ${className}`}>
      Keyingi
    </Button>
  )
}

function PaginationItem({ children, active, onClick, className = "" }: { children: React.ReactNode; active: boolean; onClick: () => void; className?: string }) {
  return (
    <Button
      variant={active ? "default" : "outline"}
      onClick={onClick}
      className={`${active ? "bg-emerald-600 text-white hover:bg-emerald-700" : "border-emerald-300 text-emerald-600 hover:bg-emerald-100"} ${className}`}
    >
      {children}
    </Button>
  )
}

interface User {
  id: number
  full_name: string
  department: string
  phone_number: string
  message: string
  appointment_date: string
  appointment_time: string
  photo: string
  doctor_name: string
}

interface ApiResponse {
  data: User[]
  meta: {
    total: number
    page: number
    limit: number
    totalPages: number
  }
}

export function UserManagement() {
  const [users, setUsers] = useState<User[]>([])
  const [totalPages, setTotalPages] = useState(1)
  const [currentPage, setCurrentPage] = useState(1)
  const [limit] = useState(10)
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingUser, setEditingUser] = useState<User | null>(null)
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null)

  const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3030"

  useEffect(() => {
    fetchUsers()
  }, [currentPage])

  const fetchUsers = async () => {
    try {
      setLoading(true)
      const response = await fetch(`${BACKEND_URL}/users?page=${currentPage}&limit=${limit}`)
      if (response.ok) {
        const data: ApiResponse = await response.json()
        setUsers(data.data || [])
        setTotalPages(data.meta.totalPages || 1)
      } else {
        throw new Error("Failed to fetch users")
      }
    } catch (error) {
      setToast({ message: "Foydalanuvchilarni yuklashda xatolik", type: "error" })
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: number) => {
    if (!confirm("Ushbu foydalanuvchini o'chirishni istaysizmi?")) return
    try {
      const response = await fetch(`${BACKEND_URL}/users/${id}`, { method: "DELETE" })
      if (response.ok) {
        fetchUsers()
        setToast({ message: "Foydalanuvchi muvaffaqiyatli o'chirildi", type: "success" })
      } else {
        throw new Error("Failed to delete user")
      }
    } catch (error) {
      setToast({ message: "Foydalanuvchini o'chirishda xatolik", type: "error" })
    }
  }

  const handleSave = () => {
    setShowForm(false)
    setEditingUser(null)
    fetchUsers()
    setToast({
      message: editingUser ? "Foydalanuvchi muvaffaqiyatli yangilandi" : "Foydalanuvchi muvaffaqiyatli yaratildi",
      type: "success",
    })
  }

  const handleRefresh = () => {
    fetchUsers()
    setToast({ message: "Ma'lumotlar yangilandi", type: "success" })
  }

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page)
    }
  }

  // ✅ To'g'ri sana formatlash - "2025-02-18" → "18 Fevral 2025"
  const formatDate = (dateString: string) => {
    if (!dateString) return "-"
    try {
      const cleanDate = dateString.split("T")[0] // ISO bo'lsa T dan oldingi qism
      const [year, month, day] = cleanDate.split("-")
      const months = [
        "Yanvar", "Fevral", "Mart", "Aprel", "May", "Iyun",
        "Iyul", "Avgust", "Sentabr", "Oktabr", "Noyabr", "Dekabr",
      ]
      return `${parseInt(day)} ${months[parseInt(month) - 1]} ${year}`
    } catch {
      return dateString
    }
  }

  // ✅ To'g'ri vaqt formatlash - "14:30" yoki "14:30:00" → "14:30"
  const formatTime = (timeString: string) => {
    if (!timeString) return "-"
    try {
      // Oddiy "14:30" yoki "14:30:00" format
      if (!timeString.includes("T")) {
        return timeString.slice(0, 5)
      }
      // ISO format bo'lsa UTC bilan olish
      const date = new Date(timeString)
      const hours = String(date.getUTCHours()).padStart(2, "0")
      const minutes = String(date.getUTCMinutes()).padStart(2, "0")
      return `${hours}:${minutes}`
    } catch {
      return timeString
    }
  }

  const getRowNumber = (index: number) => (currentPage - 1) * limit + index + 1

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <Loader2 className="animate-spin text-emerald-600" size={48} />
      </div>
    )
  }

  return (
    <div className="p-8 bg-gradient-to-br from-gray-50 to-emerald-50 min-h-screen">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl flex items-center justify-center shadow-lg">
            <Shield className="text-white" size={32} />
          </div>
          <div>
            <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight">Foydalanuvchilarni Boshqarish</h1>
            <p className="text-gray-600 text-base mt-1">Tizim foydalanuvchilarini samarali boshqaring</p>
          </div>
        </div>
        <div className="flex gap-4">
          <Button
            onClick={handleRefresh}
            variant="outline"
            className="border-emerald-600 text-emerald-600 hover:bg-emerald-100 hover:text-emerald-700 shadow-md transition-all duration-200"
          >
            <RefreshCw size={20} className="mr-2" /> Yangilash
          </Button>
          <Button
            onClick={() => { setEditingUser(null); setShowForm(true) }}
            className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white shadow-lg hover:shadow-xl transition-all duration-200"
          >
            <Plus size={20} className="mr-2" /> Zayafka Qo'shish
          </Button>
        </div>
      </div>

      {/* Modal */}
      <Modal
        isOpen={showForm}
        onClose={() => setShowForm(false)}
        title={editingUser ? "Foydalanuvchini Tahrirlash" : "Yangi Foydalanuvchi Qo'shish"}
        className="max-w-2xl"
      >
        <AdminForm
          admin={editingUser}
          onSave={handleSave}
          onCancel={() => setShowForm(false)}
          setToast={setToast}
        />
      </Modal>

      {/* Table */}
      <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-emerald-200">
        <div className="overflow-x-auto">
          <table className="w-full divide-y divide-gray-200">
            <thead className="bg-gradient-to-r from-emerald-50 to-teal-50">
              <tr>
                {["№", "To'liq Ismi", "Bo'lim", "Telefon Raqami", "Shifokor", "Xabar", "Qabul Sanasi", "Qabul Vaqti", "Amallar"].map(
                  (header, i) => (
                    <th
                      key={i}
                      className="px-6 py-4 text-left text-sm font-bold text-gray-900 uppercase tracking-wider border-r border-gray-200 last:border-r-0"
                    >
                      {header}
                    </th>
                  )
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {users.length > 0 ? (
                users.map((user, index) => (
                  <tr
                    key={user.id}
                    className={`hover:bg-emerald-50 transition-colors duration-200 ${index % 2 === 0 ? "bg-white" : "bg-emerald-50/30"}`}
                  >
                    <td className="px-6 py-4 text-center font-medium text-gray-700 border-r border-gray-200">
                      {getRowNumber(index)}
                    </td>
                    <td className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap border-r border-gray-200">
                      {user.full_name}
                    </td>
                    <td className="px-6 py-4 text-gray-700 whitespace-nowrap border-r border-gray-200">
                      {user.department}
                    </td>
                    <td className="px-6 py-4 text-gray-700 whitespace-nowrap border-r border-gray-200">
                      {user.phone_number}
                    </td>
                    <td className="px-6 py-4 text-gray-700 whitespace-nowrap border-r border-gray-200">
                      {user.doctor_name || "-"}
                    </td>
                    <td className="px-6 py-4 text-gray-700 max-w-xs border-r border-gray-200">
                      <div className="truncate" title={user.message}>
                        {user.message || "-"}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-gray-700 whitespace-nowrap border-r border-gray-200">
                      {formatDate(user.appointment_date)}
                    </td>
                    <td className="px-6 py-4 text-gray-700 whitespace-nowrap border-r border-gray-200">
                      {formatTime(user.appointment_time)}
                    </td>
                    <td className="px-6 py-4 flex gap-3 justify-center">
                      <button
                        onClick={() => { setEditingUser(user); setShowForm(true) }}
                        className="text-blue-600 hover:text-blue-800 hover:bg-blue-100 p-2 rounded-lg transition-colors duration-200 border border-blue-200"
                        title="Tahrirlash"
                      >
                        <Edit2 size={18} />
                      </button>
                      <button
                        onClick={() => handleDelete(user.id)}
                        className="text-red-600 hover:text-red-800 hover:bg-red-100 p-2 rounded-lg transition-colors duration-200 border border-red-200"
                        title="O'chirish"
                      >
                        <Trash2 size={18} />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={9} className="px-6 py-8 text-center text-gray-500">
                    Hech qanday foydalanuvchi topilmadi. Boshlash uchun yangi foydalanuvchi qo'shing.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      <div className="mt-8 flex justify-center">
        <Pagination>
          <PaginationPrevious onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage === 1} />
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
            <PaginationItem key={page} active={page === currentPage} onClick={() => handlePageChange(page)}>
              {page}
            </PaginationItem>
          ))}
          <PaginationNext onClick={() => handlePageChange(currentPage + 1)} disabled={currentPage === totalPages} />
        </Pagination>
      </div>

      {/* Stats */}
      <div className="mt-6 flex justify-between items-center text-sm text-gray-600">
        <div className="bg-white px-4 py-2 rounded-lg border border-emerald-200">
          Jami: <span className="font-bold">{totalPages * limit}</span> ta foydalanuvchi
        </div>
        <div className="bg-white px-4 py-2 rounded-lg border border-emerald-200">
          {`${(currentPage - 1) * limit + 1}-${Math.min(currentPage * limit, totalPages * limit)}`} ko'rsatilmoqda
        </div>
        <div className="bg-white px-4 py-2 rounded-lg border border-emerald-200">
          Sahifa: <span className="font-bold">{currentPage}</span> / {totalPages}
        </div>
      </div>

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  )
}