"use client"

import { useState, useEffect } from "react"
import { Plus, Edit2, Trash2, Loader2, Newspaper } from "lucide-react"
import { Modal } from "@/components/ui/modal"
import { NewsForm } from "@/components/forms/news-form"
import { Toast } from "@/components/ui/toast"

interface News {
  id: number
  title: string
  title_ru: string
  description: string
  description_ru: string
  date: string
  photo?: string
  video?: string
}

export function NewsManagement() {
  const [newsList, setNewsList] = useState<News[]>([])
  const [loading, setLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingNews, setEditingNews] = useState<News | null>(null)
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null)


      const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3030"


  useEffect(() => {
    fetchNews()
  }, [])

  const fetchNews = async () => {
    try {
      setLoading(true)
      const response = await fetch(`${BACKEND_URL}/news`)
      if (response.ok) {
        const data = await response.json()
        setNewsList(data)
      }
    } catch (error) {
      setToast({ message: "Failed to load news", type: "error" })
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this news article?")) return

    try {
      const response = await fetch(`${BACKEND_URL}/news/${id}`, { method: "DELETE" })
      if (response.ok) {
        setNewsList(newsList.filter((n) => n.id !== id))
        setToast({ message: "News deleted successfully", type: "success" })
      } else {
        setToast({ message: "Failed to delete news", type: "error" })
      }
    } catch {
      setToast({ message: "Error deleting news", type: "error" })
    }
  }

  const handleAddNew = () => {
    setEditingNews(null)
    setIsModalOpen(true)
  }

  const handleEdit = (news: News) => {
    setEditingNews(news)
    setIsModalOpen(true)
  }

  const handleModalClose = () => {
    setIsModalOpen(false)
    setEditingNews(null)
  }

  const handleSaveSuccess = () => {
    setIsModalOpen(false)
    setEditingNews(null)
    fetchNews()
    setToast({ message: "News saved successfully", type: "success" })
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <div className="text-center">
          <Loader2 size={48} className="animate-spin text-emerald-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading news...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 lg:p-8 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center shadow-lg">
            <Newspaper className="text-white" size={24} />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">News Management</h1>
            <p className="text-gray-600 text-sm">Manage your news articles</p>
          </div>
        </div>
        <button
          onClick={handleAddNew}
          className="bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white px-6 py-3 rounded-lg font-medium shadow-lg hover:shadow-xl transition-all duration-200 flex items-center gap-2"
        >
          <Plus size={20} />
          Add News
        </button>
      </div>

      {/* News Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {newsList.map((news) => (
          <div
            key={news.id}
            className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-xl transition-all duration-200 hover:scale-[1.02] border border-gray-100"
          >{news.photo && (
  <div className="relative h-48 bg-gray-100">
    <img
      src={
        news.photo.startsWith("http")
          ? news.photo
          : `${BACKEND_URL}/uploads/news/${news.photo}`
      }
      alt={news.title}
      className="w-full h-full object-cover"
    />
  </div>
)}

            <div className="p-5">
              <p className="text-xs text-emerald-600 font-semibold mb-2">
                {new Date(news.date).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </p>
              <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-2">{news.title}</h3>
              <p className="text-sm text-gray-600 mb-4 line-clamp-3">{news.description}</p>
              <div className="flex gap-2 pt-4 border-t border-gray-100">
                <button
                  onClick={() => handleEdit(news)}
                  className="flex-1 bg-blue-50 hover:bg-blue-100 text-blue-600 px-4 py-2 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
                >
                  <Edit2 size={16} />
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(news.id)}
                  className="flex-1 bg-red-50 hover:bg-red-100 text-red-600 px-4 py-2 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
                >
                  <Trash2 size={16} />
                  Delete
                </button>
              </div>
            </div>
          </div>
        ))}

        {newsList.length === 0 && (
          <div className="col-span-full text-center py-12">
            <Newspaper size={64} className="mx-auto text-gray-300 mb-4" />
            <p className="text-gray-500 text-lg">No news articles yet</p>
            <p className="text-gray-400 text-sm">Click "Add News" to create your first article</p>
          </div>
        )}
      </div>

      {/* Modal with Form */}
      <Modal
        isOpen={isModalOpen}
        onClose={handleModalClose}
        title={editingNews ? "Edit News Article" : "Add News Article"}
      >
        <NewsForm news={editingNews} onSave={handleSaveSuccess} onCancel={handleModalClose} setToast={setToast} />
      </Modal>

      {/* Toast Notification */}
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  )
}
