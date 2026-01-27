"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Loader2 } from "lucide-react"

interface AdminFormProps {
  admin: any
  onSave: () => void
  onCancel: () => void
  setToast: (toast: any) => void
}

export function AdminForm({ admin, onSave, onCancel, setToast }: AdminFormProps) {
  const [formData, setFormData] = useState(admin || {})
  const [loading, setLoading] = useState(false)

  const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const dataToSend = { ...formData }

      delete dataToSend.id
      delete dataToSend.createdAt
      delete dataToSend.updatedAt

      if (dataToSend.phone_number) {
        dataToSend.phone_number = Number(dataToSend.phone_number)
      }

      const url = admin ? `${BACKEND_URL}/admin/${admin.id}` : `${BACKEND_URL}/admin`
      const method = admin ? "PUT" : "POST"

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(dataToSend),
      })

      if (response.ok) {
        setToast({ message: admin ? "Admin updated" : "Admin created", type: "success" })
        onSave()
      } else {
        setToast({ message: "Failed to save admin", type: "error" })
      }
    } catch {
      setToast({ message: "Error saving admin", type: "error" })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
      <h2 className="text-2xl font-bold mb-4">{admin ? "Edit Admin" : "Add New Admin"}</h2>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input
          placeholder="Full Name *"
          value={formData.full_name || ""}
          onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
          required
        />
        <Input
          type="email"
          placeholder="Email *"
          value={formData.email || ""}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          required
        />
        <Input
          type="number"
          placeholder="Phone Number"
          value={formData.phone_number || ""}
          onChange={(e) => setFormData({ ...formData, phone_number: e.target.value })}
        />
        <Input
          placeholder="Username *"
          value={formData.username || ""}
          onChange={(e) => setFormData({ ...formData, username: e.target.value })}
          required
        />
        <Input
          placeholder="Role"
          value={formData.role || ""}
          onChange={(e) => setFormData({ ...formData, role: e.target.value })}
        />
        {!admin && (
          <Input
            type="password"
            placeholder="Password *"
            value={formData.password || ""}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            required
          />
        )}

        <div className="md:col-span-2 flex gap-2">
          <Button type="submit" disabled={loading} className="bg-emerald-600 flex-1">
            {loading && <Loader2 size={18} className="mr-2 animate-spin" />}
            {admin ? "Update" : "Create"} Admin
          </Button>
          <Button type="button" onClick={onCancel} className="bg-gray-400 flex-1">
            Cancel
          </Button>
        </div>
      </form>
    </div>
  )
}
