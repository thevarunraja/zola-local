import { NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const { provider, apiKey } = await request.json()

    if (!provider || !apiKey) {
      return NextResponse.json(
        { error: "Provider and API key are required" },
        { status: 400 }
      )
    }

    // Since we're using client-side local storage, we'll return success
    // The actual storage will be handled on the client side
    return NextResponse.json({
      success: true,
      message: "API key will be saved locally",
    })
  } catch (error) {
    console.error("Error in user-keys-local API:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

export async function GET() {
  try {
    // Return empty object since keys are stored client-side
    return NextResponse.json({
      keys: {},
      message: "API keys are stored locally in your browser",
    })
  } catch (error) {
    console.error("Error in user-keys-local GET API:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
