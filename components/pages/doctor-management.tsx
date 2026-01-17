"use client"

import { useState, useEffect } from "react"
import { Plus, Edit2, Trash2, Loader2, Stethoscope, Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import { DoctorForm } from "@/components/forms/doctor-form"
import { Toast } from "@/components/ui/toast"
import { Modal } from "@/components/ui/modal"

interface Doctor {
  id: number
  first_name: string
  last_name: string
  age: number
  staji: string
  education: string
  specialization: string
  photo?: string
  phone_number?: number
  directionDoctors?: { direction: { name: string; id: number } }[]
}

interface Direction {
  id: number
  name: string
}

export function DoctorManagement() {
  const [doctors, setDoctors] = useState<Doctor[]>([])
  const [directions, setDirections] = useState<Direction[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingDoctor, setEditingDoctor] = useState<Doctor | null>(null)
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null)

  const [searchQuery, setSearchQuery] = useState("")
  const [selectedDirection, setSelectedDirection] = useState<string>("all")

  const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"

  useEffect(() => {
    fetchDoctors()
    fetchDirections()
  }, [])

  const fetchDirections = async () => {
    try {
      const response = await fetch("/api/direction")
      if (response.ok) {
        const data = await response.json()
        setDirections(data)
      }
    } catch (error) {
      console.log("Failed to load directions")
    }
  }

  const fetchDoctors = async () => {
    try {
      setLoading(true)
      const response = await fetch("/api/doctor")
      if (response.ok) {
        const data = await response.json()
        setDoctors(data)
      }
    } catch (error) {
      setToast({ message: "Failed to load doctors", type: "error" })
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure?")) return
    try {
      const response = await fetch(`/api/doctor/${id}`, { method: "DELETE" })
      if (response.ok) {
        setDoctors(doctors.filter((d) => d.id !== id))
        setToast({ message: "Doctor deleted successfully", type: "success" })
      }
    } catch {
      setToast({ message: "Failed to delete doctor", type: "error" })
    }
  }

  const filteredDoctors = doctors.filter((doctor) => {
    const matchesSearch =
      searchQuery === "" ||
      doctor.first_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doctor.last_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doctor.phone_number?.toString().includes(searchQuery)

    const matchesDirection =
      selectedDirection === "all" ||
      doctor.directionDoctors?.some((dd) => dd.direction.id.toString() === selectedDirection)

    return matchesSearch && matchesDirection
  })

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="animate-spin" />
      </div>
    )
  }

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      <div className="flex justify-between items-center mb-8">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center">
            <Stethoscope className="text-white" size={24} />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Doctor Management</h1>
            <p className="text-gray-600 text-sm">Manage medical staff</p>
          </div>
        </div>
        <Button
          onClick={() => {
            setEditingDoctor(null)
            setShowForm(true)
          }}
          className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white shadow-lg hover:shadow-xl transition-all"
        >
          <Plus size={20} className="mr-2" /> Add Doctor
        </Button>
      </div>

      <div className="mb-6 bg-white p-6 rounded-xl shadow-md">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search by name or phone number..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
            />
          </div>
          <div className="md:w-64">
            <select
              value={selectedDirection}
              onChange={(e) => setSelectedDirection(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
            >
              <option value="all">All Directions</option>
              {directions.map((direction) => (
                <option key={direction.id} value={direction.id.toString()}>
                  {direction.name}
                </option>
              ))}
            </select>
          </div>
        </div>
        <div className="mt-3 text-sm text-gray-600">
          Showing {filteredDoctors.length} of {doctors.length} doctors
        </div>
      </div>

      <Modal
        isOpen={showForm}
        onClose={() => setShowForm(false)}
        title={editingDoctor ? "Edit Doctor" : "Add New Doctor"}
      >
        <DoctorForm
          doctor={editingDoctor}
          onSave={() => {
            setShowForm(false)
            fetchDoctors()
            setToast({ message: "Doctor saved successfully", type: "success" })
          }}
          onCancel={() => setShowForm(false)}
          setToast={setToast}
        />
      </Modal>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredDoctors.map((doctor) => (
          <div
            key={doctor.id}
            className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-2xl transition-all hover:scale-105 border border-gray-200"
          >
            <div className="h-48 bg-gradient-to-br from-emerald-400 to-teal-600 flex items-center justify-center relative overflow-hidden">
              {doctor.photo ? (
                <img
                  src={doctor.photo.startsWith("http") ? doctor.photo : `${BACKEND_URL}/uploads/doctor/${doctor.photo}`}
                  alt={doctor.first_name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="text-white text-6xl font-bold">
                  {doctor.first_name[0]}
                  {doctor.last_name[0]}
                </div>
              )}
            </div>
            <div className="p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-1">
                {doctor.first_name} {doctor.last_name}
              </h3>
              <p className="text-sm text-emerald-600 font-semibold mb-3">{doctor.specialization}</p>
              <div className="flex items-center gap-4 text-xs text-gray-600 mb-4">
                <span className="bg-gray-100 px-3 py-1 rounded-full">Age: {doctor.age}</span>
                <span className="bg-gray-100 px-3 py-1 rounded-full">{doctor.staji}</span>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    setEditingDoctor(doctor)
                    setShowForm(true)
                  }}
                  className="flex-1 bg-blue-50 text-blue-600 hover:bg-blue-100 py-2 px-4 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
                >
                  <Edit2 size={16} /> Edit
                </button>
                <button
                  onClick={() => handleDelete(doctor.id)}
                  className="flex-1 bg-red-50 text-red-600 hover:bg-red-100 py-2 px-4 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
                >
                  <Trash2 size={16} /> Delete
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
