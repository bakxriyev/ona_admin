"use client"

import type React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Loader2, Upload, X } from "lucide-react"

interface DoctorFormProps {
  doctor: any
  onSave: () => void
  onCancel: () => void
  setToast: (toast: any) => void
}

export function DoctorForm({ doctor, onSave, onCancel, setToast }: DoctorFormProps) {
  const [formData, setFormData] = useState(doctor || {})
  const [loading, setLoading] = useState(false)
  const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL
  const [photoPreview, setPhotoPreview] = useState(
    doctor?.photo ? `${BACKEND_URL}/uploads/doctor/${doctor.photo}` : null,
  )
  const [videoPreview, setVideoPreview] = useState(
    doctor?.video ? `${BACKEND_URL}/uploads/doctor/${doctor.video}` : null,
  )

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setFormData({ ...formData, photo: file })
      const reader = new FileReader()
      reader.onloadend = () => setPhotoPreview(reader.result)
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const formDataObj = new FormData()

      Object.entries(formData).forEach(([key, value]) => {
        if (key !== "id" && key !== "createdAt" && key !== "updatedAt" && key !== "directionDoctors" && value) {
          if (key === "age") {
            formDataObj.append(key, Number(value).toString())
          } else if (key === "photo" || key === "video") {
            // Only append if it's a File (new upload)
            if (value instanceof File) {
              formDataObj.append(key, value)
            }
          } else {
            formDataObj.append(key, value as any)
          }
        }
      })

      const url = doctor ? `${BACKEND_URL}/doctor/${doctor.id}` : `${BACKEND_URL}/doctor`
      const method = doctor ? "PUT" : "POST"

      const response = await fetch(url, {
        method,
        body: formDataObj,
      })

      if (response.ok) {
        setToast({ message: doctor ? "Doctor updated" : "Doctor created", type: "success" })
        onSave()
      } else {
        const errorData = await response.json()
        console.log("[v0] Error response:", errorData)
        setToast({ message: "Failed to save doctor", type: "error" })
      }
    } catch (error) {
      console.log("[v0] Error saving doctor:", error)
      setToast({ message: "Error saving doctor", type: "error" })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
      <h2 className="text-2xl font-bold mb-4">{doctor ? "Edit Doctor" : "Add New Doctor"}</h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            placeholder="First Name *"
            value={formData.first_name || ""}
            onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
            required
          />
          <Input
            placeholder="Last Name *"
            value={formData.last_name || ""}
            onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
            required
          />
          <Input
            type="number"
            placeholder="Age *"
            value={formData.age || ""}
            onChange={(e) => setFormData({ ...formData, age: e.target.value })}
            required
          />
          <Input
            placeholder="Experience (Staji) *"
            value={formData.staji || ""}
            onChange={(e) => setFormData({ ...formData, staji: e.target.value })}
            required
          />
          <Input
            placeholder="Experience (Staji Russian) *"
            value={formData.staji_ru || ""}
            onChange={(e) => setFormData({ ...formData, staji_ru: e.target.value })}
            required
          />
          <Input
            placeholder="Education *"
            value={formData.education || ""}
            onChange={(e) => setFormData({ ...formData, education: e.target.value })}
            required
          />
          <Input
            placeholder="Education (Russian) *"
            value={formData.education_ru || ""}
            onChange={(e) => setFormData({ ...formData, education_ru: e.target.value })}
            required
          />
          <Input
            placeholder="Specialization *"
            value={formData.specialization || ""}
            onChange={(e) => setFormData({ ...formData, specialization: e.target.value })}
            required
          />
          <Input
            placeholder="Specialization (Russian) *"
            value={formData.specialization_ru || ""}
            onChange={(e) => setFormData({ ...formData, specialization_ru: e.target.value })}
            required
          />
        </div>

        <div className="space-y-4">
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
            <label className="block text-sm font-medium mb-2">Photo *</label>
            <div className="flex items-center gap-4">
              <Button
                type="button"
                onClick={() => document.getElementById("photo-upload")?.click()}
                className="bg-blue-600 hover:bg-blue-700"
              >
                <Upload className="mr-2 h-4 w-4" />
                Choose Photo
              </Button>
              <input id="photo-upload" type="file" accept="image/*" onChange={handlePhotoChange} className="hidden" />
              <span className="text-sm text-gray-500">
                {formData.photo instanceof File ? formData.photo.name : doctor?.photo || "No file selected"}
              </span>
            </div>
            {photoPreview && (
              <div className="mt-4 relative inline-block">
                <img
                  src={(photoPreview as string) || "/placeholder.svg"}
                  alt="Preview"
                  className="w-48 h-48 object-cover rounded-lg border-2 border-gray-200"
                />
                <Button
                  type="button"
                  onClick={() => {
                    setPhotoPreview(null)
                    setFormData({ ...formData, photo: null })
                  }}
                  className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 w-8 h-8 p-0 rounded-full"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            )}
          </div>

          <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
            <label className="block text-sm font-medium mb-2">Video</label>
            <div className="flex items-center gap-4">
              <Button
                type="button"
                onClick={() => document.getElementById("video-upload")?.click()}
                className="bg-purple-600 hover:bg-purple-700"
              >
                <Upload className="mr-2 h-4 w-4" />
                Choose Video
              </Button>
              <input id="video-upload" type="file" accept="video/*" onChange={handleVideoChange} className="hidden" />
              <span className="text-sm text-gray-500">
                {formData.video instanceof File ? formData.video.name : doctor?.video || "No file selected"}
              </span>
            </div>
            {videoPreview && (
              <div className="mt-4 relative inline-block">
                <video src={videoPreview} controls className="w-96 h-56 rounded-lg border-2 border-gray-200" />
                <Button
                  type="button"
                  onClick={() => {
                    setVideoPreview(null)
                    setFormData({ ...formData, video: null })
                  }}
                  className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 w-8 h-8 p-0 rounded-full"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            )}
          </div>
        </div>

        <div className="flex gap-2">
          <Button type="submit" disabled={loading} className="bg-emerald-600 flex-1">
            {loading && <Loader2 size={18} className="mr-2 animate-spin" />}
            {doctor ? "Update" : "Create"} Doctor
          </Button>
          <Button type="button" onClick={onCancel} className="bg-gray-400 flex-1">
            Cancel
          </Button>
        </div>
      </form>
    </div>
  )
}
