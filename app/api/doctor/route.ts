import { NextRequest, NextResponse } from 'next/server'

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"

export async function GET() {
  try {
    const response = await fetch(`${BACKEND_URL}/doctor`, {
      headers: {
        'Content-Type': 'application/json',
      },
    })
    
    if (!response.ok) {
      throw new Error(`Backend error: ${response.status}`)
    }
    
    const doctors = await response.json()
    return NextResponse.json(doctors)
  } catch (error) {
    console.error('Error fetching doctors:', error)
    return NextResponse.json(
      { error: 'Failed to fetch doctors' }, 
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    
    // Rasm va video fayllarini ajratib olish
    const photo = formData.get('photo') as File | null
    const video = formData.get('video') as File | null
    
    // Backendga yuborish uchun yangi FormData yaratish
    const backendFormData = new FormData()
    
    // Matnli ma'lumotlarni qo'shish
    backendFormData.append('first_name', formData.get('first_name') as string)
    backendFormData.append('last_name', formData.get('last_name') as string)
    backendFormData.append('age', formData.get('age') as string)
    backendFormData.append('staji', formData.get('staji') as string)
    backendFormData.append('education', formData.get('education') as string)
    backendFormData.append('specialization', formData.get('specialization') as string)
    backendFormData.append('staji_ru', formData.get('staji_ru') as string)
    backendFormData.append('education_ru', formData.get('education_ru') as string)
    backendFormData.append('specialization_ru', formData.get('specialization_ru') as string)
    
    // Ixtiyoriy maydonlar
    if (formData.get('phone_number')) {
      backendFormData.append('phone_number', formData.get('phone_number') as string)
    }
    
    if (formData.get('status')) {
      backendFormData.append('status', formData.get('status') as string)
    }
    
    if (formData.get('rating')) {
      backendFormData.append('rating', formData.get('rating') as string)
    }
    
    // Fayllarni qo'shish (agar mavjud bo'lsa)
    if (photo) {
      backendFormData.append('photo', photo)
    }
    
    if (video) {
      backendFormData.append('video', video)
    }
    
    // Backendga so'rov yuborish
    const response = await fetch(`${BACKEND_URL}/doctor`, {
      method: 'POST',
      body: backendFormData,
    })
    
    if (!response.ok) {
      const errorText = await response.text()
      console.error('Backend error:', errorText)
      throw new Error(`Backend error: ${response.status} - ${errorText}`)
    }
    
    const result = await response.json()
    
    // Yo'nalishlarni bog'lash (agar mavjud bo'lsa)
    const directionIds = formData.getAll('direction_ids[]')
    if (directionIds.length > 0) {
      try {
        await fetch(`${BACKEND_URL}/doctor/${result.id}/directions`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ direction_ids: directionIds }),
        })
      } catch (error) {
        console.warn('Failed to connect directions:', error)
        // Yo'nalishlarni bog'lay olmasak ham, doktor yaratilgan bo'ladi
      }
    }
    
    return NextResponse.json(result)
  } catch (error) {
    console.error('Error creating doctor:', error)
    return NextResponse.json(
      { 
        error: 'Failed to create doctor',
        details: error instanceof Error ? error.message : 'Unknown error'
      }, 
      { status: 500 }
    )
  }
}