export async function POST(request: Request) {
  try {
    const { userId, title, model, projectId } = await request.json()

    if (!userId) {
      return new Response(JSON.stringify({ error: "Missing userId" }), {
        status: 400,
      })
    }

    // For local storage mode, create a simple chat object without database storage
    const chat = {
      id: crypto.randomUUID(),
      title: title || "New Chat",
      model: model || "claude-3-5-sonnet-20241022",
      user_id: userId,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      project_id: projectId || null,
      public: true,
      pinned: false,
      pinned_at: null,
    }

    return new Response(JSON.stringify({ chat }), { status: 200 })
  } catch (err: unknown) {
    console.error("Error in create-chat endpoint:", err)

    return new Response(
      JSON.stringify({
        error: (err as Error).message || "Internal server error",
      }),
      { status: 500 }
    )
  }
}
