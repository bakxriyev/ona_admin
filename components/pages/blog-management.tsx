"use client"

import { useState, useEffect } from "react"
import { Plus, Edit2, Trash2, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { BlogForm } from "@/components/forms/blog-form"
import { Toast } from "@/components/ui/toast"

interface Blog {
  id: number
  title: string
  title_ru: string
  description: string
  description_ru: string
  maqola: string
  photo?: string
  video?: string
}

export function BlogManagement() {
  const [blogs, setBlogs] = useState<Blog[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingBlog, setEditingBlog] = useState<Blog | null>(null)
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null)

    const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3030"


  useEffect(() => {
    fetchBlogs()
  }, [])

  

  const fetchBlogs = async () => {
    try {
      setLoading(true)
      const response = await fetch(`${BACKEND_URL}/blog`)
      if (response.ok) {
        const data = await response.json()
        setBlogs(data)
      }
    } catch (error) {
      setToast({ message: "Failed to load blogs", type: "error" })
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure?")) return
    try {
      const response = await fetch(`${BACKEND_URL}/blog/${id}`, { method: "DELETE" })
      if (response.ok) {
        setBlogs(blogs.filter((b) => b.id !== id))
        setToast({ message: "Blog deleted", type: "success" })
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
        <h1 className="text-3xl font-bold text-gray-800">Blog Management</h1>
        <Button
          onClick={() => {
            setEditingBlog(null)
            setShowForm(true)
          }}
          className="bg-emerald-600"
        >
          <Plus size={20} className="mr-2" /> Add Blog
        </Button>
      </div>

      {showForm && (
        <BlogForm
          blog={editingBlog}
          onSave={() => {
            setShowForm(false)
            fetchBlogs()
            setToast({ message: "Blog saved", type: "success" })
          }}
          onCancel={() => setShowForm(false)}
          setToast={setToast}
        />
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {blogs.map((blog) => (
          <div
            key={blog.id}
            className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow"
          >
           {blog.photo && (
  <img
    src={
      blog.photo.startsWith("http")
        ? blog.photo
        : `${BACKEND_URL}/uploads/blog/${blog.photo}`
    }
    alt={blog.title}
    className="w-full h-48 object-cover"
  />
)}

            <div className="p-4">
              <h3 className="text-lg font-bold text-gray-800 mb-2">{blog.title}</h3>
              <p className="text-sm text-gray-600 mb-4">{blog.description.substring(0, 100)}...</p>
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    setEditingBlog(blog)
                    setShowForm(true)
                  }}
                  className="text-blue-600"
                >
                  <Edit2 size={18} />
                </button>
                <button onClick={() => handleDelete(blog.id)} className="text-red-600">
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
