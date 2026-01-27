"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Loader2 } from "lucide-react"

interface InsuranceFormProps {
  insurance: any
  onSave: () => void
  onCancel: () => void
  setToast: (toast: any) => void
}

export function InsuranceForm({ insurance, onSave, onCancel, setToast }: InsuranceFormProps) {
  const [formData, setFormData] = useState(insurance || {})
  const [loading, setLoading] = useState(false)
  const [photoPreview, setPhotoPreview] = useState(insurance?.photo)

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setFormData({ ...formData, photo: file })
      const reader = new FileReader()
      reader.onloadend = () => setPhotoPreview(reader.result)
      reader.readAsDataURL(file)
    }
  }
       const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const formDataObj = new FormData()
      Object.entries(formData).forEach(([key, value]) => {
        if (value) formDataObj.append(key, value as any)
      })

      const url = insurance ? `${BACKEND_URL}/insurance/${insurance.id}` : `${BACKEND_URL}/insurance`
      const method = insurance ? "PUT" : "POST"

      const response = await fetch(url, {
        method,
        body: formDataObj,
      })

      if (response.ok) {
        setToast({ message: insurance ? "Insurance updated" : "Insurance created", type: "success" })
        onSave()
      } else {
        setToast({ message: "Failed to save insurance", type: "error" })
      }
    } catch {
      setToast({ message: "Error saving insurance", type: "error" })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
      <h2 className="text-2xl font-bold mb-4">{insurance ? "Edit Insurance" : "Add New Insurance"}</h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          placeholder="Full Name"
          value={formData.full_name || ""}
          onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
        />
        <Input
          placeholder="Title (English)"
          value={formData.title || ""}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          required
        />
        <Input
          placeholder="Title (Russian)"
          value={formData.title_ru || ""}
          onChange={(e) => setFormData({ ...formData, title_ru: e.target.value })}
        />
        <textarea
          placeholder="Description (English)"
          value={formData.description || ""}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          className="w-full p-2 border rounded"
          rows={3}
        />
        <textarea
          placeholder="Description (Russian)"
          value={formData.description_ru || ""}
          onChange={(e) => setFormData({ ...formData, description_ru: e.target.value })}
          className="w-full p-2 border rounded"
          rows={3}
        />
        <textarea
          placeholder="About Insurance"
          value={formData.about_insurance || ""}
          onChange={(e) => setFormData({ ...formData, about_insurance: e.target.value })}
          className="w-full p-2 border rounded"
          rows={3}
        />
        <div>
          <label className="block text-sm font-medium mb-2">Photo</label>
          <input type="file" accept="image/*" onChange={handlePhotoChange} className="block w-full" />
          {photoPreview && (
            <img
              src={(photoPreview as string) || "/placeholder.svg"}
              alt="Preview"
              className="mt-2 w-32 h-32 object-cover rounded"
            />
          )}
        </div>

        <div className="flex gap-2">
          <Button type="submit" disabled={loading} className="bg-emerald-600 flex-1">
            {loading && <Loader2 size={18} className="mr-2 animate-spin" />}
            {insurance ? "Update" : "Create"} Insurance
          </Button>
          <Button type="button" onClick={onCancel} className="bg-gray-400 flex-1">
            Cancel
          </Button>
        </div>
      </form>
    </div>
  )
}
