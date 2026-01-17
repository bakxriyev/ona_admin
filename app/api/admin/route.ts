const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"

export async function GET() {
  try {
    const response = await fetch(`${BACKEND_URL}/admin`, {
      headers: { "Content-Type": "application/json" },
    })
    if (!response.ok) throw new Error("Failed to fetch")
    return Response.json(await response.json())
  } catch (error) {
    return Response.json({ error: "Server error" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const response = await fetch(`${BACKEND_URL}/admin`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    })
    if (!response.ok) throw new Error("Failed to create")
    return Response.json(await response.json(), { status: 201 })
  } catch (error) {
    return Response.json({ error: "Server error" }, { status: 500 })
  }
}
