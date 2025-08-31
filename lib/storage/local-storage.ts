import type { UserPreferences } from "@/lib/user-preference-store/utils"

/**
 * Local storage manager for persisting data without authentication
 */

export interface LocalUser {
  id: string
  display_name: string | null
  email: string
  created_at: string | null
  anonymous: boolean | null
  favorite_models: string[] | null
  premium: boolean | null
  profile_image: string | null
  preferences: UserPreferences
}

export class LocalStorageManager {
  private static readonly USER_KEY = "zola_user"
  private static readonly PREFERENCES_KEY = "zola_preferences"
  private static readonly API_KEYS_KEY = "zola_api_keys"

  // User management
  static getUser(): LocalUser | null {
    if (typeof window === "undefined") return null

    const userData = localStorage.getItem(this.USER_KEY)
    if (!userData) return null

    try {
      return JSON.parse(userData)
    } catch {
      return null
    }
  }

  static setUser(user: LocalUser): void {
    if (typeof window === "undefined") return
    localStorage.setItem(this.USER_KEY, JSON.stringify(user))
  }

  static createUser(): LocalUser {
    const user: LocalUser = {
      id: crypto.randomUUID(),
      display_name: "Local User",
      email: "local@zola.chat",
      created_at: new Date().toISOString(),
      anonymous: false,
      favorite_models: [], // Start with no favorite models
      premium: false,
      profile_image: null,
      preferences: this.getDefaultPreferences(),
    }

    this.setUser(user)
    return user
  }

  static getOrCreateUser(): LocalUser {
    const existingUser = this.getUser()
    if (existingUser) return existingUser
    return this.createUser()
  }

  // Preferences management
  static getDefaultPreferences(): UserPreferences {
    return {
      layout: "fullscreen",
      promptSuggestions: true,
      showToolInvocations: true,
      showConversationPreviews: true,
      multiModelEnabled: false,
      hiddenModels: [],
    }
  }

  static getPreferences(): UserPreferences {
    if (typeof window === "undefined") return this.getDefaultPreferences()

    const prefsData = localStorage.getItem(this.PREFERENCES_KEY)
    if (!prefsData) return this.getDefaultPreferences()

    try {
      return { ...this.getDefaultPreferences(), ...JSON.parse(prefsData) }
    } catch {
      return this.getDefaultPreferences()
    }
  }

  static setPreferences(preferences: Partial<UserPreferences>): void {
    if (typeof window === "undefined") return

    const currentPrefs = this.getPreferences()
    const updatedPrefs = { ...currentPrefs, ...preferences }
    localStorage.setItem(this.PREFERENCES_KEY, JSON.stringify(updatedPrefs))

    // Also update the user's preferences
    const user = this.getUser()
    if (user) {
      user.preferences = updatedPrefs
      this.setUser(user)
    }
  }

  // API Keys management
  static getApiKeys(): Record<string, string> {
    if (typeof window === "undefined") return {}

    const keysData = localStorage.getItem(this.API_KEYS_KEY)
    if (!keysData) return {}

    try {
      return JSON.parse(keysData)
    } catch {
      return {}
    }
  }

  static setApiKey(provider: string, key: string): void {
    if (typeof window === "undefined") return

    const keys = this.getApiKeys()
    keys[provider] = key
    localStorage.setItem(this.API_KEYS_KEY, JSON.stringify(keys))
  }

  static removeApiKey(provider: string): void {
    if (typeof window === "undefined") return

    const keys = this.getApiKeys()
    delete keys[provider]
    localStorage.setItem(this.API_KEYS_KEY, JSON.stringify(keys))
  }

  // Clear all data
  static clearAll(): void {
    if (typeof window === "undefined") return

    localStorage.removeItem(this.USER_KEY)
    localStorage.removeItem(this.PREFERENCES_KEY)
    localStorage.removeItem(this.API_KEYS_KEY)
  }
}
