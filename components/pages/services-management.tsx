"use client"

import { useState, useEffect } from "react"
import { Plus, Edit2, Trash2, Loader2, Eye } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ServicesForm } from "@/components/forms/services-form"
import { ServiceDetailsView } from "./service-details-view"
import { Toast } from "@/components/ui/toast"

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
}

export function ServicesManagement() {
  const [services, setServices] = useState<Service[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingService, setEditingService] = useState<Service | null>(null)
  const [viewingServiceDetails, setViewingServiceDetails] = useState<{id: number, name: string} | null>(null)
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null)

  const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3030"

  useEffect(() => {
    fetchServices()
  }, [])

  const fetchServices = async () => {
    try {
      setLoading(true)
      const response = await fetch(`${BACKEND_URL}/services`)
      if (response.ok) {
        const data = await response.json()
        setServices(data)
      }
    } catch (error) {
      setToast({ message: "Xizmatlarni yuklashda xatolik", type: "error" })
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: number) => {
    if (!confirm("Rostdan ham o`chirmoqchimisiz?")) return
    try {
      const response = await fetch(`${BACKEND_URL}/services/${id}`, { method: "DELETE" })
      if (response.ok) {
        setServices(services.filter((s) => s.id !== id))
        setToast({ message: "Xizmat o`chirildi", type: "success" })
      }
    } catch {
      setToast({ message: "O`chirishda xatolik", type: "error" })
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="animate-spin" />
      </div>
    )
  }

  // Agar detail view ochiq bo'lsa
  if (viewingServiceDetails) {
    return (
      <ServiceDetailsView
        serviceId={viewingServiceDetails.id}
        serviceName={viewingServiceDetails.name}
        onBack={() => setViewingServiceDetails(null)}
      />
    )
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Xizmatlarni boshqarish</h1>
        <Button
          onClick={() => {
            setEditingService(null)
            setShowForm(true)
          }}
          className="bg-emerald-600"
        >
          <Plus size={20} className="mr-2" /> Xizmat qo`shish
        </Button>
      </div>

      {showForm && (
        <ServicesForm
          service={editingService}
          onSave={() => {
            setShowForm(false)
            fetchServices()
            setToast({ message: "Xizmat saqlandi", type: "success" })
          }}
          onCancel={() => setShowForm(false)}
          setToast={setToast}
        />
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {services.map((service) => (
          <div
            key={service.id}
            className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow"
          >
            {service.photo && (
              <img
                src={
                  service.photo.startsWith("http")
                    ? service.photo
                    : `${BACKEND_URL}/uploads/services/${service.photo}`
                }
                alt={service.full_name}
                className="w-full h-48 object-cover"
              />
            )}

            <div className="p-4">
              <h3 className="text-lg font-bold text-gray-800 mb-1">{service.full_name}</h3>
              <h4 className="text-md font-semibold text-emerald-600 mb-2">{service.title}</h4>
              <p className="text-sm text-gray-600 mb-3">
                {service.description.substring(0, 120)}...
              </p>
              
              {service.video && (
                <div className="mb-3">
                  <span className="text-xs text-emerald-600 font-medium">📹 Video mavjud</span>
                </div>
              )}

              <div className="flex gap-2 mt-4">
                <button
                  onClick={() => setViewingServiceDetails({id: service.id, name: service.full_name})}
                  className="flex items-center gap-1 px-3 py-2 bg-emerald-50 text-emerald-600 rounded hover:bg-emerald-100 transition font-medium"
                >
                  <Eye size={16} />
                  <span className="text-sm">Detaillar</span>
                </button>
                <button
                  onClick={() => {
                    setEditingService(service)
                    setShowForm(true)
                  }}
                  className="flex items-center gap-1 px-3 py-2 bg-blue-50 text-blue-600 rounded hover:bg-blue-100 transition"
                >
                  <Edit2 size={16} />
                  <span className="text-sm">Tahrirlash</span>
                </button>
                <button
                  onClick={() => handleDelete(service.id)}
                  className="flex items-center gap-1 px-3 py-2 bg-red-50 text-red-600 rounded hover:bg-red-100 transition"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {services.length === 0 && !loading && (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">Hozircha xizmatlar yo`q</p>
          <p className="text-gray-400 text-sm mt-2">Yangi xizmat qo`shish uchun yuqoridagi tugmani bosing</p>
        </div>
      )}

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  )
}