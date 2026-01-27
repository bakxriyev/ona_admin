export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { email, password } = body

    // Connect to your backend API
    const backendUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"

    const response = await fetch(`${backendUrl}/admin/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    })

    if (!response.ok) {
      return Response.json({ error: "Invalid credentials" }, { status: 401 })
    }

    const data = await response.json()
    return Response.json(data)
  } catch (error) {
    return Response.json({ error: "Server error" }, { status: 500 })
  }
}
