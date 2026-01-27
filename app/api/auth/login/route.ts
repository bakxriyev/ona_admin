export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { email, password } = body

    console.log("[v0] API Route: Received login request for:", email)

    const backendUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"
    console.log("[v0] API Route: Backend URL:", backendUrl)
    console.log("[v0] API Route: Sending password:", password)

    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 15000) // 15 second timeout

    const response = await fetch(`${backendUrl}/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password }),
      signal: controller.signal,
    })

    clearTimeout(timeoutId)
    console.log("[v0] API Route: Backend responded with status:", response.status)

    const data = await response.json().catch(() => ({}))
    console.log("[v0] API Route: Backend response data:", JSON.stringify(data, null, 2))

    if (!response.ok) {
      const errorMessage = data?.error || data?.message || `Backend returned ${response.status}: ${response.statusText}`
      console.log("[v0] API Route: Error - ", errorMessage)
      return Response.json({ error: errorMessage }, { status: response.status })
    }

    console.log("[v0] API Route: Login successful, returning token")
    return Response.json({
      ...data,
      token: data.token || data.access_token || data.accessToken || data.data?.token,
    })
  } catch (error) {
    console.error("[v0] API Route: Catch block error:", error)
    let message = "Server error"

    if (error instanceof TypeError && error.message.includes("fetch")) {
      message = `Cannot reach backend at ${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"}. Make sure backend is running.`
    } else if (error instanceof Error) {
      message = error.message
    }

    console.log("[v0] API Route: Returning error:", message)
    return Response.json({ error: message }, { status: 500 })
  }
}
