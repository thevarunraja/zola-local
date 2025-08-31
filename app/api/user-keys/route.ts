import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    const { provider, apiKey } = await request.json()

    if (!provider || !apiKey) {
      return NextResponse.json(
        { error: "Provider and API key are required" },
        { status: 400 }
      )
    }

    // In local-only mode, we don't store user API keys
    // This endpoint returns success for compatibility but doesn't persist anything
    console.log(
      "Local mode: User API key would be stored for provider:",
      provider
    )

    return NextResponse.json({
      success: true,
      isNewKey: true,
      message: "Local mode: API keys are not stored",
    })
  } catch (error) {
    console.error("Error in POST /api/user-keys:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

export async function DELETE(request: Request) {
  try {
    const { provider } = await request.json()

    if (!provider) {
      return NextResponse.json(
        { error: "Provider is required" },
        { status: 400 }
      )
    }

    // In local-only mode, we don't store user API keys
    // This endpoint returns success for compatibility
    console.log(
      "Local mode: User API key would be deleted for provider:",
      provider
    )

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error in DELETE /api/user-keys:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
