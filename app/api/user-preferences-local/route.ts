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

    if (
      prompt_suggestions !== undefined &&
      typeof prompt_suggestions !== "boolean"
    ) {
      return NextResponse.json(
        { error: "prompt_suggestions must be a boolean" },
        { status: 400 }
      )
    }

    if (
      show_tool_invocations !== undefined &&
      typeof show_tool_invocations !== "boolean"
    ) {
      return NextResponse.json(
        { error: "show_tool_invocations must be a boolean" },
        { status: 400 }
      )
    }

    if (
      show_conversation_previews !== undefined &&
      typeof show_conversation_previews !== "boolean"
    ) {
      return NextResponse.json(
        { error: "show_conversation_previews must be a boolean" },
        { status: 400 }
      )
    }

    if (
      multi_model_enabled !== undefined &&
      typeof multi_model_enabled !== "boolean"
    ) {
      return NextResponse.json(
        { error: "multi_model_enabled must be a boolean" },
        { status: 400 }
      )
    }

    if (hidden_models !== undefined && !Array.isArray(hidden_models)) {
      return NextResponse.json(
        { error: "hidden_models must be an array" },
        { status: 400 }
      )
    }

    // Return the updated preferences (stored client-side)
    return NextResponse.json({
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
