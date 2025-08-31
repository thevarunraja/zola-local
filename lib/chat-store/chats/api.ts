import { readFromIndexedDB, writeToIndexedDB } from "@/lib/chat-store/persist"
import type { Chat, Chats } from "@/lib/chat-store/types"
import { MODEL_DEFAULT } from "../../config"
import { fetchClient } from "../../fetch"
import {
  API_ROUTE_TOGGLE_CHAT_PIN,
  API_ROUTE_UPDATE_CHAT_MODEL,
} from "../../routes"

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export async function fetchAndCacheChats(_userId: string): Promise<Chats[]> {
  return await getCachedChats()
}

export async function getCachedChats(): Promise<Chats[]> {
  console.log("getCachedChats: Starting to read from IndexedDB...")
  try {
    const all = await readFromIndexedDB<Chats>("chats")
    console.log("getCachedChats: Raw data from IndexedDB:", all)
    const chatsArray = Array.isArray(all) ? all : all ? [all] : []
    console.log(
      "getCachedChats: Converted to array:",
      chatsArray.length,
      chatsArray
    )
    const sorted = chatsArray.sort((a, b) => {
      const aTime = new Date(a.updated_at || a.created_at || 0).getTime()
      const bTime = new Date(b.updated_at || b.created_at || 0).getTime()
      return bTime - aTime
    })
    console.log(
      "getCachedChats: Returning sorted chats:",
      sorted.length,
      sorted
    )
    return sorted
  } catch (error) {
    console.error("getCachedChats: Error reading from IndexedDB:", error)
    return []
  }
}

export async function updateChatTitle(
  id: string,
  title: string
): Promise<void> {
  // Update local cache only
  const all = await getCachedChats()
  const updated = all.map((c) =>
    c.id === id ? { ...c, title, updated_at: new Date().toISOString() } : c
  )
  await writeToIndexedDB("chats", updated)
}

export async function deleteChat(id: string): Promise<void> {
  // Update local cache only
  const all = await getCachedChats()
  const filtered = all.filter((c) => c.id !== id)
  await writeToIndexedDB("chats", filtered)
}

export async function getChat(chatId: string): Promise<Chat | null> {
  const all = await readFromIndexedDB<Chat>("chats")
  return (all as Chat[]).find((c) => c.id === chatId) || null
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export async function getUserChats(_userId: string): Promise<Chat[]> {
  return await getCachedChats()
}

export async function createChat(
  userId: string,
  title: string,
  model: string,
  systemPrompt: string
): Promise<string> {
  const finalId = crypto.randomUUID()

  await writeToIndexedDB("chats", {
    id: finalId,
    title,
    model,
    user_id: userId,
    system_prompt: systemPrompt,
    created_at: new Date().toISOString(),
  })

  return finalId
}

export async function updateChatModel(chatId: string, model: string) {
  try {
    const res = await fetchClient(API_ROUTE_UPDATE_CHAT_MODEL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ chatId, model }),
    })
    const responseData = await res.json()

    if (!res.ok) {
      throw new Error(
        responseData.error ||
          `Failed to update chat model: ${res.status} ${res.statusText}`
      )
    }

    const all = await getCachedChats()
    const updated = (all as Chats[]).map((c) =>
      c.id === chatId ? { ...c, model } : c
    )
    await writeToIndexedDB("chats", updated)

    return responseData
  } catch (error) {
    console.error("Error updating chat model:", error)
    throw error
  }
}

export async function toggleChatPin(chatId: string, pinned: boolean) {
  try {
    const res = await fetchClient(API_ROUTE_TOGGLE_CHAT_PIN, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ chatId, pinned }),
    })
    const responseData = await res.json()
    if (!res.ok) {
      throw new Error(
        responseData.error ||
          `Failed to update pinned: ${res.status} ${res.statusText}`
      )
    }
    const all = await getCachedChats()
    const now = new Date().toISOString()
    const updated = (all as Chats[]).map((c) =>
      c.id === chatId ? { ...c, pinned, pinned_at: pinned ? now : null } : c
    )
    await writeToIndexedDB("chats", updated)
    return responseData
  } catch (error) {
    console.error("Error updating chat pinned:", error)
    throw error
  }
}

export async function createNewChat(
  userId: string,
  title?: string,
  model?: string,
  isAuthenticated?: boolean,
  projectId?: string
): Promise<Chats> {
  console.log("createNewChat API: Starting with params:", {
    userId,
    title,
    model,
    isAuthenticated,
    projectId,
  })

  try {
    const payload: {
      userId: string
      title: string
      model: string
      isAuthenticated?: boolean
      projectId?: string
    } = {
      userId,
      title: title || "New Chat",
      model: model || MODEL_DEFAULT,
      isAuthenticated,
    }

    if (projectId) {
      payload.projectId = projectId
    }

    console.log(
      "createNewChat API: Calling /api/create-chat with payload:",
      payload
    )

    const res = await fetchClient("/api/create-chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    })

    const responseData = await res.json()

    if (!res.ok || !responseData.chat) {
      throw new Error(responseData.error || "Failed to create chat")
    }

    const chat: Chats = {
      id: responseData.chat.id,
      title: responseData.chat.title,
      created_at: responseData.chat.created_at,
      model: responseData.chat.model,
      user_id: responseData.chat.user_id,
      public: responseData.chat.public,
      updated_at: responseData.chat.updated_at,
      project_id: responseData.chat.project_id || null,
      pinned: responseData.chat.pinned ?? false,
      pinned_at: responseData.chat.pinned_at ?? null,
    }

    // Get existing chats and add the new one
    console.log("createNewChat: Getting existing chats...")
    const existingChats = await getCachedChats()
    console.log("createNewChat: Found existing chats:", existingChats.length)
    const updatedChats = [chat, ...existingChats]
    console.log(
      "createNewChat: Writing updated chats to IndexedDB:",
      updatedChats.length
    )
    await writeToIndexedDB("chats", updatedChats)
    console.log("createNewChat: Successfully saved chat to IndexedDB")
    return chat
  } catch (error) {
    console.error("Error creating new chat:", error)
    throw error
  }
}
