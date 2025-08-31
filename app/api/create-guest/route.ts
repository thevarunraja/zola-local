export async function POST(request: Request) {
  try {
    const { userId } = await request.json()

    if (!userId) {
      return new Response(JSON.stringify({ error: "Missing userId" }), {
        status: 400,
      })
    }

    // In local-only mode, we just return a guest user object
    console.log("Local mode: Creating guest user", userId)

    const guestUser = {
      id: userId,
      email: `${userId}@anonymous.example`,
      anonymous: true,
      message_count: 0,
      premium: false,
      created_at: new Date().toISOString(),
    }

    return new Response(JSON.stringify({ user: guestUser }), { status: 200 })
  } catch (err: unknown) {
    console.error("Error in create-guest endpoint:", err)

    return new Response(
      JSON.stringify({
        error: (err as Error).message || "Internal server error",
      }),
      { status: 500 }
    )
  }
}
