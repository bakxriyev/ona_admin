"use client"

import type React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Loader2, X } from "lucide-react"

interface ServiceDetailFormProps {
  serviceId: number
  detail: any
  onSave: () => void
  onCancel: () => void
  setToast: (toast: any) => void
}

export function ServiceDetailForm({ serviceId, detail, onSave, onCancel, setToast }: ServiceDetailFormProps) {
  const [formData, setFormData] = useState(
    detail || {
      service_id: Number(serviceId),
      title: "",
      title_ru: "",
      price: "",
      price_ru: "",
      about: "",
      about_ru: "",
    }
  )
  const [loading, setLoading] = useState(false)

  const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const url = detail
        ? `${BACKEND_URL}/service-details/${detail.id}`
        : `${BACKEND_URL}/service-details`
      const method = detail ? "PATCH" : "POST"

      const submitData = detail
        ? {
            title: formData.title || "",
            title_ru: formData.title_ru || "",
            price: formData.price || "",
            price_ru: formData.price_ru || "",
            about: formData.about || "",
            about_ru: formData.about_ru || "",
          }
        : {
            service_id: Number(serviceId),
            title: formData.title || "",
            title_ru: formData.title_ru || "",
            price: formData.price || "",
            price_ru: formData.price_ru || "",
            about: formData.about || "",
            about_ru: formData.about_ru || "",
          }

      console.log("Yuborilayotgan ma'lumotlar:", submitData)

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(submitData),
      })

      if (response.ok) {
        setToast({ message: detail ? "Detail yangilandi" : "Detail qo'shildi", type: "success" })
        onSave()
      } else {
        const errorData = await response.json()
        console.error("Backend xatosi:", errorData)
        setToast({ message: errorData.message || "Xatolik yuz berdi", type: "error" })
      }
    } catch (error) {
      console.error("Saqlashda xatolik:", error)
      setToast({ message: "Saqlashda xatolik", type: "error" })
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 transition-opacity"
        onClick={onCancel}
      />

      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
        <div
          className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto pointer-events-auto"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="sticky top-0 bg-gradient-to-r from-emerald-600 to-teal-600 text-white p-6 rounded-t-2xl flex justify-between items-center z-10">
            <h2 className="text-2xl font-bold">
              {detail ? "Detailni tahrirlash" : "Yangi detail qo'shish"}
            </h2>
            <button
              onClick={onCancel}
              className="hover:bg-white/20 p-2 rounded-full transition-colors"
              type="button"
            >
              <X size={24} />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Sarlavha O'zbekcha */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Sarlavha (O'zbekcha)
                </label>
                <Input
                  placeholder="Masalan: Klassik massaj"
                  value={formData.title || ""}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="border-gray-300"
                />
              </div>

              {/* Sarlavha Ruscha */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Заголовок (Русский)
                </label>
                <Input
                  placeholder="Например: Классический массаж"
                  value={formData.title_ru || ""}
                  onChange={(e) => setFormData({ ...formData, title_ru: e.target.value })}
                  className="border-gray-300"
                />
              </div>

              {/* Narx O'zbekcha */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Narx (O'zbekcha)
                </label>
                <Input
                  placeholder="Masalan: 150,000 so'm"
                  value={formData.price || ""}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  className="border-gray-300"
                />
              </div>

              {/* Narx Ruscha */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Цена (Русский)
                </label>
                <Input
                  placeholder="Например: 150,000 сум"
                  value={formData.price_ru || ""}
                  onChange={(e) => setFormData({ ...formData, price_ru: e.target.value })}
                  className="border-gray-300"
                />
              </div>
            </div>

            {/* Tavsif O'zbekcha */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tavsif (O'zbekcha)
              </label>
              <textarea
                placeholder="Detail haqida batafsil ma'lumot"
                value={formData.about || ""}
                onChange={(e) => setFormData({ ...formData, about: e.target.value })}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent resize-none"
                rows={4}
              />
            </div>

            {/* Tavsif Ruscha */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Описание (Русский)
              </label>
              <textarea
                placeholder="Подробная информация о детали"
                value={formData.about_ru || ""}
                onChange={(e) => setFormData({ ...formData, about_ru: e.target.value })}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent resize-none"
                rows={4}
              />
            </div>

            <div className="flex gap-3 pt-4">
              <Button
                type="submit"
                disabled={loading}
                className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 flex-1 text-white font-medium"
              >
                {loading && <Loader2 size={18} className="mr-2 animate-spin" />}
                {detail ? "Yangilash" : "Qo'shish"}
              </Button>
              <Button
                type="button"
                onClick={onCancel}
                className="bg-gray-500 hover:bg-gray-600 flex-1 text-white font-medium"
              >
                Bekor qilish
              </Button>
            </div>
          </form>
        </div>
      </div>
    </>
  )
}