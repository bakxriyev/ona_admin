"use client"

import type React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Loader2, Upload, X } from "lucide-react"

interface NewsFormProps {
  news: any
  onSave: () => void
  onCancel: () => void
  setToast: (toast: any) => void
}

export function NewsForm({ news, onSave, onCancel, setToast }: NewsFormProps) {
  const [formData, setFormData] = useState(news || {})
  const [loading, setLoading] = useState(false)
  const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL 

  const [photoPreview, setPhotoPreview] = useState(news?.photo ? `${BACKEND_URL}/uploads/news/${news.photo}` : null)
  const [videoPreview, setVideoPreview] = useState(news?.video ? `${BACKEND_URL}/uploads/news/${news.video}` : null)

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const formDataObj = new FormData()

      Object.entries(formData).forEach(([key, value]) => {
        if (key !== "id" && key !== "createdAt" && key !== "updatedAt" && value) {
          if (key === "photo" || key === "video") {
            if (value instanceof File) {
              formDataObj.append(key, value)
            }
          } else {
            formDataObj.append(key, value as any)
          }
        }
      })

      const url = news ? `${BACKEND_URL}/news/${news.id}` : `${BACKEND_URL}/news`
      const method = news ? "PUT" : "POST"

      const response = await fetch(url, {
        method,
        body: formDataObj,
      })

      if (response.ok) {
        setToast({ message: news ? "News updated" : "News created", type: "success" })
        onSave()
      } else {
        setToast({ message: "Failed to save news", type: "error" })
      }
    } catch {
      setToast({ message: "Error saving news", type: "error" })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
      <h2 className="text-2xl font-bold mb-4">{news ? "Edit News" : "Add New News"}</h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          placeholder="Pastki qism yozuvi (O`zbek tilida) *"
          value={formData.title || ""}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          required
        />
        <Input
          placeholder="Pastki qism yozuvi (Rus tilida) *"
          value={formData.title_ru || ""}
          onChange={(e) => setFormData({ ...formData, title_ru: e.target.value })}
          required
        />
        <textarea
          placeholder="Pastki qism yozuvi (O`zbek tilida) *"
          value={formData.description || ""}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          className="w-full p-2 border rounded"
          rows={3}
          required
        />
        <textarea
          placeholder="Pastki qism yozuvi (Rus tilida) *"
          value={formData.description_ru || ""}
          onChange={(e) => setFormData({ ...formData, description_ru: e.target.value })}
          className="w-full p-2 border rounded"
          rows={3}
          required
        />
        <textarea
          placeholder="Matn *"
          value={formData.matn || ""}
          onChange={(e) => setFormData({ ...formData, matn: e.target.value })}
          className="w-full p-2 border rounded"
          rows={4}
          required
        />
        <textarea
          placeholder="Matn (Russian) *"
          value={formData.matn_ru || ""}
          onChange={(e) => setFormData({ ...formData, matn_ru: e.target.value })}
          className="w-full p-2 border rounded"
          rows={4}
          required
        />
        <Input
          type="date"
          placeholder="Date *"
          value={formData.date || ""}
          onChange={(e) => setFormData({ ...formData, date: e.target.value })}
          required
        />

        <div className="space-y-4">
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
            <label className="block text-sm font-medium mb-2">Photo</label>
            <div className="flex items-center gap-4">
              <Button
                type="button"
                onClick={() => document.getElementById("news-photo-upload")?.click()}
                className="bg-blue-600 hover:bg-blue-700"
              >
                <Upload className="mr-2 h-4 w-4" />
                Choose Photo
              </Button>
              <input
                id="news-photo-upload"
                type="file"
                accept="image/*"
                onChange={handlePhotoChange}
                className="hidden"
              />
              <span className="text-sm text-gray-500">
                {formData.photo instanceof File ? formData.photo.name : news?.photo || "No file selected"}
              </span>
            </div>
            {photoPreview && (
              <div className="mt-4 relative inline-block">
                <img
                  src={(photoPreview as string) || "/placeholder.svg"}
                  alt="Preview"
                  className="w-48 h-48 object-cover rounded-lg border-2 border-gray-200"
                />
                <Button
                  type="button"
                  onClick={() => {
                    setPhotoPreview(null)
                    setFormData({ ...formData, photo: null })
                  }}
                  className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 w-8 h-8 p-0 rounded-full"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            )}
          </div>

          <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
            <label className="block text-sm font-medium mb-2">Video</label>
            <div className="flex items-center gap-4">
              <Button
                type="button"
                onClick={() => document.getElementById("news-video-upload")?.click()}
                className="bg-purple-600 hover:bg-purple-700"
              >
                <Upload className="mr-2 h-4 w-4" />
                Choose Video
              </Button>
              <input
                id="news-video-upload"
                type="file"
                accept="video/*"
                onChange={handleVideoChange}
                className="hidden"
              />
              <span className="text-sm text-gray-500">
                {formData.video instanceof File ? formData.video.name : news?.video || "No file selected"}
              </span>
            </div>
            {videoPreview && (
              <div className="mt-4 relative inline-block">
                <video src={videoPreview} controls className="w-96 h-56 rounded-lg border-2 border-gray-200" />
                <Button
                  type="button"
                  onClick={() => {
                    setVideoPreview(null)
                    setFormData({ ...formData, video: null })
                  }}
                  className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 w-8 h-8 p-0 rounded-full"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            )}
          </div>
        </div>

        <div className="flex gap-2">
          <Button type="submit" disabled={loading} className="bg-emerald-600 flex-1">
            {loading && <Loader2 size={18} className="mr-2 animate-spin" />}
            {news ? "Update" : "Create"} News
          </Button>
          <Button type="button" onClick={onCancel} className="bg-gray-400 flex-1">
            Cancel
          </Button>
        </div>
      </form>
    </div>
  )
}
