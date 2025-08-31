import { ChatContainer } from "@/app/components/chat/chat-container"
import { LayoutApp } from "@/app/components/layout/layout-app"

export default async function Page() {
  // Since Supabase is removed, we no longer need authentication checks
  // This runs in local mode only

  return (
    <LayoutApp>
      <ChatContainer />
    </LayoutApp>
  )
}
