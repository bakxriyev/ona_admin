"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Loader2 } from "lucide-react"

interface CareerFormProps {
  career: any
  onSave: () => void
  onCancel: () => void
  setToast: (toast: any) => void
}

export function CareerForm({ career, onSave, onCancel, setToast }: CareerFormProps) {
  const [formData, setFormData] = useState(career || {})
  const [loading, setLoading] = useState(false)
  const [photoPreview, setPhotoPreview] = useState(career?.photo)
  const [videoPreview, setVideoPreview] = useState(career?.video)

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setFormData({ ...formData, photo: file })
      const reader = new FileReader()
      reader.onloadend = () => setPhotoPreview(reader.result)
      reader.readAsDataURL(file)
    }
  }

  const handleVideoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setFormData({ ...formData, video: file })
      setVideoPreview(URL.createObjectURL(file))
    }
  }

  const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const formDataObj = new FormData()
      Object.entries(formData).forEach(([key, value]) => {
        if (key !== "id" && key !== "createdAt" && key !== "updatedAt" && value) {
          formDataObj.append(key, value as any)
        }
      })

      const url = career ? `${BACKEND_URL}/career/${career.id}` : `${BACKEND_URL}/career`
      const method = career ? "PUT" : "POST"

      const response = await fetch(url, {
        method,
        body: formDataObj,
      })

      if (response.ok) {
        setToast({ message: career ? "Career updated" : "Career created", type: "success" })
        onSave()
      } else {
        setToast({ message: "Failed to save career", type: "error" })
      }
    } catch {
      setToast({ message: "Error saving career", type: "error" })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
      <h2 className="text-2xl font-bold mb-4">{career ? "Edit Career" : "Add New Career"}</h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          placeholder="Title (English) *"
          value={formData.title || ""}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          required
        />
        <Input
          placeholder="Title (Russian) *"
          value={formData.title_ru || ""}
          onChange={(e) => setFormData({ ...formData, title_ru: e.target.value })}
          required
        />
        <textarea
          placeholder="Description (English) *"
          value={formData.description || ""}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          className="w-full p-2 border rounded"
          rows={3}
          required
        />
        <textarea
          placeholder="Description (Russian) *"
          value={formData.description_ru || ""}
          onChange={(e) => setFormData({ ...formData, description_ru: e.target.value })}
          className="w-full p-2 border rounded"
          rows={3}
          required
        />
        <Input
          placeholder="Vacancy *"
          value={formData.vacancy || ""}
          onChange={(e) => setFormData({ ...formData, vacancy: e.target.value })}
          required
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
        <div>
          <label className="block text-sm font-medium mb-2">Video</label>
          <input type="file" accept="video/*" onChange={handleVideoChange} className="block w-full" />
          {videoPreview && <video src={videoPreview} controls className="mt-2 w-64 h-32 rounded" />}
        </div>

        <div className="flex gap-2">
          <Button type="submit" disabled={loading} className="bg-emerald-600 flex-1">
            {loading && <Loader2 size={18} className="mr-2 animate-spin" />}
            {career ? "Update" : "Create"} Career
          </Button>
          <Button type="button" onClick={onCancel} className="bg-gray-400 flex-1">
            Cancel
          </Button>
        </div>
      </form>
    </div>
  )
}
