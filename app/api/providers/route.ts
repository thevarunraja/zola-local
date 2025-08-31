import { NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const { provider } = await request.json()

    // In local-only mode, we don't have user authentication
    // Return default values for API compatibility

    // Skip Ollama since it doesn't use API keys
    if (provider === "ollama") {
      return NextResponse.json({
        hasUserKey: false,
        provider,
      })
    }

    // In local-only mode, we use environment variables only
    return NextResponse.json({
      hasUserKey: false, // No user keys in local mode
      provider,
    })
  } catch (error) {
    console.error("Error checking provider keys:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
