import { UsageLimitError } from "@/lib/api"
import {
  AUTH_DAILY_MESSAGE_LIMIT,
  DAILY_LIMIT_PRO_MODELS,
  FREE_MODELS_IDS,
} from "@/lib/config"

const isFreeModel = (modelId: string) => FREE_MODELS_IDS.includes(modelId)
const isProModel = (modelId: string) => !isFreeModel(modelId)

// Local storage keys for usage tracking
const DAILY_COUNT_KEY = "zola_daily_count"
const DAILY_RESET_KEY = "zola_daily_reset"
const PRO_DAILY_COUNT_KEY = "zola_pro_daily_count"
const PRO_DAILY_RESET_KEY = "zola_pro_daily_reset"

/**
 * Checks the user's daily usage to see if they've reached their limit.
 * Uses local storage for tracking in the absence of Supabase.
 *
 * @param userId - The ID of the user (unused in local mode but kept for compatibility)
 * @throws UsageLimitError if the daily limit is reached
 * @returns User data including message counts and reset date
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export async function checkUsage(_userId: string) {
  // For local mode, we assume all users are authenticated
  const dailyLimit = AUTH_DAILY_MESSAGE_LIMIT

  // Get current usage from localStorage
  const dailyCountStr = localStorage.getItem(DAILY_COUNT_KEY)
  const dailyResetStr = localStorage.getItem(DAILY_RESET_KEY)

  let dailyCount = dailyCountStr ? parseInt(dailyCountStr, 10) : 0
  const lastReset = dailyResetStr ? new Date(dailyResetStr) : null

  // Check if we need to reset daily counter
  const now = new Date()
  const isNewDay =
    !lastReset ||
    now.getUTCFullYear() !== lastReset.getUTCFullYear() ||
    now.getUTCMonth() !== lastReset.getUTCMonth() ||
    now.getUTCDate() !== lastReset.getUTCDate()

  if (isNewDay) {
    dailyCount = 0
    localStorage.setItem(DAILY_COUNT_KEY, "0")
    localStorage.setItem(DAILY_RESET_KEY, now.toISOString())
  }

  // Check if the daily limit is reached
  if (dailyCount >= dailyLimit) {
    throw new UsageLimitError("Daily message limit reached.")
  }

  return {
    userData: {
      message_count: 0, // Not tracked locally
      daily_message_count: dailyCount,
      daily_reset: now.toISOString(),
      anonymous: false, // Local mode assumes authenticated
      premium: false, // Local mode assumes free tier
    },
    dailyCount,
    dailyLimit,
  }
}

/**
 * Increments both overall and daily message counters for a user.
 *
 * @param userId - The ID of the user (unused in local mode but kept for compatibility)
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export async function incrementUsage(_userId: string): Promise<void> {
  const dailyCountStr = localStorage.getItem(DAILY_COUNT_KEY)
  const dailyCount = dailyCountStr ? parseInt(dailyCountStr, 10) : 0

  const newDailyCount = dailyCount + 1
  localStorage.setItem(DAILY_COUNT_KEY, newDailyCount.toString())
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export async function checkProUsage(_userId: string) {
  const dailyProCountStr = localStorage.getItem(PRO_DAILY_COUNT_KEY)
  const dailyProResetStr = localStorage.getItem(PRO_DAILY_RESET_KEY)

  let dailyProCount = dailyProCountStr ? parseInt(dailyProCountStr, 10) : 0
  const lastReset = dailyProResetStr ? new Date(dailyProResetStr) : null

  const now = new Date()
  const isNewDay =
    !lastReset ||
    now.getUTCFullYear() !== lastReset.getUTCFullYear() ||
    now.getUTCMonth() !== lastReset.getUTCMonth() ||
    now.getUTCDate() !== lastReset.getUTCDate()

  if (isNewDay) {
    dailyProCount = 0
    localStorage.setItem(PRO_DAILY_COUNT_KEY, "0")
    localStorage.setItem(PRO_DAILY_RESET_KEY, now.toISOString())
  }

  if (dailyProCount >= DAILY_LIMIT_PRO_MODELS) {
    throw new UsageLimitError("Daily Pro model limit reached.")
  }

  return {
    dailyProCount,
    limit: DAILY_LIMIT_PRO_MODELS,
  }
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export async function incrementProUsage(_userId: string) {
  const dailyProCountStr = localStorage.getItem(PRO_DAILY_COUNT_KEY)
  const dailyProCount = dailyProCountStr ? parseInt(dailyProCountStr, 10) : 0

  const newCount = dailyProCount + 1
  localStorage.setItem(PRO_DAILY_COUNT_KEY, newCount.toString())
}

export async function checkUsageByModel(
  userId: string,
  modelId: string,
  isAuthenticated: boolean
) {
  if (isProModel(modelId)) {
    if (!isAuthenticated) {
      throw new UsageLimitError("You must log in to use this model.")
    }
    return await checkProUsage(userId)
  }

  return await checkUsage(userId)
}

export async function incrementUsageByModel(
  userId: string,
  modelId: string,
  isAuthenticated: boolean
) {
  if (isProModel(modelId)) {
    if (!isAuthenticated) return
    return await incrementProUsage(userId)
  }

  return await incrementUsage(userId)
}
