import { toast } from "@/components/ui/toast"
import { checkRateLimits } from "@/lib/api"
import type { Chats } from "@/lib/chat-store/types"
import { REMAINING_QUERY_ALERT_THRESHOLD } from "@/lib/config"
import { Message } from "@ai-sdk/react"
import { useCallback } from "react"

type UseChatOperationsProps = {
  isAuthenticated: boolean
  chatId: string | null
  messages: Message[]
  selectedModel: string
  systemPrompt: string
  createNewChat: (
    title?: string,
    model?: string,
    isAuthenticated?: boolean,
    systemPrompt?: string,
    projectId?: string
  ) => Promise<Chats | undefined>
  setMessages: (
    messages: Message[] | ((messages: Message[]) => Message[])
  ) => void
  setInput: (input: string) => void
}

export function useChatOperations({
  isAuthenticated,
  chatId,
  messages,
  selectedModel,
  systemPrompt,
  createNewChat,
  setMessages,
}: UseChatOperationsProps) {
  // Chat utilities
  const checkLimitsAndNotify = async (uid: string): Promise<boolean> => {
    try {
      const rateData = await checkRateLimits(uid, isAuthenticated)

      if (rateData.remaining === REMAINING_QUERY_ALERT_THRESHOLD) {
        toast({
          title: `Only ${rateData.remaining} quer${
            rateData.remaining === 1 ? "y" : "ies"
          } remaining today.`,
          status: "info",
        })
      }

      if (rateData.remainingPro === REMAINING_QUERY_ALERT_THRESHOLD) {
        toast({
          title: `Only ${rateData.remainingPro} pro quer${
            rateData.remainingPro === 1 ? "y" : "ies"
          } remaining today.`,
          status: "info",
        })
      }

      return true
    } catch (err) {
      console.error("Rate limit check failed:", err)
      return false
    }
  }

  const ensureChatExists = async (userId: string, input: string) => {
    // For guest users, always create a new chat for new conversations
    // Only reuse existing chat if we're in an existing chat (chatId is present)
    if (!isAuthenticated) {
      if (chatId) {
        // We're already in a chat, return the current chat ID
        return chatId
      }
      // No current chat, so create a new one for this conversation
    }

    if (messages.length === 0) {
      try {
        const newChat = await createNewChat(
          input,
          selectedModel,
          isAuthenticated,
          systemPrompt
        )

        if (!newChat) return null
        if (isAuthenticated) {
          window.history.pushState(null, "", `/c/${newChat.id}`)
        } else {
          // Don't store guest chat ID in localStorage anymore
          // Each conversation should be separate
          window.history.pushState(null, "", `/c/${newChat.id}`)
        }

        return newChat.id
      } catch (err: unknown) {
        let errorMessage = "Something went wrong."
        try {
          const errorObj = err as { message?: string }
          if (errorObj.message) {
            const parsed = JSON.parse(errorObj.message)
            errorMessage = parsed.error || errorMessage
          }
        } catch {
          const errorObj = err as { message?: string }
          errorMessage = errorObj.message || errorMessage
        }
        toast({
          title: errorMessage,
          status: "error",
        })
        return null
      }
    }

    return chatId
  }

  // Message handlers
  const handleDelete = useCallback(
    (id: string) => {
      setMessages(messages.filter((message) => message.id !== id))
    },
    [messages, setMessages]
  )

  const handleEdit = useCallback(
    (id: string, newText: string) => {
      setMessages(
        messages.map((message) =>
          message.id === id ? { ...message, content: newText } : message
        )
      )
    },
    [messages, setMessages]
  )

  return {
    // Utils
    checkLimitsAndNotify,
    ensureChatExists,

    // Handlers
    handleDelete,
    handleEdit,
  }
}
