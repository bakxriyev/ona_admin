"use client"

import { useState, useEffect } from "react"
import { Plus, Edit2, Trash2, Loader2, Shield } from "lucide-react"
import { Button } from "@/components/ui/button"
import { AdminForm } from "@/components/forms/admin-form"
import { Toast } from "@/components/ui/toast"
import { Modal } from "@/components/ui/modal"

interface Admin {
  id: number
  full_name: string
  email: string
  phone_number: string
  username: string
}

export function AdminManagement() {
  const [admins, setAdmins] = useState<Admin[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingAdmin, setEditingAdmin] = useState<Admin | null>(null)
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null)

  useEffect(() => {
    fetchAdmins()
  }, [])

  const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3030"

  const fetchAdmins = async () => {
    try {
      setLoading(true)
      const response = await fetch(`${BACKEND_URL}/admin`)
      if (response.ok) {
        const data = await response.json()
        setAdmins(data)
      }
    } catch (error) {
      setToast({ message: "Failed to load admins", type: "error" })
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this admin?")) return

    try {
      const response = await fetch(`${BACKEND_URL}/admin/${id}`, { method: "DELETE" })
      if (response.ok) {
        setAdmins(admins.filter((a) => a.id !== id))
        setToast({ message: "Admin deleted successfully", type: "success" })
      }
    } catch (error) {
      setToast({ message: "Failed to delete admin", type: "error" })
    }
  }

  const handleSave = () => {
    setShowForm(false)
    setEditingAdmin(null)
    fetchAdmins()
    setToast({ message: editingAdmin ? "Admin updated successfully" : "Admin created successfully", type: "success" })
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="animate-spin" />
      </div>
    )
  }

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      <div className="flex justify-between items-center mb-8">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center">
            <Shield className="text-white" size={24} />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Admin Management</h1>
            <p className="text-gray-600 text-sm">Manage system administrators</p>
          </div>
        </div>
        <Button
          onClick={() => {
            setEditingAdmin(null)
            setShowForm(true)
          }}
          className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white shadow-lg hover:shadow-xl transition-all"
        >
          <Plus size={20} className="mr-2" /> Add Admin
        </Button>
      </div>

      <Modal isOpen={showForm} onClose={() => setShowForm(false)} title={editingAdmin ? "Edit Admin" : "Add New Admin"}>
        <AdminForm admin={editingAdmin} onSave={handleSave} onCancel={() => setShowForm(false)} setToast={setToast} />
      </Modal>

      <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-200">
        <table className="w-full">
          <thead className="bg-gradient-to-r from-gray-50 to-gray-100 border-b-2 border-emerald-500">
            <tr>
              <th className="px-6 py-4 text-left text-sm font-bold text-gray-900">Name</th>
              <th className="px-6 py-4 text-left text-sm font-bold text-gray-900">Email</th>
              <th className="px-6 py-4 text-left text-sm font-bold text-gray-900">Phone</th>
              <th className="px-6 py-4 text-left text-sm font-bold text-gray-900">Username</th>
              <th className="px-6 py-4 text-left text-sm font-bold text-gray-900">Actions</th>
            </tr>
          </thead>
          <tbody>
            {admins.map((admin, index) => (
              <tr
                key={admin.id}
                className={`border-b hover:bg-emerald-50 transition-colors ${index % 2 === 0 ? "bg-white" : "bg-gray-50/50"}`}
              >
                <td className="px-6 py-4 font-medium text-gray-900">{admin.full_name}</td>
                <td className="px-6 py-4 text-gray-700">{admin.email}</td>
                <td className="px-6 py-4 text-gray-700">{admin.phone_number}</td>
                <td className="px-6 py-4 text-gray-700">{admin.username}</td>
                <td className="px-6 py-4 flex gap-3">
                  <button
                    onClick={() => {
                      setEditingAdmin(admin)
                      setShowForm(true)
                    }}
                    className="text-blue-600 hover:text-blue-800 hover:bg-blue-50 p-2 rounded-lg transition-colors"
                  >
                    <Edit2 size={18} />
                  </button>
                  <button
                    onClick={() => handleDelete(admin.id)}
                    className="text-red-600 hover:text-red-800 hover:bg-red-50 p-2 rounded-lg transition-colors"
                  >
                    <Trash2 size={18} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  )
}
