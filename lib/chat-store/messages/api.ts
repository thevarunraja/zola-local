import type { Message as MessageAISDK } from "ai"
import { readFromIndexedDB, writeToIndexedDB } from "../persist"

export async function getMessagesFromDb(
  chatId: string
): Promise<MessageAISDK[]> {
  console.log("getMessagesFromDb: Starting for chatId:", chatId)
  // In local mode, only use IndexedDB cache
  const cached = await getCachedMessages(chatId)
  console.log("getMessagesFromDb: Returning", cached.length, "messages")
  return cached
}

type ChatMessageEntry = {
  id: string
  messages: MessageAISDK[]
}

export async function getCachedMessages(
  chatId: string
): Promise<MessageAISDK[]> {
  console.log("getCachedMessages: Loading messages for chatId:", chatId)

  try {
    const entry = await readFromIndexedDB<ChatMessageEntry>("messages", chatId)
    console.log("getCachedMessages: Raw entry from IndexedDB:", entry)

    if (!entry || Array.isArray(entry)) {
      console.log("getCachedMessages: No messages found, returning empty array")
      return []
    }

    const messages = (entry.messages || []).sort(
      (a, b) => +new Date(a.createdAt || 0) - +new Date(b.createdAt || 0)
    )
    console.log(
      "getCachedMessages: Returning",
      messages.length,
      "sorted messages"
    )
    console.log("getCachedMessages: First few messages:", messages.slice(0, 2))
    return messages
  } catch (error) {
    console.error("getCachedMessages: Error loading messages:", error)
    return []
  }
}

export async function cacheMessages(
  chatId: string,
  messages: MessageAISDK[]
): Promise<void> {
  console.log(
    "cacheMessages: Saving",
    messages.length,
    "messages for chatId:",
    chatId
  )
  console.log("cacheMessages: Sample messages:", messages.slice(0, 2))
  await writeToIndexedDB("messages", { id: chatId, messages })
  console.log("cacheMessages: Successfully saved messages to IndexedDB")
}

export async function addMessage(
  chatId: string,
  message: MessageAISDK
): Promise<void> {
  console.log("addMessage: Adding message to chatId:", chatId, "Message:", {
    id: message.id,
    role: message.role,
    content: message.content.substring(0, 100) + "...",
  })

  // In local mode, we only store in IndexedDB
  const current = await getCachedMessages(chatId)
  const updated = [...current, message]

  await writeToIndexedDB("messages", { id: chatId, messages: updated })
  console.log(
    "addMessage: Successfully added message, total messages:",
    updated.length
  )
}

export async function setMessages(
  chatId: string,
  messages: MessageAISDK[]
): Promise<void> {
  console.log(
    "setMessages: Setting",
    messages.length,
    "messages for chatId:",
    chatId
  )
  // In local mode, we only store in IndexedDB
  await writeToIndexedDB("messages", { id: chatId, messages })
  console.log("setMessages: Successfully set messages")
}

export async function clearMessagesCache(chatId: string): Promise<void> {
  console.log("clearMessagesCache: Clearing messages for chatId:", chatId)
  await writeToIndexedDB("messages", { id: chatId, messages: [] })
  console.log("clearMessagesCache: Successfully cleared messages")
}

export async function clearMessagesForChat(chatId: string): Promise<void> {
  console.log("clearMessagesForChat: Clearing messages for chatId:", chatId)
  // In local mode, clearing cache is sufficient
  await clearMessagesCache(chatId)
}
