import {
  LocalStorageManager,
  type LocalUser,
} from "@/lib/storage/local-storage"
import { defaultPreferences } from "@/lib/user-preference-store/utils"
import type { UserProfile } from "./types"

export async function getSupabaseUser() {
  return { supabase: null, user: null }
}

export async function getUserProfile(): Promise<UserProfile | null> {
  // For server-side rendering, return null and let client-side handle it
  if (typeof window === "undefined") {
    return {
      id: "local-user",
      email: "local@zola.chat",
      display_name: "Local User",
      profile_image: "",
      anonymous: false,
      created_at: new Date().toISOString(),
      premium: false,
      favorite_models: ["claude-3-5-sonnet-20241022"],
      message_count: null,
      daily_message_count: null,
      daily_reset: null,
      last_active_at: null,
      daily_pro_message_count: null,
      daily_pro_reset: null,
      system_prompt: null,
      preferences: defaultPreferences,
    }
  }

  const localUser = LocalStorageManager.getOrCreateUser()
  return convertToUserProfile(localUser)
}

function convertToUserProfile(localUser: LocalUser): UserProfile {
  return {
    id: localUser.id,
    email: localUser.email,
    display_name: localUser.display_name || "Local User",
    profile_image: localUser.profile_image || "",
    anonymous: localUser.anonymous,
    created_at: localUser.created_at,
    premium: localUser.premium,
    favorite_models: localUser.favorite_models,
    message_count: null,
    daily_message_count: null,
    daily_reset: null,
    last_active_at: null,
    daily_pro_message_count: null,
    daily_pro_reset: null,
    system_prompt: null,
    preferences: localUser.preferences,
  }
}
