const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3030"

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const response = await fetch(`${BACKEND_URL}/users/${params.id}`)
    if (!response.ok) throw new Error("Not found")
    return Response.json(await response.json())
  } catch (error) {
    return Response.json({ error: "Not found" }, { status: 404 })
  }
}

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    const body = await request.json()
    const response = await fetch(`${BACKEND_URL}/users/${params.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    })
    if (!response.ok) throw new Error("Failed to update")
    return Response.json(await response.json())
  } catch (error) {
    return Response.json({ error: "Server error" }, { status: 500 })
  }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    const response = await fetch(`${BACKEND_URL}/users/${params.id}`, {
      method: "DELETE",
    })
    if (!response.ok) throw new Error("Failed to delete")
    return Response.json({ success: true })
  } catch (error) {
    return Response.json({ error: "Server error" }, { status: 500 })
  }
}
