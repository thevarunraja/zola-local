import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    const { chatId, pinned } = await request.json()

    if (!chatId || typeof pinned !== "boolean") {
      return NextResponse.json(
        { error: "Missing chatId or pinned" },
        { status: 400 }
      )
    }

    // In local-only mode, chat pin updates are handled client-side
    // This endpoint just returns success for API compatibility
    console.log("Local mode: Chat pin toggle handled client-side", {
      chatId,
      pinned,
    })

    return NextResponse.json({ success: true }, { status: 200 })
  } catch (error) {
    console.error("toggle-chat-pin unhandled error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
