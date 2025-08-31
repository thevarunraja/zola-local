import { env } from "./openproviders/env"
import { Provider } from "./openproviders/types"

export type { Provider } from "./openproviders/types"
export type ProviderWithoutOllama = Exclude<Provider, "ollama">

export async function getUserKey(
  userId: string,
  provider: Provider
): Promise<string | null> {
  // In local-only mode, we don't store user keys
  // Always return null so it falls back to environment variables
  console.log("Local mode: No user keys stored for", userId, provider)
  return null
}

export async function getEffectiveApiKey(
  userId: string | null,
  provider: ProviderWithoutOllama
): Promise<string | null> {
  // In local-only mode, we only use environment variables
  const envKeyMap: Record<ProviderWithoutOllama, string | undefined> = {
    openai: env.OPENAI_API_KEY,
    mistral: env.MISTRAL_API_KEY,
    perplexity: env.PERPLEXITY_API_KEY,
    google: env.GOOGLE_GENERATIVE_AI_API_KEY,
    anthropic: env.ANTHROPIC_API_KEY,
    xai: env.XAI_API_KEY,
    openrouter: env.OPENROUTER_API_KEY,
  }

  return envKeyMap[provider] || null
}
