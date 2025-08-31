"use client"

import { toast } from "@/components/ui/toast"
import { useChatSession } from "@/lib/chat-store/session/provider"
import type { Message as MessageAISDK } from "ai"
import { createContext, useContext, useEffect, useState } from "react"
import { writeToIndexedDB } from "../persist"
import {
  cacheMessages,
  clearMessagesForChat,
  getCachedMessages,
  getMessagesFromDb,
  setMessages as saveMessages,
} from "./api"

interface MessagesContextType {
  messages: MessageAISDK[]
  isLoading: boolean
  setMessages: React.Dispatch<React.SetStateAction<MessageAISDK[]>>
  refresh: () => Promise<void>
  saveAllMessages: (messages: MessageAISDK[]) => Promise<void>
  cacheAndAddMessage: (
    message: MessageAISDK,
    explicitChatId?: string
  ) => Promise<void>
  resetMessages: () => Promise<void>
  deleteMessages: () => Promise<void>
}

const MessagesContext = createContext<MessagesContextType | null>(null)

export function useMessages() {
  const context = useContext(MessagesContext)
  if (!context)
    throw new Error("useMessages must be used within MessagesProvider")
  return context
}

export function MessagesProvider({ children }: { children: React.ReactNode }) {
  const [messages, setMessages] = useState<MessageAISDK[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const { chatId } = useChatSession()

  console.log(
    "MessagesProvider: Rendered with chatId:",
    chatId,
    "messages count:",
    messages.length
  )

  useEffect(() => {
    console.log("MessagesProvider: useEffect for chatId change:", chatId)
    if (chatId === null) {
      console.log("MessagesProvider: ChatId is null, clearing messages")
      setMessages([])
      setIsLoading(false)
    } else {
      console.log(
        "MessagesProvider: ChatId changed to:",
        chatId,
        "setting loading to true"
      )
      setIsLoading(true)
    }
  }, [chatId])

  useEffect(() => {
    console.log(
      "MessagesProvider: useEffect for loading messages, chatId:",
      chatId
    )
    if (!chatId) {
      console.log("MessagesProvider: No chatId, skipping load")
      return
    }

    const load = async () => {
      console.log("MessagesProvider: Loading messages for chatId:", chatId)
      setIsLoading(true)
      const cached = await getCachedMessages(chatId)
      console.log("MessagesProvider: Got cached messages:", cached.length)
      setMessages(cached)

      try {
        const fresh = await getMessagesFromDb(chatId)
        console.log(
          "MessagesProvider: Got fresh messages from DB:",
          fresh.length
        )
        setMessages(fresh)
        cacheMessages(chatId, fresh)
      } catch (error) {
        console.error("Failed to fetch messages:", error)
      } finally {
        setIsLoading(false)
      }
    }

    load()
  }, [chatId])

  const refresh = async () => {
    if (!chatId) return

    try {
      const fresh = await getMessagesFromDb(chatId)
      setMessages(fresh)
    } catch {
      toast({ title: "Failed to refresh messages", status: "error" })
    }
  }

  const cacheAndAddMessage = async (
    message: MessageAISDK,
    explicitChatId?: string
  ) => {
    const targetChatId = explicitChatId || chatId
    console.log(
      "MessagesProvider: cacheAndAddMessage called with chatId:",
      chatId,
      "explicitChatId:",
      explicitChatId,
      "targetChatId:",
      targetChatId,
      "message:",
      message
    )
    if (!targetChatId) {
      console.log("MessagesProvider: No targetChatId, skipping cache")
      return
    }

    console.log("cacheAndAddMessage: Adding message to chatId:", targetChatId)
    console.log("cacheAndAddMessage: Message:", message)

    try {
      setMessages((prev: MessageAISDK[]) => {
        const updated = [...prev, message]
        console.log(
          "cacheAndAddMessage: Updated messages array has",
          updated.length,
          "messages"
        )
        writeToIndexedDB("messages", { id: targetChatId, messages: updated })
        return updated
      })
    } catch {
      toast({ title: "Failed to save message", status: "error" })
    }
  }

  const saveAllMessages = async (newMessages: MessageAISDK[]) => {
    // @todo: manage the case where the chatId is null (first time the user opens the chat)
    if (!chatId) return

    try {
      await saveMessages(chatId, newMessages)
      setMessages(newMessages)
    } catch {
      toast({ title: "Failed to save messages", status: "error" })
    }
  }

  const deleteMessages = async () => {
    if (!chatId) return

    setMessages([])
    await clearMessagesForChat(chatId)
  }

  const resetMessages = async () => {
    setMessages([])
  }

  return (
    <MessagesContext.Provider
      value={{
        messages,
        isLoading,
        setMessages,
        refresh,
        saveAllMessages,
        cacheAndAddMessage,
        resetMessages,
        deleteMessages,
      }}
    >
      {children}
    </MessagesContext.Provider>
  )
}
