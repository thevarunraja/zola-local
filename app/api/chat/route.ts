import { SYSTEM_PROMPT_DEFAULT } from "@/lib/config"
import { getAllModels } from "@/lib/models"
import { Message as MessageAISDK, streamText, ToolSet } from "ai"
import { createErrorResponse, extractErrorMessage } from "./utils"

export const maxDuration = 60

type ChatRequest = {
  messages: MessageAISDK[]
  chatId: string
  userId: string
  model: string
  systemPrompt: string
  enableSearch: boolean
  message_group_id?: string
}

export async function POST(req: Request) {
  try {
    const { messages, chatId, userId, model, systemPrompt, enableSearch } =
      (await req.json()) as ChatRequest

    if (!messages || !chatId || !userId) {
      return new Response(
        JSON.stringify({ error: "Error, missing information" }),
        { status: 400 }
      )
    }

    // Skip authentication validation for local storage mode
    // const supabase = await validateAndTrackUsage({
    //   userId,
    //   model,
    //   isAuthenticated,
    // })

    // Skip database operations for local storage mode
    // if (supabase) {
    //   await incrementMessageCount({ supabase, userId })
    // }

    // Skip database logging for local storage mode
    // const userMessage = messages[messages.length - 1]
    // if (supabase && userMessage?.role === "user") {
    //   await logUserMessage({
    //     supabase,
    //     userId,
    //     chatId,
    //     content: userMessage.content,
    //     attachments: userMessage.experimental_attachments as Attachment[],
    //     model,
    //     isAuthenticated,
    //     message_group_id,
    //   })
    // }

    const allModels = await getAllModels()
    const modelConfig = allModels.find((m) => m.id === model)

    if (!modelConfig || !modelConfig.apiSdk) {
      throw new Error(`Model ${model} not found`)
    }

    const effectiveSystemPrompt = systemPrompt || SYSTEM_PROMPT_DEFAULT

    let apiKey: string | undefined
    // For local storage mode, API keys are managed client-side
    // We'll use environment variables or no API key validation for now
    // Client will need to pass API keys via headers or use Ollama models

    const result = streamText({
      model: modelConfig.apiSdk(apiKey, { enableSearch }),
      system: effectiveSystemPrompt,
      messages: messages,
      tools: {} as ToolSet,
      maxSteps: 10,
      onError: (err: unknown) => {
        console.error("Streaming error occurred:", err)
        // Don't set streamError anymore - let the AI SDK handle it through the stream
      },

      onFinish: async () => {
        // Skip database storage for local storage mode
        // Messages will be stored in IndexedDB client-side
        // if (supabase) {
        //   await storeAssistantMessage({
        //     supabase,
        //     chatId,
        //     messages:
        //       response.messages as unknown as import("@/app/types/api.types").Message[],
        //     message_group_id,
        //     model,
        //   })
        // }
      },
    })

    return result.toDataStreamResponse({
      sendReasoning: true,
      sendSources: true,
      getErrorMessage: (error: unknown) => {
        console.error("Error forwarded to client:", error)
        return extractErrorMessage(error)
      },
    })
  } catch (err: unknown) {
    console.error("Error in /api/chat:", err)
    const error = err as {
      code?: string
      message?: string
      statusCode?: number
    }

    return createErrorResponse(error)
  }
}
