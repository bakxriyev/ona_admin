"use client"

import { useState, useEffect } from "react"
import { Plus, Edit2, Trash2, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { InsuranceForm } from "@/components/forms/insurance-form"
import { Toast } from "@/components/ui/toast"

interface Insurance {
  id: number
  full_name: string
  title: string
  description: string
  about_insurance: string
  title_ru: string
  description_ru: string
  about_insurance_ru: string
  photo?: string
}

export function InsuranceManagement() {
  const [insurances, setInsurances] = useState<Insurance[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingInsurance, setEditingInsurance] = useState<Insurance | null>(null)
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null)


      const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3030"


  useEffect(() => {
    fetchInsurances()
  }, [])

  const fetchInsurances = async () => {
    try {
      setLoading(true)
      const response = await fetch(`${BACKEND_URL}/insurance`)
      if (response.ok) {
        const data = await response.json()
        setInsurances(data)
      }
    } catch (error) {
      setToast({ message: "Failed to load insurance", type: "error" })
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure?")) return
    try {
      const response = await fetch(`${BACKEND_URL}/insurance/${id}`, { method: "DELETE" })
      if (response.ok) {
        setInsurances(insurances.filter((i) => i.id !== id))
        setToast({ message: "Insurance deleted", type: "success" })
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
        <h1 className="text-3xl font-bold text-gray-800">Insurance Management</h1>
        <Button
          onClick={() => {
            setEditingInsurance(null)
            setShowForm(true)
          }}
          className="bg-emerald-600"
        >
          <Plus size={20} className="mr-2" /> Add Insurance
        </Button>
      </div>

      {showForm && (
        <InsuranceForm
          insurance={editingInsurance}
          onSave={() => {
            setShowForm(false)
            fetchInsurances()
            setToast({ message: "Insurance saved", type: "success" })
          }}
          onCancel={() => setShowForm(false)}
          setToast={setToast}
        />
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {insurances.map((insurance) => (
          <div
            key={insurance.id}
            className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow"
          >
            {insurance.photo && (
              <img
                src={insurance.photo || "/placeholder.svg"}
                alt={insurance.title}
                className="w-full h-48 object-cover"
              />
            )}
            <div className="p-4">
              <h3 className="text-lg font-bold text-gray-800 mb-2">{insurance.title}</h3>
              <p className="text-sm text-gray-600">{insurance.about_insurance.substring(0, 100)}...</p>
              <div className="flex gap-2 mt-4">
                <button
                  onClick={() => {
                    setEditingInsurance(insurance)
                    setShowForm(true)
                  }}
                  className="text-blue-600"
                >
                  <Edit2 size={18} />
                </button>
                <button onClick={() => handleDelete(insurance.id)} className="text-red-600">
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
