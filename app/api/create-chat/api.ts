import { checkUsageByModel } from "@/lib/usage"

type CreateChatInput = {
  userId: string
  title?: string
  model: string
  isAuthenticated: boolean
  projectId?: string
}

export async function createChatInDb({
  userId,
  title,
  model,
  isAuthenticated,
  projectId,
}: CreateChatInput) {
  // Since we removed Supabase, we're always in local mode
  // Check usage limits (now uses localStorage)
  await checkUsageByModel(userId, model, isAuthenticated)

  // Generate a local chat object
  return {
    id: crypto.randomUUID(),
    user_id: userId,
    title: title || "New Chat",
    model,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    project_id: projectId || null,
    public: false,
    pinned: false,
    pinned_at: null,
  }
}
