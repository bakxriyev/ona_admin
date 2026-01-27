"use client"

import { useState, useEffect, useMemo } from "react"
import { Plus, Edit2, Trash2, Loader2, Shield, RefreshCw, Search, Grid, Table, ChevronLeft, ChevronRight, Eye, EyeOff } from "lucide-react"
import { Button } from "@/components/ui/button"
import { AdminForm } from "@/components/forms/admin-form"
import { Toast } from "@/components/ui/toast"
import { Modal } from "@/components/ui/modal"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface Admin {
  id: number
  full_name: string
  email: string
  phone_number: string
  username: string
  status?: 'active' | 'inactive'
  created_at?: string
}

export function AdminManagement() {
  const [admins, setAdmins] = useState<Admin[]>([])
  const [filteredAdmins, setFilteredAdmins] = useState<Admin[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingAdmin, setEditingAdmin] = useState<Admin | null>(null)
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null)
  
  // Yangi state'lar
  const [viewMode, setViewMode] = useState<'table' | 'grid'>('table')
  const [tableSize, setTableSize] = useState<'small' | 'medium' | 'large'>('medium')
  const [searchQuery, setSearchQuery] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(10)
  const [showInactive, setShowInactive] = useState(true)

  useEffect(() => {
    fetchAdmins()
  }, [])

  useEffect(() => {
    filterAdmins()
  }, [admins, searchQuery, showInactive])

  const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3030"

  const fetchAdmins = async () => {
    try {
      setLoading(true)
      const response = await fetch(`${BACKEND_URL}/admin`)
      if (response.ok) {
        const data = await response.json()
        setAdmins(data)
        setFilteredAdmins(data)
      }
    } catch (error) {
      setToast({ message: "Adminlarni yuklashda xatolik", type: "error" })
    } finally {
      setLoading(false)
    }
  }

  const filterAdmins = () => {
    let result = admins
    
    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      result = result.filter(admin => 
        admin.full_name.toLowerCase().includes(query) ||
        admin.email.toLowerCase().includes(query) ||
        admin.phone_number.toLowerCase().includes(query) ||
        admin.username.toLowerCase().includes(query)
      )
    }
    
    // Status filter
    if (!showInactive) {
      result = result.filter(admin => admin.status !== 'inactive')
    }
    
    setFilteredAdmins(result)
    setCurrentPage(1) // Reset to first page on filter
  }

  const handleDelete = async (id: number) => {
    if (!confirm("Ushbu adminni o'chirishni istaysizmi?")) return

    try {
      const response = await fetch(`${BACKEND_URL}/admin/${id}`, { method: "DELETE" })
      if (response.ok) {
        setAdmins(admins.filter((a) => a.id !== id))
        setToast({ message: "Admin muvaffaqiyatli o'chirildi", type: "success" })
      }
    } catch (error) {
      setToast({ message: "Adminni o'chirishda xatolik", type: "error" })
    }
  }

  const handleSave = () => {
    setShowForm(false)
    setEditingAdmin(null)
    fetchAdmins()
    setToast({ message: editingAdmin ? "Admin muvaffaqiyatli yangilandi" : "Admin muvaffaqiyatli yaratildi", type: "success" })
  }

  const handleRefresh = () => {
    fetchAdmins()
    setToast({ message: "Ma'lumotlar yangilandi", type: "success" })
  }

  // Pagination hisob-kitoblari
  const totalPages = Math.ceil(filteredAdmins.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const currentAdmins = filteredAdmins.slice(startIndex, endIndex)

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page)
    }
  }

  const getTableSizeClasses = () => {
    switch(tableSize) {
      case 'small':
        return 'text-xs py-2'
      case 'medium':
        return 'text-sm py-3'
      case 'large':
        return 'text-base py-4'
    }
  }

  // Sana formatlash
  const formatDate = (dateString?: string) => {
    if (!dateString) return '-'
    try {
      const date = new Date(dateString)
      return new Intl.DateTimeFormat('uz-UZ', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      }).format(date)
    } catch {
      return dateString
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gradient-to-br from-gray-50 to-emerald-50">
        <div className="text-center">
          <Loader2 className="animate-spin text-emerald-600 mx-auto mb-4" size={48} />
          <p className="text-gray-600">Yuklanmoqda...</p>
        </div>
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
            <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight">Adminlar Boshqaruvi</h1>
            <p className="text-gray-600 text-base mt-1">Tizim administratorlarini boshqaring</p>
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
            onClick={() => {
              setEditingAdmin(null)
              setShowForm(true)
            }}
            className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white shadow-lg hover:shadow-xl transition-all duration-200"
          >
            <Plus size={20} className="mr-2" /> Admin Qo'shish
          </Button>
        </div>
      </div>

      {/* Modal */}
      <Modal
        isOpen={showForm}
        onClose={() => setShowForm(false)}
        title={editingAdmin ? "Adminni Tahrirlash" : "Yangi Admin Qo'shish"}
        className="max-w-2xl"
      >
        <AdminForm
          admin={editingAdmin}
          onSave={handleSave}
          onCancel={() => setShowForm(false)}
          setToast={setToast}
        />
      </Modal>

      {/* Kontrol paneli */}
      <div className="bg-white rounded-2xl shadow-xl p-6 mb-8 border border-emerald-200">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <Input
              type="text"
              placeholder="Adminlarni qidirish..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 border-emerald-300 focus:border-emerald-500 focus:ring-emerald-500"
            />
          </div>

          {/* Ko'rinish rejimi */}
          <div className="flex items-center gap-4">
            <div className="flex bg-gray-100 rounded-lg p-1">
              <Button
                variant={viewMode === 'table' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('table')}
                className={`${viewMode === 'table' ? 'bg-emerald-600 text-white' : 'text-gray-600'}`}
              >
                <Table size={16} className="mr-2" /> Jadval
              </Button>
              <Button
                variant={viewMode === 'grid' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('grid')}
                className={`${viewMode === 'grid' ? 'bg-emerald-600 text-white' : 'text-gray-600'}`}
              >
                <Grid size={16} className="mr-2" /> Kartochka
              </Button>
            </div>
          </div>

          {/* O'lcham va status filter */}
          <div className="flex items-center gap-4">
            <Select value={tableSize} onValueChange={(v: 'small' | 'medium' | 'large') => setTableSize(v)}>
              <SelectTrigger className="w-32 border-emerald-300">
                <SelectValue placeholder="O'lcham" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="small">Kichik</SelectItem>
                <SelectItem value="medium">O'rta</SelectItem>
                <SelectItem value="large">Katta</SelectItem>
              </SelectContent>
            </Select>

            <Button
              variant={showInactive ? 'default' : 'outline'}
              size="sm"
              onClick={() => setShowInactive(!showInactive)}
              className={showInactive ? 'bg-emerald-600 text-white' : 'border-emerald-300 text-emerald-600'}
            >
              {showInactive ? <Eye size={16} className="mr-2" /> : <EyeOff size={16} className="mr-2" />}
              {showInactive ? 'Barchasi' : 'Faollar'}
            </Button>
          </div>

          {/* Sahifalash sozlamalari */}
          <div className="flex items-center justify-end gap-4">
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">Har sahifada:</span>
              <Select value={itemsPerPage.toString()} onValueChange={(v) => setItemsPerPage(Number(v))}>
                <SelectTrigger className="w-20 border-emerald-300">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="5">5</SelectItem>
                  <SelectItem value="10">10</SelectItem>
                  <SelectItem value="25">25</SelectItem>
                  <SelectItem value="50">50</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </div>

      {/* Natomalar statistikasi */}
      <div className="mb-6 flex justify-between items-center">
        <div className="text-sm text-gray-600">
          {filteredAdmins.length} ta admin topildi
        </div>
        <div className="text-sm text-gray-600">
          {startIndex + 1}-{Math.min(endIndex, filteredAdmins.length)} ko'rsatilmoqda
        </div>
      </div>

      {/* Jadval ko'rinishi */}
      {viewMode === 'table' ? (
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-emerald-200">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gradient-to-r from-emerald-50 to-teal-50">
                <tr>
                  <th className={`px-6 ${getTableSizeClasses()} text-left font-bold text-gray-900 uppercase tracking-wider border-r border-emerald-200`}>№</th>
                  <th className={`px-6 ${getTableSizeClasses()} text-left font-bold text-gray-900 uppercase tracking-wider border-r border-emerald-200`}>To'liq Ismi</th>
                  <th className={`px-6 ${getTableSizeClasses()} text-left font-bold text-gray-900 uppercase tracking-wider border-r border-emerald-200`}>Email</th>
                  <th className={`px-6 ${getTableSizeClasses()} text-left font-bold text-gray-900 uppercase tracking-wider border-r border-emerald-200`}>Telefon</th>
                  <th className={`px-6 ${getTableSizeClasses()} text-left font-bold text-gray-900 uppercase tracking-wider border-r border-emerald-200`}>Username</th>
                  <th className={`px-6 ${getTableSizeClasses()} text-left font-bold text-gray-900 uppercase tracking-wider border-r border-emerald-200`}>Holati</th>
                  <th className={`px-6 ${getTableSizeClasses()} text-left font-bold text-gray-900 uppercase tracking-wider border-r border-emerald-200`}>Qo'shilgan sana</th>
                  <th className={`px-6 ${getTableSizeClasses()} text-left font-bold text-gray-900 uppercase tracking-wider`}>Amallar</th>
                </tr>
              </thead>
              <tbody>
                {currentAdmins.length > 0 ? (
                  currentAdmins.map((admin, index) => (
                    <tr
                      key={admin.id}
                      className={`hover:bg-emerald-50 transition-colors duration-200 ${
                        index % 2 === 0 ? 'bg-white' : 'bg-emerald-50/30'
                      }`}
                    >
                      <td className={`px-6 ${getTableSizeClasses()} text-center text-gray-700 border-r border-emerald-100`}>
                        {startIndex + index + 1}
                      </td>
                      <td className={`px-6 ${getTableSizeClasses()} font-medium text-gray-900 border-r border-emerald-100`}>
                        {admin.full_name}
                      </td>
                      <td className={`px-6 ${getTableSizeClasses()} text-gray-700 border-r border-emerald-100`}>
                        {admin.email}
                      </td>
                      <td className={`px-6 ${getTableSizeClasses()} text-gray-700 border-r border-emerald-100`}>
                        {admin.phone_number}
                      </td>
                      <td className={`px-6 ${getTableSizeClasses()} text-gray-700 border-r border-emerald-100`}>
                        <span className="bg-emerald-100 text-emerald-800 text-xs font-medium px-2.5 py-0.5 rounded">
                          {admin.username}
                        </span>
                      </td>
                    
                      <td className={`px-6 ${getTableSizeClasses()} text-gray-700 border-r border-emerald-100`}>
                        {formatDate(admin.created_at)}
                      </td>
                      <td className={`px-6 ${getTableSizeClasses()}`}>
                        <div className="flex gap-3 justify-center">
                          <button
                            onClick={() => {
                              setEditingAdmin(admin)
                              setShowForm(true)
                            }}
                            className="text-blue-600 hover:text-blue-800 hover:bg-blue-100 p-2 rounded-lg transition-colors duration-200 border border-blue-200"
                            title="Tahrirlash"
                          >
                            <Edit2 size={18} />
                          </button>
                          <button
                            onClick={() => handleDelete(admin.id)}
                            className="text-red-600 hover:text-red-800 hover:bg-red-100 p-2 rounded-lg transition-colors duration-200 border border-red-200"
                            title="O'chirish"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={8} className="px-6 py-8 text-center text-gray-500">
                      Hech qanday admin topilmadi
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* Kartochka ko'rinishi */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {currentAdmins.map((admin) => (
            <div key={admin.id} className="bg-white rounded-2xl shadow-xl overflow-hidden border border-emerald-200 hover:shadow-2xl transition-all duration-300">
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="w-16 h-16 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center">
                    <Shield className="text-white" size={24} />
                  </div>
               
                </div>
                
                <h3 className="text-xl font-bold text-gray-900 mb-2">{admin.full_name}</h3>
                
                <div className="space-y-3 mb-6">
                  <div>
                    <p className="text-sm text-gray-500">Email</p>
                    <p className="text-gray-700">{admin.email}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Telefon</p>
                    <p className="text-gray-700">{admin.phone_number}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Username</p>
                    <p className="text-gray-700 font-medium">{admin.username}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Qo'shilgan sana</p>
                    <p className="text-gray-700">{formatDate(admin.created_at)}</p>
                  </div>
                </div>
                
                <div className="flex gap-3 pt-4 border-t border-gray-100">
                  <Button
                    onClick={() => {
                      setEditingAdmin(admin)
                      setShowForm(true)
                    }}
                    variant="outline"
                    className="flex-1 border-emerald-300 text-emerald-600 hover:bg-emerald-100"
                  >
                    <Edit2 size={16} className="mr-2" /> Tahrirlash
                  </Button>
                  <Button
                    onClick={() => handleDelete(admin.id)}
                    variant="outline"
                    className="flex-1 border-red-300 text-red-600 hover:bg-red-100"
                  >
                    <Trash2 size={16} className="mr-2" /> O'chirish
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-8 flex items-center justify-between">
          <div className="text-sm text-gray-600">
            Sahifa {currentPage} / {totalPages}
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="border-emerald-300 text-emerald-600 hover:bg-emerald-100"
            >
              <ChevronLeft size={16} className="mr-1" /> Oldingi
            </Button>
            
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              let pageNum
              if (totalPages <= 5) {
                pageNum = i + 1
              } else if (currentPage <= 3) {
                pageNum = i + 1
              } else if (currentPage >= totalPages - 2) {
                pageNum = totalPages - 4 + i
              } else {
                pageNum = currentPage - 2 + i
              }
              
              return (
                <Button
                  key={pageNum}
                  variant={currentPage === pageNum ? "default" : "outline"}
                  size="sm"
                  onClick={() => handlePageChange(pageNum)}
                  className={`${
                    currentPage === pageNum 
                      ? 'bg-emerald-600 text-white' 
                      : 'border-emerald-300 text-emerald-600 hover:bg-emerald-100'
                  }`}
                >
                  {pageNum}
                </Button>
              )
            })}
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="border-emerald-300 text-emerald-600 hover:bg-emerald-100"
            >
              Keyingi <ChevronRight size={16} className="ml-1" />
            </Button>
          </div>
        </div>
      )}

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  )
}