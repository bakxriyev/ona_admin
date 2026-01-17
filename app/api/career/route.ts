const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"

export async function GET() {
  try {
    const response = await fetch(`${BACKEND_URL}/career`)
    if (!response.ok) throw new Error("Failed to fetch")
    return Response.json(await response.json())
  } catch (error) {
    return Response.json([])
  }
}

export async function POST(request: Request) {
  try {
    const formData = await request.formData()
    const response = await fetch(`${BACKEND_URL}/career`, {
      method: "POST",
      body: formData,
    })
    if (!response.ok) throw new Error("Failed to create")
    return Response.json(await response.json(), { status: 201 })
  } catch (error) {
    return Response.json({ error: "Server error" }, { status: 500 })
  }
}
