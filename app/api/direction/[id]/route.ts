import { NextRequest, NextResponse } from 'next/server'

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    
    const response = await fetch(`${BACKEND_URL}/doctor/${id}`, {
      headers: {
        'Content-Type': 'application/json',
      },
    })
    
    if (!response.ok) {
      if (response.status === 404) {
        return NextResponse.json(
          { error: 'Doctor not found' }, 
          { status: 404 }
        )
      }
      throw new Error(`Backend error: ${response.status}`)
    }
    
    const doctor = await response.json()
    return NextResponse.json(doctor)
  } catch (error) {
    console.error('Error fetching doctor:', error)
    return NextResponse.json(
      { error: 'Failed to fetch doctor' }, 
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const formData = await request.formData()
    
    // Backendga yuborish uchun yangi FormData yaratish
    const backendFormData = new FormData()
    
    // Matnli ma'lumotlarni qo'shish
    const fields = [
      'first_name', 'last_name', 'age', 'staji', 'education', 'specialization',
      'staji_ru', 'education_ru', 'specialization_ru', 'phone_number', 'status', 'rating'
    ]
    
    fields.forEach(field => {
      const value = formData.get(field)
      if (value) {
        backendFormData.append(field, value as string)
      }
    })
    
    // Fayllarni qo'shish (agar mavjud bo'lsa)
    const photo = formData.get('photo') as File | null
    const video = formData.get('video') as File | null
    
    if (photo && photo.size > 0) {
      backendFormData.append('photo', photo)
    }
    
    if (video && video.size > 0) {
      backendFormData.append('video', video)
    }
    
    // Backendga so'rov yuborish
    const response = await fetch(`${BACKEND_URL}/doctor/${id}`, {
      method: 'PUT',
      body: backendFormData,
    })
    
    if (!response.ok) {
      const errorText = await response.text()
      console.error('Backend error:', errorText)
      throw new Error(`Backend error: ${response.status} - ${errorText}`)
    }
    
    const result = await response.json()
    
    // Yo'nalishlarni yangilash (agar mavjud bo'lsa)
    const directionIds = formData.getAll('direction_ids[]')
    if (directionIds.length > 0) {
      try {
        await fetch(`${BACKEND_URL}/doctor/${id}/directions`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ direction_ids: directionIds }),
        })
      } catch (error) {
        console.warn('Failed to update directions:', error)
      }
    }
    
    return NextResponse.json(result)
  } catch (error) {
    console.error('Error updating doctor:', error)
    return NextResponse.json(
      { 
        error: 'Failed to update doctor',
        details: error instanceof Error ? error.message : 'Unknown error'
      }, 
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    
    const response = await fetch(`${BACKEND_URL}/doctor/${id}`, {
      method: 'DELETE',
    })
    
    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(`Backend error: ${response.status} - ${errorText}`)
    }
    
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting doctor:', error)
    return NextResponse.json(
      { 
        error: 'Failed to delete doctor',
        details: error instanceof Error ? error.message : 'Unknown error'
      }, 
      { status: 500 }
    )
  }
}