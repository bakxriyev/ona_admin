"use client"

import { useState, useEffect } from "react"
import { Plus, Edit2, Trash2, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ServicesForm } from "@/components/forms/services-form"
import { Toast } from "@/components/ui/toast"

interface Service {
  id: number
  title: string
  title_ru: string
  description: string
  description_ru: string
  about: string
  photo?: string
}

export function ServicesManagement() {
  const [services, setServices] = useState<Service[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingService, setEditingService] = useState<Service | null>(null)
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
      setToast({ message: "Failed to load services", type: "error" })
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure?")) return
    try {
      const response = await fetch(`${BACKEND_URL}/services/${id}`, { method: "DELETE" })
      if (response.ok) {
        setServices(services.filter((s) => s.id !== id))
        setToast({ message: "Service deleted", type: "success" })
      }
    } catch {
      setToast({ message: "Failed to delete", type: "error" })
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="animate-spin" />
      </div>
    )
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Services Management</h1>
        <Button
          onClick={() => {
            setEditingService(null)
            setShowForm(true)
          }}
          className="bg-emerald-600"
        >
          <Plus size={20} className="mr-2" /> Add Service
        </Button>
      </div>

      {showForm && (
        <ServicesForm
          service={editingService}
          onSave={() => {
            setShowForm(false)
            fetchServices()
            setToast({ message: "Service saved", type: "success" })
          }}
          onCancel={() => setShowForm(false)}
          setToast={setToast}
        />
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
    alt={service.title}
    className="w-full h-48 object-cover"
  />
)}

            <div className="p-4">
              <h3 className="text-lg font-bold text-gray-800 mb-2">{service.title}</h3>
              <p className="text-sm text-gray-600">{service.description.substring(0, 100)}...</p>
              <div className="flex gap-2 mt-4">
                <button
                  onClick={() => {
                    setEditingService(service)
                    setShowForm(true)
                  }}
                  className="text-blue-600"
                >
                  <Edit2 size={18} />
                </button>
                <button onClick={() => handleDelete(service.id)} className="text-red-600">
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  )
}
