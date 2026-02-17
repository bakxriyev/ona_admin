"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Loader2 } from "lucide-react"

interface ServicesFormProps {
  service: any
  onSave: () => void
  onCancel: () => void
  setToast: (toast: any) => void
}

export function ServicesForm({ service, onSave, onCancel, setToast }: ServicesFormProps) {
  const [formData, setFormData] = useState(service || {})
  const [loading, setLoading] = useState(false)
  const [photoPreview, setPhotoPreview] = useState(service?.photo)
  const [videoPreview, setVideoPreview] = useState(service?.video)

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
      const reader = new FileReader()
      reader.onloadend = () => setVideoPreview(reader.result)
      reader.readAsDataURL(file)
    }
  }

  const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const formDataObj = new FormData()
      
      // Barcha fieldlarni FormData ga qo`shish
      if (formData.full_name) formDataObj.append("full_name", formData.full_name)
      if (formData.full_name_ru) formDataObj.append("full_name_ru", formData.full_name_ru)
      if (formData.title) formDataObj.append("title", formData.title)
      if (formData.title_ru) formDataObj.append("title_ru", formData.title_ru)
      if (formData.description) formDataObj.append("description", formData.description)
      if (formData.description_ru) formDataObj.append("description_ru", formData.description_ru)
      if (formData.about) formDataObj.append("about", formData.about)
      
      // File fieldlari
      if (formData.photo && formData.photo instanceof File) {
        formDataObj.append("photo", formData.photo)
      }
      if (formData.video && formData.video instanceof File) {
        formDataObj.append("video", formData.video)
      }

      const url = service ? `${BACKEND_URL}/services/${service.id}` : `${BACKEND_URL}/services`
      const method = service ? "PUT" : "POST"

      const response = await fetch(url, {
        method,
        body: formDataObj,
      })

      if (response.ok) {
        setToast({ message: service ? "Xizmat yangilandi" : "Xizmat yaratildi", type: "success" })
        onSave()
      } else {
        const errorData = await response.json()
        setToast({ message: errorData.message || "Xizmatni saqlashda xatolik", type: "error" })
      }
    } catch (error) {
      setToast({ message: "Xizmatni saqlashda xatolik yuz berdi", type: "error" })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
      <h2 className="text-2xl font-bold mb-4">{service ? "Xizmatni tahrirlash" : "Yangi xizmat qo`shish"}</h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* To`liq ism (O`zbekcha) */}
        <div>
          <label className="block text-sm font-medium mb-1">To`liq nomi (O`zbekcha) *</label>
          <Input
            placeholder="Masalan: Professional Massage Xizmatlari"
            value={formData.full_name || ""}
            onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
            required
          />
        </div>

        {/* To`liq ism (Ruscha) */}
        <div>
          <label className="block text-sm font-medium mb-1">Полное название (Русский) *</label>
          <Input
            placeholder="Например: Профессиональные массажные услуги"
            value={formData.full_name_ru || ""}
            onChange={(e) => setFormData({ ...formData, full_name_ru: e.target.value })}
            required
          />
        </div>

        {/* Sarlavha (O`zbekcha) */}
        <div>
          <label className="block text-sm font-medium mb-1">Sarlavha (O`zbekcha) *</label>
          <Input
            placeholder="Masalan: Massaj xizmatlari"
            value={formData.title || ""}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            required
          />
        </div>

        {/* Sarlavha (Ruscha) */}
        <div>
          <label className="block text-sm font-medium mb-1">Заголовок (Русский) *</label>
          <Input
            placeholder="Например: Массажные услуги"
            value={formData.title_ru || ""}
            onChange={(e) => setFormData({ ...formData, title_ru: e.target.value })}
            required
          />
        </div>

        {/* Tavsif (O`zbekcha) */}
        <div>
          <label className="block text-sm font-medium mb-1">Tavsif (O`zbekcha) *</label>
          <textarea
            placeholder="Xizmat haqida qisqacha ma`lumot (O`zbekcha)"
            value={formData.description || ""}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            className="w-full p-2 border rounded"
            rows={3}
            required
          />
        </div>

        {/* Tavsif (Ruscha) */}
        <div>
          <label className="block text-sm font-medium mb-1">Описание (Русский) *</label>
          <textarea
            placeholder="Краткая информация об услуге (на русском)"
            value={formData.description_ru || ""}
            onChange={(e) => setFormData({ ...formData, description_ru: e.target.value })}
            className="w-full p-2 border rounded"
            rows={3}
            required
          />
        </div>

        {/* Xizmat haqida */}
        <div>
          <label className="block text-sm font-medium mb-1">Xizmat haqida to`liq ma`lumot *</label>
          <textarea
            placeholder="Xizmat haqida batafsil ma`lumot"
            value={formData.about || ""}
            onChange={(e) => setFormData({ ...formData, about: e.target.value })}
            className="w-full p-2 border rounded"
            rows={4}
            required
          />
        </div>

        {/* Rasm */}
        <div>
          <label className="block text-sm font-medium mb-2">Rasm</label>
          <input type="file" accept="image/*" onChange={handlePhotoChange} className="block w-full" />
          {photoPreview && (
            <img
              src={(photoPreview as string) || "/placeholder.svg"}
              alt="Preview"
              className="mt-2 w-32 h-32 object-cover rounded"
            />
          )}
        </div>

        {/* Video */}
        <div>
          <label className="block text-sm font-medium mb-2">Video</label>
          <input type="file" accept="video/*" onChange={handleVideoChange} className="block w-full" />
          {videoPreview && (
            <video
              src={videoPreview as string}
              controls
              className="mt-2 w-64 h-auto rounded"
            />
          )}
        </div>

        <div className="flex gap-2">
          <Button type="submit" disabled={loading} className="bg-emerald-600 flex-1">
            {loading && <Loader2 size={18} className="mr-2 animate-spin" />}
            {service ? "Yangilash" : "Yaratish"}
          </Button>
          <Button type="button" onClick={onCancel} className="bg-gray-400 flex-1">
            Bekor qilish
          </Button>
        </div>
      </form>
    </div>
  )
}