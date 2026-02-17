"use client"

import { useState, useEffect } from "react"
import { ArrowLeft, Plus, Edit2, Trash2, Loader2, DollarSign, FileText } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ServiceDetailForm } from "../forms/service-details"
import { Toast } from "@/components/ui/toast"

interface ServiceDetail {
  id: number
  service_id: number
  title: string
  title_ru: string
  price: string
  price_ru: string
  about: string
  about_ru: string
  createdAt: string
  updatedAt: string
}

interface Service {
  id: number
  full_name: string
  full_name_ru: string
  title: string
  title_ru: string
  description: string
  description_ru: string
  about: string
  photo?: string
  video?: string
  details: ServiceDetail[]
}

interface ServiceDetailsViewProps {
  serviceId: number
  serviceName: string
  onBack: () => void
}

export function ServiceDetailsView({ serviceId, serviceName, onBack }: ServiceDetailsViewProps) {
  const [details, setDetails] = useState<ServiceDetail[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingDetail, setEditingDetail] = useState<ServiceDetail | null>(null)
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null)

  const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3030"

  useEffect(() => {
    fetchServiceDetails()
  }, [])

  const fetchServiceDetails = async () => {
    try {
      setLoading(true)
      const response = await fetch(`${BACKEND_URL}/services/${serviceId}`)
      if (response.ok) {
        const data: Service = await response.json()
        setDetails(data.details || [])
      } else {
        setToast({ message: "Service ma'lumotlarini yuklashda xatolik", type: "error" })
      }
    } catch (error) {
      console.error("Yuklashda xatolik:", error)
      setToast({ message: "Detaillarni yuklashda xatolik", type: "error" })
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: number) => {
    if (!confirm("Rostdan ham o'chirmoqchimisiz?")) return
    try {
      const response = await fetch(`${BACKEND_URL}/service-details/${id}`, { method: "DELETE" })
      if (response.ok) {
        setDetails(details.filter((d) => d.id !== id))
        setToast({ message: "Detail o'chirildi", type: "success" })
      } else {
        setToast({ message: "O'chirishda xatolik", type: "error" })
      }
    } catch {
      setToast({ message: "O'chirishda xatolik", type: "error" })
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="animate-spin text-emerald-600" size={40} />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6">
      {/* Header */}
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={onBack}
                className="p-2 hover:bg-gray-100 rounded-full transition"
              >
                <ArrowLeft size={24} className="text-gray-600" />
              </button>
              <div>
                <h1 className="text-3xl font-bold text-gray-800">{serviceName}</h1>
                <p className="text-gray-500 mt-1">Xizmat detaillari</p>
              </div>
            </div>
            <Button
              onClick={() => {
                setEditingDetail(null)
                setShowForm(true)
              }}
              className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700"
            >
              <Plus size={20} className="mr-2" /> Detail qo'shish
            </Button>
          </div>
        </div>

        {/* Details Grid */}
        {details.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
            <div className="max-w-md mx-auto">
              <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <FileText size={40} className="text-gray-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-700 mb-2">
                Hozircha detaillar yo'q
              </h3>
              <p className="text-gray-500 mb-6">
                Bu xizmat uchun yangi detail qo'shish uchun yuqoridagi tugmani bosing
              </p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {details.map((detail) => (
              <div
                key={detail.id}
                className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1"
              >
                <div className="h-2 bg-gradient-to-r from-emerald-600 to-teal-600"></div>

                <div className="p-6">
                  <h3 className="text-xl font-bold text-gray-800 mb-3">
                    {detail.title || detail.title_ru || "Nomlanmagan"}
                  </h3>

                  {detail.title && detail.title_ru && detail.title !== detail.title_ru && (
                    <p className="text-sm text-gray-500 mb-3 italic">{detail.title_ru}</p>
                  )}

                  {(detail.price || detail.price_ru) && (
                    <div className="flex items-center gap-2 mb-4 p-3 bg-emerald-50 rounded-lg">
                      <div className="p-2 bg-white rounded-lg shadow-sm">
                        <DollarSign size={18} className="text-emerald-600" />
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Narx</p>
                        <span className="text-lg font-bold text-emerald-600">
                          {detail.price || detail.price_ru}
                        </span>
                      </div>
                    </div>
                  )}

                  {(detail.about || detail.about_ru) && (
                    <div className="mb-4">
                      <p className="text-sm text-gray-600 line-clamp-4">
                        {detail.about || detail.about_ru}
                      </p>
                    </div>
                  )}

                  <div className="flex gap-2 pt-4 border-t">
                    <button
                      onClick={() => {
                        setEditingDetail(detail)
                        setShowForm(true)
                      }}
                      className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition font-medium"
                    >
                      <Edit2 size={16} />
                      Tahrirlash
                    </button>
                    <button
                      onClick={() => handleDelete(detail.id)}
                      className="flex items-center justify-center gap-2 px-4 py-2.5 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>

                  {/* Sanalar */}
                  <div className="mt-4 pt-4 border-t text-xs text-gray-400">
                    <p>Yaratilgan: {new Date(detail.createdAt).toLocaleDateString('uz-UZ')}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Form Modal */}
      {showForm && (
        <ServiceDetailForm
          serviceId={serviceId}
          detail={editingDetail}
          onSave={() => {
            setShowForm(false)
            fetchServiceDetails()
          }}
          onCancel={() => setShowForm(false)}
          setToast={setToast}
        />
      )}

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  )
}