import { AUTH_DAILY_MESSAGE_LIMIT, DAILY_LIMIT_PRO_MODELS } from "@/lib/config"
import { validateUserIdentity } from "@/lib/server/api"

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export async function getMessageUsage(
  userId: string,
  _isAuthenticated: boolean
) {
  await validateUserIdentity(userId)

  // In local-only mode, usage tracking is handled client-side
  // Return default values since server can't access localStorage
  const dailyCount = 0
  const dailyProCount = 0
  const dailyLimit = AUTH_DAILY_MESSAGE_LIMIT

  return {
    dailyCount,
    dailyProCount,
    dailyLimit,
    remaining: dailyLimit - dailyCount,
    remainingPro: DAILY_LIMIT_PRO_MODELS - dailyProCount,
  }
}
