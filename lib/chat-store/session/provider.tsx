"use client"

import { usePathname } from "next/navigation"
import { createContext, useContext, useMemo } from "react"

const ChatSessionContext = createContext<{ chatId: string | null }>({
  chatId: null,
})

export const useChatSession = () => useContext(ChatSessionContext)

export function ChatSessionProvider({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const chatId = useMemo(() => {
    console.log("ChatSessionProvider: pathname:", pathname)
    if (pathname?.startsWith("/c/")) {
      const id = pathname.split("/c/")[1]
      console.log("ChatSessionProvider: extracted chatId:", id)
      return id
    }
    console.log("ChatSessionProvider: no chatId found")
    return null
  }, [pathname])

  console.log("ChatSessionProvider: providing chatId:", chatId)

  return (
    <ChatSessionContext.Provider value={{ chatId }}>
      {children}
    </ChatSessionContext.Provider>
  )
}
