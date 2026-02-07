"use client"

import { useState, useEffect } from "react"
import { Plus, Edit2, Trash2, Loader2, Stethoscope, Search, MapPin, User } from "lucide-react"
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
  directionDoctors?: []
}

interface directionDoctors {
  id: number
  full_name: string
  title: string
}

export function DoctorManagement() {
  const [doctors, setDoctors] = useState<Doctor[]>([])
  const [directions, setDirections] = useState<directionDoctors[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingDoctor, setEditingDoctor] = useState<Doctor | null>(null)
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null)

  const [searchQuery, setSearchQuery] = useState("")
  const [selectedDirection, setSelectedDirection] = useState<string>("all")

    const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3030"


  const fetchDirections = async () => {
    try {
      const response = await fetch(`${BACKEND_URL}/direction`)
      if (response.ok) {
        const data = await response.json()
        setDirections(data)
      }
    } catch (error) {
      console.error("Failed to load directions:", error)
    }
  }

  const fetchDoctors = async () => {
    try {
      setLoading(true)
      const response = await fetch(`${BACKEND_URL}/doctor`)
      if (response.ok) {
        const data = await response.json()
        setDoctors(data)
      } else {
        setToast({ message: "Failed to load doctors", type: "error" })
      }
    } catch (error) {
      setToast({ message: "Failed to load doctors", type: "error" })
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this doctor?")) return
    
    try {
      // First, try to delete direction-doctor relationships
      const doctor = doctors.find(d => d.id === id)
      
      if (doctor?.directionDoctors?.length) {
        try {
          // Try to delete by doctor ID
          await fetch(`${BACKEND_URL}/direction-doctors/doctor/${id}`, {
            method: "DELETE"
          })
        } catch (error) {
          console.error("Failed to delete direction-doctor relationship:", error)
        }
      }
      
      // Then delete the doctor
      const response = await fetch(`${BACKEND_URL}/doctor/${id}`, { method: "DELETE" })
      if (response.ok) {
        setDoctors(doctors.filter((d) => d.id !== id))
        setToast({ message: "Doctor deleted successfully", type: "success" })
      } else {
        setToast({ message: "Failed to delete doctor", type: "error" })
      }
    } catch (error) {
      console.error("Error deleting doctor:", error)
      setToast({ message: "Failed to delete doctor", type: "error" })
    }
  }

  const filteredDoctors = doctors.filter((doctor) => {
    const matchesSearch =
      searchQuery === "" ||
      doctor.first_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doctor.last_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doctor.specialization?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doctor.education?.toLowerCase().includes(searchQuery.toLowerCase())

    const matchesDirection =
      selectedDirection === "all" ||
      doctor.directionDoctors?.some((dd) => dd.id.toString() === selectedDirection)

    return matchesSearch && matchesDirection
  })

  useEffect(() => {
    fetchDoctors()
    fetchDirections()
  }, [])

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-gray-50">
        <div className="w-16 h-16 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center animate-pulse mb-4">
          <Stethoscope className="text-white" size={28} />
        </div>
        <Loader2 className="animate-spin text-emerald-600 mb-2" size={32} />
        <p className="text-gray-600">Loading doctors...</p>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Main Content - Positioned near sidebar */}
      <div className="flex-1 pl-4 pr-6">
        <div className="max-w-7xl mx-auto py-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center shadow-md">
                <Stethoscope className="text-white" size={24} />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Doctor Management</h1>
                <p className="text-gray-600 text-sm">Manage medical staff and their specialties</p>
              </div>
            </div>
            <Button
              onClick={() => {
                setEditingDoctor(null)
                setShowForm(true)
              }}
              className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white shadow-md hover:shadow-lg transition-all"
            >
              <Plus size={20} className="mr-2" /> Add New Doctor
            </Button>
          </div>

          {/* Search and Filter Section */}
          <div className="mb-6 bg-white p-4 rounded-xl shadow-sm border border-gray-200">
            <div className="flex flex-col md:flex-row gap-3">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                <input
                  type="text"
                  placeholder="Search doctors by name, specialization or education..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm"
                />
              </div>
              <div className="w-full md:w-64">
                <div className="flex items-center gap-2 mb-1">
                  <MapPin size={14} className="text-emerald-600" />
                  <label className="text-sm font-medium text-gray-700">Filter by Direction</label>
                </div>
                <select
                  value={selectedDirection}
                  onChange={(e) => setSelectedDirection(e.target.value)}
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm"
                >
                  <option value="all">All Directions</option>
                  {directions.map((direction) => (
                    <option key={direction.id} value={direction.id.toString()}>
                      {direction.full_name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="mt-3 flex justify-between items-center">
              <div className="text-sm text-gray-600">
                Showing <span className="font-medium text-emerald-600">{filteredDoctors.length}</span> of{" "}
                <span className="font-medium">{doctors.length}</span> doctors
              </div>
              {(searchQuery || selectedDirection !== "all") && (
                <button
                  onClick={() => {
                    setSearchQuery("")
                    setSelectedDirection("all")
                  }}
                  className="text-sm text-emerald-600 hover:text-emerald-700 font-medium"
                >
                  Clear filters
                </button>
              )}
            </div>
          </div>

          {/* Doctor Form Modal */}
          <Modal
            isOpen={showForm}
            onClose={() => {
              if (!loading) {
                setShowForm(false)
                setEditingDoctor(null)
              }
            }}
            title={editingDoctor ? "Edit Doctor" : "Add New Doctor"}
         
          >
            <DoctorForm
              doctor={editingDoctor}
              onSave={() => {
                setShowForm(false)
                fetchDoctors()
                setEditingDoctor(null)
              }}
              onCancel={() => {
                setShowForm(false)
                setEditingDoctor(null)
              }}
              setToast={setToast}
            />
          </Modal>

          {/* Doctors Grid */}
          {filteredDoctors.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {filteredDoctors.map((doctor) => (
                <div
                  key={doctor.id}
                  className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow duration-300"
                >
                  {/* Doctor Image */}
                  <div className="h-52 bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center relative overflow-hidden">
                    {doctor.photo ? (
                      <img
                        src={`${BACKEND_URL}/uploads/doctor/${doctor.photo}`}
                        alt={`${doctor.first_name} ${doctor.last_name}`}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement
                          target.onerror = null
                          target.src = "/placeholder-doctor.svg"
                        }}
                      />
                    ) : (
                      <div className="flex flex-col items-center text-white">
                        <div className="w-20 h-20 rounded-full bg-white/20 flex items-center justify-center mb-3">
                          <User size={40} />
                        </div>
                        <div className="text-2xl font-bold">
                          {doctor.first_name?.[0]}{doctor.last_name?.[0]}
                        </div>
                      </div>
                    )}
                  </div>
                  
                  {/* Doctor Info */}
                  <div className="p-5">
                    <h3 className="text-lg font-bold text-gray-900 mb-1">
                      Dr. {doctor.first_name} {doctor.last_name}
                    </h3>
                    <p className="text-emerald-600 font-medium text-sm mb-3">{doctor.specialization}</p>
                    
                    {/* Direction Display */}
                    {doctor.directionDoctors && doctor.directionDoctors.length > 0 ? (
                      <div className="mb-4">
                        <div className="flex items-center gap-1 text-xs font-medium text-gray-500 mb-2">
                          <MapPin size={12} />
                          <span>Specialty Direction</span>
                        </div>
                        {/* <div className="flex flex-wrap gap-1">
                          {doctor.directionDoctors.map((dd) => (
                            <span
                              key={dd.direction.id}
                              className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200"
                            >
                              {dd.direction.full_name}
                            </span>
                          ))}
                        </div> */}
                      </div>
                    ) : (
                      <div className="mb-4 px-3 py-2 bg-amber-50 text-amber-700 rounded-lg border border-amber-200 text-sm">
                        No direction assigned
                      </div>
                    )}
                    
                    {/* Doctor Details */}
                    <div className="space-y-2 mb-5">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Age:</span>
                        <span className="font-medium">{doctor.age}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Experience:</span>
                        <span className="font-medium">{doctor.staji}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Education:</span>
                        <span className="font-medium text-right">{doctor.education}</span>
                      </div>
                    </div>
                    
                    {/* Action Buttons */}
                    <div className="flex gap-2 pt-4 border-t border-gray-200">
                      <button
                        onClick={() => {
                          setEditingDoctor(doctor)
                          setShowForm(true)
                        }}
                        className="flex-1 bg-blue-500 hover:bg-blue-600 text-white py-2 px-3 rounded-lg font-medium text-sm transition-colors flex items-center justify-center gap-2"
                      >
                        <Edit2 size={14} /> Edit
                      </button>
                      <button
                        onClick={() => handleDelete(doctor.id)}
                        className="flex-1 bg-red-500 hover:bg-red-600 text-white py-2 px-3 rounded-lg font-medium text-sm transition-colors flex items-center justify-center gap-2"
                      >
                        <Trash2 size={14} /> Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-white rounded-xl shadow-sm border border-gray-200">
              <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                <Stethoscope className="text-gray-400" size={40} />
              </div>
              <h3 className="text-xl font-bold text-gray-700 mb-2">No doctors found</h3>
              <p className="text-gray-500 mb-6 max-w-md mx-auto">
                {searchQuery || selectedDirection !== "all" 
                  ? "No doctors match your search criteria. Try adjusting your filters." 
                  : "Get started by adding your first doctor to the system."}
              </p>
              <Button
                onClick={() => setShowForm(true)}
                className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white"
              >
                <Plus size={20} className="mr-2" /> Add Your First Doctor
              </Button>
            </div>
          )}
        </div>
      </div>

      {toast && (
        <Toast 
          message={toast.message} 
          type={toast.type} 
          onClose={() => setToast(null)} 
        />
      )}
    </div>
  )
}