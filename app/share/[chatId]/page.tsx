import { APP_DOMAIN } from "@/lib/config"
import { isSupabaseEnabled } from "@/lib/supabase/config"
import type { Metadata } from "next"
import { notFound } from "next/navigation"

export const dynamic = "force-static"

export async function generateMetadata({
  params,
}: {
  params: Promise<{ chatId: string }>
}): Promise<Metadata> {
  if (!isSupabaseEnabled) {
    return notFound()
  }

  const { chatId } = await params

  // In local-only mode, we can't access the database for metadata
  // Return default metadata
  const title = "Chat"
  const description = "A chat in Zola"

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: "article",
      url: `${APP_DOMAIN}/share/${chatId}`,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
  }
}

export default async function ShareChat() {
  // In local-only mode, chat sharing is not available
  if (!isSupabaseEnabled) {
    return notFound()
  }

  // This page is not accessible in local-only mode
  return notFound()
}
