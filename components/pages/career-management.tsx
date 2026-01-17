"use client"

import { useState, useEffect } from "react"
import { Plus, Edit2, Trash2, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { CareerForm } from "@/components/forms/career-form"
import { Toast } from "@/components/ui/toast"

interface Career {
  id: number
  title: string
  title_ru: string
  description: string
  description_ru: string
  vacancy: string
  photo?: string
}

export function CareerManagement() {
  const [careers, setCareers] = useState<Career[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingCareer, setEditingCareer] = useState<Career | null>(null)
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null)

      const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3030"

  useEffect(() => {
    fetchCareers()
  }, [])

  const fetchCareers = async () => {
    try {
      setLoading(true)
      const response = await fetch(`${BACKEND_URL}/career`)
      if (response.ok) {
        const data = await response.json()
        setCareers(data)
      }
    } catch (error) {
      setToast({ message: "Failed to load careers", type: "error" })
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure?")) return
    try {
      const response = await fetch(`${BACKEND_URL}/career/${id}`, { method: "DELETE" })
      if (response.ok) {
        setCareers(careers.filter((c) => c.id !== id))
        setToast({ message: "Career deleted", type: "success" })
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
        <h1 className="text-3xl font-bold text-gray-800">Career Management</h1>
        <Button
          onClick={() => {
            setEditingCareer(null)
            setShowForm(true)
          }}
          className="bg-emerald-600"
        >
          <Plus size={20} className="mr-2" /> Add Position
        </Button>
      </div>

      {showForm && (
        <CareerForm
          career={editingCareer}
          onSave={() => {
            setShowForm(false)
            fetchCareers()
            setToast({ message: "Career saved", type: "success" })
          }}
          onCancel={() => setShowForm(false)}
          setToast={setToast}
        />
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {careers.map((career) => (
          <div
            key={career.id}
            className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow"
          >
            {career.photo && (
              <img src={career.photo || "/placeholder.svg"} alt={career.title} className="w-full h-48 object-cover" />
            )}
            <div className="p-4">
              <h3 className="text-lg font-bold text-gray-800 mb-2">{career.title}</h3>
              <p className="text-sm text-gray-600 mb-2">{career.description.substring(0, 100)}...</p>
              <p className="text-xs text-emerald-600 font-semibold">Vacancies: {career.vacancy}</p>
              <div className="flex gap-2 mt-4">
                <button
                  onClick={() => {
                    setEditingCareer(career)
                    setShowForm(true)
                  }}
                  className="text-blue-600"
                >
                  <Edit2 size={18} />
                </button>
                <button onClick={() => handleDelete(career.id)} className="text-red-600">
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
