"use client"

import { useState, useEffect } from "react"
import { Plus, Edit2, Trash2, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { DirectionForm } from "@/components/forms/direction-form"
import { Toast } from "@/components/ui/toast"

interface Direction {
  id: number
  full_name: string
  title: string
  title_ru: string
  description: string
  description_ru: string
  photo?: string
}

export function DirectionManagement() {
  const [directions, setDirections] = useState<Direction[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingDirection, setEditingDirection] = useState<Direction | null>(null)
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null)

    const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3030"

  useEffect(() => {
    fetchDirections()
  }, [])

  const fetchDirections = async () => {
    try {
      setLoading(true)
      const response = await fetch(`${BACKEND_URL}/direction`)
      if (response.ok) {
        const data = await response.json()
        setDirections(data)
      }
    } catch (error) {
      setToast({ message: "Failed to load directions", type: "error" })
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure?")) return
    try {
      const response = await fetch(`${BACKEND_URL}/direction/${id}`, { method: "DELETE" })
      if (response.ok) {
        setDirections(directions.filter((d) => d.id !== id))
        setToast({ message: "Direction deleted", type: "success" })
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
        <h1 className="text-3xl font-bold text-gray-800">Direction Management</h1>
        <Button
          onClick={() => {
            setEditingDirection(null)
            setShowForm(true)
          }}
          className="bg-emerald-600"
        >
          <Plus size={20} className="mr-2" /> Add Direction
        </Button>
      </div>

      {showForm && (
        <DirectionForm
          direction={editingDirection}
          onSave={() => {
            setShowForm(false)
            fetchDirections()
            setToast({ message: "Direction saved", type: "success" })
          }}
          onCancel={() => setShowForm(false)}
          setToast={setToast}
        />
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {directions.map((direction) => (
          <div
            key={direction.id}
            className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow"
          >
      {direction.photo && (
  <img
    src={
      direction.photo.startsWith("http")
        ? direction.photo
        : `${BACKEND_URL}/uploads/direction/${direction.photo}`
    }
    alt={direction.title}
    className="w-full h-48 object-cover"
  />
)}

            <div className="p-4">
              <h3 className="text-lg font-bold text-gray-800 mb-2">{direction.title}</h3>
              <p className="text-sm text-gray-600">{direction.description.substring(0, 100)}...</p>
              <div className="flex gap-2 mt-4">
                <button
                  onClick={() => {
                    setEditingDirection(direction)
                    setShowForm(true)
                  }}
                  className="text-blue-600"
                >
                  <Edit2 size={18} />
                </button>
                <button onClick={() => handleDelete(direction.id)} className="text-red-600">
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
