// @todo: move in /lib/user/api.ts
import { toast } from "@/components/ui/toast"
import type { UserProfile } from "@/lib/user/types"

export async function fetchUserProfile(
  id: string
): Promise<UserProfile | null> {
  // In local-only mode, we don't have user profiles stored
  // Return null so the app uses guest mode
  console.log("Local mode: No user profile for", id)
  return null
}

export async function updateUserProfile(
  id: string,
  updates: Partial<UserProfile>
): Promise<boolean> {
  // In local-only mode, we don't persist user profile updates
  console.log("Local mode: User profile update not persisted", id, updates)
  return true
}

export async function signOutUser(): Promise<boolean> {
  toast({
    title: "Sign out is not supported in local-only mode",
    status: "info",
  })
  return false
}

export function subscribeToUserUpdates(userId: string) {
  // In local-only mode, we don't have real-time updates
  console.log("Local mode: No real-time user updates for", userId)
  return () => {}
}
