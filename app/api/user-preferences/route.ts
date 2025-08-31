import { NextRequest, NextResponse } from "next/server"

export async function GET() {
  try {
    // Return default preferences since we're using local storage
    return NextResponse.json({
      layout: "fullscreen",
      prompt_suggestions: true,
      show_tool_invocations: true,
      show_conversation_previews: true,
      multi_model_enabled: false,
      hidden_models: [],
    })
  } catch (error) {
    console.error("Error in user-preferences GET API:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    // Parse the request body
    const body = await request.json()
    const {
      layout,
      prompt_suggestions,
      show_tool_invocations,
      show_conversation_previews,
      multi_model_enabled,
      hidden_models,
    } = body

    // Validate the data types
    if (layout && typeof layout !== "string") {
      return NextResponse.json(
        { error: "layout must be a string" },
        { status: 400 }
      )
    }

    if (hidden_models && !Array.isArray(hidden_models)) {
      return NextResponse.json(
        { error: "hidden_models must be an array" },
        { status: 400 }
      )
    }

    // In local-only mode, we just return success without persisting
    // Preferences are handled client-side
    console.log("Local mode: User preferences update", body)

    return NextResponse.json({
      success: true,
      layout: layout || "fullscreen",
      prompt_suggestions: prompt_suggestions ?? true,
      show_tool_invocations: show_tool_invocations ?? true,
      show_conversation_previews: show_conversation_previews ?? true,
      multi_model_enabled: multi_model_enabled ?? false,
      hidden_models: hidden_models || [],
    })
  } catch (error) {
    console.error("Error in user-preferences PUT API:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
