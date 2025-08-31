// app/providers/user-provider.tsx
"use client"

import {
  LocalStorageManager,
  type LocalUser,
} from "@/lib/storage/local-storage"
import type { UserProfile } from "@/lib/user/types"
import { createContext, useContext, useEffect, useState } from "react"

type UserContextType = {
  user: UserProfile | null
  isLoading: boolean
  updateUser: (updates: Partial<UserProfile>) => Promise<void>
  refreshUser: () => Promise<void>
  signOut: () => Promise<void>
}

const UserContext = createContext<UserContextType | undefined>(undefined)

// Convert LocalUser to UserProfile format
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

export function UserProvider({
  children,
}: {
  children: React.ReactNode
  initialUser?: UserProfile | null
}) {
  // Start with null to avoid hydration mismatch
  const [user, setUser] = useState<UserProfile | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const refreshUser = async () => {
    setIsLoading(true)
    try {
      const localUser = LocalStorageManager.getOrCreateUser()
      setUser(convertToUserProfile(localUser))
    } finally {
      setIsLoading(false)
    }
  }

  const updateUser = async (updates: Partial<UserProfile>) => {
    if (!user?.id) return

    setIsLoading(true)
    try {
      const currentLocalUser = LocalStorageManager.getUser()
      if (currentLocalUser) {
        // Create updated local user with proper type conversion
        const updatedLocalUser: LocalUser = {
          ...currentLocalUser,
          display_name: updates.display_name ?? currentLocalUser.display_name,
          profile_image:
            updates.profile_image ?? currentLocalUser.profile_image,
          favorite_models:
            updates.favorite_models ?? currentLocalUser.favorite_models,
          preferences: updates.preferences ?? currentLocalUser.preferences,
        }
        LocalStorageManager.setUser(updatedLocalUser)
        setUser(convertToUserProfile(updatedLocalUser))
      }
    } finally {
      setIsLoading(false)
    }
  }

  const signOut = async () => {
    setIsLoading(true)
    try {
      LocalStorageManager.clearAll()
      // Create a new user immediately after clearing
      const newUser = LocalStorageManager.createUser()
      setUser(convertToUserProfile(newUser))
    } finally {
      setIsLoading(false)
    }
  }

  // Initialize user on mount
  useEffect(() => {
    const initializeUser = () => {
      setIsLoading(true)
      try {
        const localUser = LocalStorageManager.getOrCreateUser()
        setUser(convertToUserProfile(localUser))
      } finally {
        setIsLoading(false)
      }
    }

    initializeUser()
  }, [])

  return (
    <UserContext.Provider
      value={{ user, isLoading, updateUser, refreshUser, signOut }}
    >
      {children}
    </UserContext.Provider>
  )
}

// Custom hook to use the user context
export function useUser() {
  const context = useContext(UserContext)
  if (context === undefined) {
    throw new Error("useUser must be used within a UserProvider")
  }
  return context
}
