"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Loader2, Upload, X, ChevronDown } from "lucide-react"

interface DoctorFormProps {
  doctor: any
  onSave: () => void
  onCancel: () => void
  setToast: (toast: any) => void
}

export function DoctorForm({ doctor, onSave, onCancel, setToast }: DoctorFormProps) {
  const [formData, setFormData] = useState(doctor || {})
  const [loading, setLoading] = useState(false)
  const [creatingDoctor, setCreatingDoctor] = useState(false)
  const [directions, setDirections] = useState<any[]>([])
  const [selectedDirectionId, setSelectedDirectionId] = useState<string | null>(
    doctor?.directionDoctors?.[0]?.direction?.id?.toString() || null
  )
  const [showDirectionDropdown, setShowDirectionDropdown] = useState(false)
  
  const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"
  const [photoPreview, setPhotoPreview] = useState(
    doctor?.photo ? `${BACKEND_URL}/uploads/doctor/${doctor.photo}` : null,
  )
  const [videoPreview, setVideoPreview] = useState(
    doctor?.video ? `${BACKEND_URL}/uploads/doctor/${doctor.video}` : null,
  )

  useEffect(() => {
    fetchDirections()
  }, [])

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

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setFormData({ ...formData, photo: file })
      const reader = new FileReader()
      reader.onloadend = () => setPhotoPreview(reader.result as string)
      reader.readAsDataURL(file)
    }
  }

  const handleVideoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setFormData({ ...formData, video: file })
      setVideoPreview(URL.createObjectURL(file))
    }
  }

  const handleDirectionSelect = (direction: any) => {
    setSelectedDirectionId(direction.id.toString())
    setShowDirectionDropdown(false)
  }

  const selectedDirection = directions.find(d => d.id.toString() === selectedDirectionId)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedDirectionId) {
      setToast({ message: "Please select a direction", type: "error" })
      return
    }

    setCreatingDoctor(true)
    setLoading(true)

    try {
      if (doctor) {
        // EDIT MODE
        // 1. Update doctor
        const doctorFormData = new FormData()
        doctorFormData.append("first_name", formData.first_name || "")
        doctorFormData.append("last_name", formData.last_name || "")
        doctorFormData.append("age", formData.age?.toString() || "")
        doctorFormData.append("staji", formData.staji || "")
        doctorFormData.append("education", formData.education || "")
        doctorFormData.append("specialization", formData.specialization || "")
        doctorFormData.append("staji_ru", formData.staji_ru || "")
        doctorFormData.append("education_ru", formData.education_ru || "")
        doctorFormData.append("specialization_ru", formData.specialization_ru || "")

        if (formData.photo instanceof File) {
          doctorFormData.append("photo", formData.photo)
        }

        if (formData.video instanceof File) {
          doctorFormData.append("video", formData.video)
        }

        const doctorResponse = await fetch(`${BACKEND_URL}/doctor/${doctor.id}`, {
          method: "PUT",
          body: doctorFormData,
        })

        if (!doctorResponse.ok) {
          const errorData = await doctorResponse.json()
          throw new Error(errorData.message || "Failed to update doctor")
        }

        // 2. Delete existing direction-doctor relationships
        if (doctor.directionDoctors?.length > 0) {
          // We need to get direction-doctor relationship IDs first
          // This depends on your backend API structure
          // For now, let's assume we can delete by doctor ID
          try {
            await fetch(`${BACKEND_URL}/direction-doctors/doctor/${doctor.id}`, {
              method: "DELETE"
            })
          } catch (error) {
            console.error("Failed to delete old relationships:", error)
          }
        }

        // 3. Create new direction-doctor relationship
        const directionDoctorData = new FormData()
        directionDoctorData.append("doctors_id", doctor.id.toString())
        directionDoctorData.append("direction_id", selectedDirectionId)
        
        // Send empty strings for photo and video as API expects string values
        directionDoctorData.append("photo", "")
        directionDoctorData.append("video", "")

        const directionResponse = await fetch(`${BACKEND_URL}/direction-doctors`, {
          method: "POST",
          body: directionDoctorData,
        })

        if (!directionResponse.ok) {
          throw new Error("Failed to link doctor with direction")
        }

        setToast({ 
          message: "Doctor updated successfully", 
          type: "success" 
        })
        onSave()
        
      } else {
        // CREATE MODE
        // 1. First create the doctor
        const doctorFormData = new FormData()
        doctorFormData.append("first_name", formData.first_name || "")
        doctorFormData.append("last_name", formData.last_name || "")
        doctorFormData.append("age", formData.age?.toString() || "")
        doctorFormData.append("staji", formData.staji || "")
        doctorFormData.append("education", formData.education || "")
        doctorFormData.append("specialization", formData.specialization || "")
        doctorFormData.append("staji_ru", formData.staji_ru || "")
        doctorFormData.append("education_ru", formData.education_ru || "")
        doctorFormData.append("specialization_ru", formData.specialization_ru || "")

        if (formData.photo) {
          doctorFormData.append("photo", formData.photo)
        }

        if (formData.video) {
          doctorFormData.append("video", formData.video)
        }

        const doctorResponse = await fetch(`${BACKEND_URL}/doctor`, {
          method: "POST",
          body: doctorFormData,
        })

        if (!doctorResponse.ok) {
          const errorData = await doctorResponse.json()
          throw new Error(errorData.message || "Failed to create doctor")
        }

        const savedDoctor = await doctorResponse.json()
        const doctorId = savedDoctor.id

        if (!doctorId) {
          throw new Error("Doctor ID not returned from server")
        }

        // 2. Wait a moment to ensure doctor is fully created
        await new Promise(resolve => setTimeout(resolve, 500))

        // 3. Create direction-doctor relationship
        // IMPORTANT: Don't send photo/video files here - they're already uploaded with the doctor
        const directionDoctorData = new FormData()
        directionDoctorData.append("doctors_id", doctorId.toString())
        directionDoctorData.append("direction_id", selectedDirectionId)
        
        // Send empty strings for photo and video as API expects string values
        directionDoctorData.append("photo", "")
        directionDoctorData.append("video", "")

        const directionResponse = await fetch(`${BACKEND_URL}/direction-doctors`, {
          method: "POST",
          body: directionDoctorData,
        })

        if (!directionResponse.ok) {
          // If direction linking fails, try to delete the doctor we just created
          try {
            await fetch(`${BACKEND_URL}/doctor/${doctorId}`, {
              method: "DELETE"
            })
          } catch (deleteError) {
            console.error("Failed to delete doctor after direction linking failed:", deleteError)
          }
          
          const errorData = await directionResponse.json()
          throw new Error(errorData.message || "Failed to link doctor with direction")
        }

        setToast({ 
          message: "Doctor created successfully", 
          type: "success" 
        })
        onSave()
      }
      
    } catch (error: any) {
      console.error("Error saving doctor:", error)
      setToast({ 
        message: error.message || "Error saving doctor", 
        type: "error" 
      })
    } finally {
      setCreatingDoctor(false)
      setLoading(false)
    }
  }

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 mb-6 max-h-[90vh] overflow-y-auto">
      <h2 className="text-2xl font-bold mb-6 text-gray-900">
        {doctor ? "Edit Doctor" : "Add New Doctor"}
        {creatingDoctor && (
          <span className="ml-2 text-sm font-normal text-emerald-600">
            (Creating doctor...)
          </span>
        )}
      </h2>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* First Name */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">First Name *</label>
            <Input
              placeholder="First Name"
              value={formData.first_name || ""}
              onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
              required
              disabled={creatingDoctor}
              className="w-full"
            />
          </div>
          
          {/* Last Name */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Last Name *</label>
            <Input
              placeholder="Last Name"
              value={formData.last_name || ""}
              onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
              required
              disabled={creatingDoctor}
              className="w-full"
            />
          </div>
          
          {/* Age */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Age *</label>
            <Input
              type="number"
              placeholder="Age"
              value={formData.age || ""}
              onChange={(e) => setFormData({ ...formData, age: e.target.value })}
              required
              disabled={creatingDoctor}
              className="w-full"
            />
          </div>
          
          {/* Experience (Staji) */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Experience (Staji) *</label>
            <Input
              placeholder="Experience"
              value={formData.staji || ""}
              onChange={(e) => setFormData({ ...formData, staji: e.target.value })}
              required
              disabled={creatingDoctor}
              className="w-full"
            />
          </div>
          
          {/* Education */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Education *</label>
            <Input
              placeholder="Education"
              value={formData.education || ""}
              onChange={(e) => setFormData({ ...formData, education: e.target.value })}
              required
              disabled={creatingDoctor}
              className="w-full"
            />
          </div>
          
          {/* Specialization */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Specialization *</label>
            <Input
              placeholder="Specialization"
              value={formData.specialization || ""}
              onChange={(e) => setFormData({ ...formData, specialization: e.target.value })}
              required
              disabled={creatingDoctor}
              className="w-full"
            />
          </div>

          {/* Experience Russian */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Experience (Russian) *</label>
            <Input
              placeholder="Experience Russian"
              value={formData.staji_ru || ""}
              onChange={(e) => setFormData({ ...formData, staji_ru: e.target.value })}
              required
              disabled={creatingDoctor}
              className="w-full"
            />
          </div>

          {/* Education Russian */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Education (Russian) *</label>
            <Input
              placeholder="Education Russian"
              value={formData.education_ru || ""}
              onChange={(e) => setFormData({ ...formData, education_ru: e.target.value })}
              required
              disabled={creatingDoctor}
              className="w-full"
            />
          </div>

          {/* Specialization Russian */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Specialization (Russian) *</label>
            <Input
              placeholder="Specialization Russian"
              value={formData.specialization_ru || ""}
              onChange={(e) => setFormData({ ...formData, specialization_ru: e.target.value })}
              required
              disabled={creatingDoctor}
              className="w-full"
            />
          </div>

          {/* Direction Select */}
          <div className="space-y-2 md:col-span-2">
            <label className="text-sm font-medium text-gray-700">Direction *</label>
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowDirectionDropdown(!showDirectionDropdown)}
                disabled={creatingDoctor}
                className="w-full flex items-center justify-between px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent bg-white text-left hover:border-gray-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <span className={selectedDirection ? "text-gray-900" : "text-gray-500"}>
                  {selectedDirection ? selectedDirection.full_name : "Select a direction"}
                </span>
                <ChevronDown className={`h-4 w-4 transition-transform ${showDirectionDropdown ? "rotate-180" : ""}`} />
              </button>
              
              {showDirectionDropdown && !creatingDoctor && (
                <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                  {directions.length > 0 ? (
                    directions.map((direction) => (
                      <div
                        key={direction.id}
                        onClick={() => handleDirectionSelect(direction)}
                        className={`px-4 py-3 hover:bg-emerald-50 cursor-pointer transition-colors ${
                          selectedDirectionId === direction.id.toString() 
                            ? "bg-emerald-100 text-emerald-700 font-medium" 
                            : "text-gray-700"
                        }`}
                      >
                        {direction.full_name}
                      </div>
                    ))
                  ) : (
                    <div className="px-4 py-3 text-gray-500 text-center">
                      No directions available
                    </div>
                  )}
                </div>
              )}
            </div>
            {!selectedDirectionId && !creatingDoctor && (
              <p className="text-sm text-red-500 mt-1">Please select a direction</p>
            )}
          </div>
        </div>

        {/* Photo Upload */}
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
          <label className="block text-sm font-medium mb-2 text-gray-700">
            Photo {!doctor?.photo && !formData.photo && <span className="text-red-500">*</span>}
          </label>
          <div className="flex items-center gap-4">
            <Button
              type="button"
              onClick={() => document.getElementById("photo-upload")?.click()}
              disabled={creatingDoctor}
              className="bg-emerald-600 hover:bg-emerald-700 text-white disabled:opacity-50"
            >
              <Upload className="mr-2 h-4 w-4" />
              Choose Photo
            </Button>
            <input 
              id="photo-upload" 
              type="file" 
              accept="image/*" 
              onChange={handlePhotoChange} 
              className="hidden" 
              disabled={creatingDoctor}
              required={!doctor?.photo && !formData.photo}
            />
            <span className="text-sm text-gray-500">
              {formData.photo instanceof File ? formData.photo.name : doctor?.photo || "No file selected"}
            </span>
          </div>
          {photoPreview && (
            <div className="mt-4 relative inline-block">
              <img
                src={photoPreview || "/placeholder.svg"}
                alt="Preview"
                className="w-48 h-48 object-cover rounded-lg border-2 border-gray-200"
              />
              {!creatingDoctor && (
                <Button
                  type="button"
                  onClick={() => {
                    setPhotoPreview(null)
                    setFormData({ ...formData, photo: null })
                  }}
                  className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white w-8 h-8 p-0 rounded-full flex items-center justify-center"
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
          )}
        </div>

        {/* Video Upload */}
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
          <label className="block text-sm font-medium mb-2 text-gray-700">Video (Optional)</label>
          <div className="flex items-center gap-4">
            <Button
              type="button"
              onClick={() => document.getElementById("video-upload")?.click()}
              disabled={creatingDoctor}
              className="bg-gray-600 hover:bg-gray-700 text-white disabled:opacity-50"
            >
              <Upload className="mr-2 h-4 w-4" />
              Choose Video
            </Button>
            <input 
              id="video-upload" 
              type="file" 
              accept="video/*" 
              onChange={handleVideoChange} 
              className="hidden" 
              disabled={creatingDoctor}
            />
            <span className="text-sm text-gray-500">
              {formData.video instanceof File ? formData.video.name : doctor?.video || "No file selected"}
            </span>
          </div>
          {videoPreview && (
            <div className="mt-4 relative inline-block">
              <video 
                src={videoPreview} 
                controls 
                className="w-96 h-56 rounded-lg border-2 border-gray-200" 
              />
              {!creatingDoctor && (
                <Button
                  type="button"
                  onClick={() => {
                    setVideoPreview(null)
                    setFormData({ ...formData, video: null })
                  }}
                  className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white w-8 h-8 p-0 rounded-full flex items-center justify-center"
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
          )}
        </div>

        <div className="flex gap-3 pt-4 border-t border-gray-200">
          <Button 
            type="submit" 
            disabled={loading || !selectedDirectionId || creatingDoctor} 
            className="bg-emerald-600 flex-1 hover:bg-emerald-700 text-white py-3 disabled:opacity-50"
          >
            {loading ? (
              <>
                <Loader2 size={18} className="mr-2 animate-spin" />
                {creatingDoctor ? "Creating Doctor..." : "Saving..."}
              </>
            ) : (
              doctor ? "Update Doctor" : "Create Doctor"
            )}
          </Button>
          <Button 
            type="button" 
            onClick={onCancel}
            disabled={creatingDoctor}
            className="bg-gray-200 hover:bg-gray-300 text-gray-800 flex-1 py-3 disabled:opacity-50"
          >
            Cancel
          </Button>
        </div>
      </form>
    </div>
  )
}