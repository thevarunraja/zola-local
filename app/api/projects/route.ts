import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    // For local storage mode, we don't support server-side project creation
    // Projects would be managed client-side
    const { name } = await request.json()

    // Return a mock project for compatibility
    const mockProject = {
      id: Date.now().toString(),
      name,
      user_id: "local-user",
      created_at: new Date().toISOString(),
    }

    return NextResponse.json(mockProject)
  } catch (err: unknown) {
    console.error("Error in projects endpoint:", err)

    return new Response(
      JSON.stringify({
        error: (err as Error).message || "Internal server error",
      }),
      { status: 500 }
    )
  }
}

export async function GET() {
  try {
    // For local storage mode, return empty projects array
    // Projects would be managed client-side
    return NextResponse.json([])
  } catch (err: unknown) {
    console.error("Error in projects GET endpoint:", err)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
