import { MessageContent } from "@/components/prompt-kit/message"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { AlertCircle, Loader2, MessageSquare, RefreshCw } from "lucide-react"
import { useCallback, useLayoutEffect, useRef, useState } from "react"

type ChatPreviewPanelProps = {
  chatId: string | null
  onHover?: (isHovering: boolean) => void
  messages?: ChatMessage[]
  isLoading?: boolean
  error?: string | null
  onFetchPreview?: (chatId: string) => Promise<void>
}

type ChatMessage = {
  id: string
  content: string
  role: "user" | "assistant"
  created_at: string
}

type MessageBubbleProps = {
  content: string
  role: "user" | "assistant"
  timestamp: string
}

function MessageBubble({ content, role }: MessageBubbleProps) {
  const isUser = role === "user"

  if (isUser) {
    return (
      <div className="flex justify-end">
        <div className="max-w-[70%]">
          <MessageContent
            className="bg-accent relative rounded-3xl px-5 py-2.5"
            markdown={true}
            components={{
              code: ({ children }) => <>{children}</>,
              pre: ({ children }) => <>{children}</>,
              h1: ({ children }) => <p>{children}</p>,
              h2: ({ children }) => <p>{children}</p>,
              h3: ({ children }) => <p>{children}</p>,
              h4: ({ children }) => <p>{children}</p>,
              h5: ({ children }) => <p>{children}</p>,
              h6: ({ children }) => <p>{children}</p>,
              p: ({ children }) => <p>{children}</p>,
              li: ({ children }) => <p>- {children}</p>,
              ul: ({ children }) => <>{children}</>,
              ol: ({ children }) => <>{children}</>,
            }}
          >
            {content}
          </MessageContent>
        </div>
      </div>
    )
  }

  return (
    <div className="flex justify-start">
      <div className="max-w-[400px]">
        <MessageContent
          className="text-foreground bg-transparent p-0 text-sm"
          markdown={true}
          components={{
            h1: ({ children }) => (
              <div className="mb-2 text-lg font-bold">{children}</div>
            ),
            h2: ({ children }) => (
              <div className="mb-2 text-base font-semibold">{children}</div>
            ),
            h3: ({ children }) => (
              <div className="mb-1 text-sm font-semibold">{children}</div>
            ),
            h4: ({ children }) => (
              <div className="mb-1 text-sm font-medium">{children}</div>
            ),
            h5: ({ children }) => (
              <div className="mb-1 text-xs font-medium">{children}</div>
            ),
            h6: ({ children }) => (
              <div className="mb-1 text-xs font-medium">{children}</div>
            ),
            p: ({ children }) => <p className="mb-2">{children}</p>,
            strong: ({ children }) => (
              <strong className="text-foreground font-semibold">
                {children}
              </strong>
            ),
            em: ({ children }) => (
              <em className="text-foreground italic">{children}</em>
            ),
            li: ({ children }) => (
              <li className="ml-0 list-item">{children}</li>
            ),
            ul: ({ children }) => (
              <ul className="mb-2 list-inside list-disc space-y-1">
                {children}
              </ul>
            ),
            ol: ({ children }) => (
              <ol className="mb-2 list-inside list-decimal space-y-1">
                {children}
              </ol>
            ),
            code: ({ children, className }) => {
              // Check if it's an inline code block
              if (!className?.includes("language-")) {
                return (
                  <code className="bg-muted rounded px-1 py-0.5 font-mono text-xs">
                    {children}
                  </code>
                )
              }
              // For code blocks with language, preserve formatting
              return (
                <code className="bg-muted block overflow-x-auto rounded p-2 font-mono text-xs whitespace-pre">
                  {children}
                </code>
              )
            },
            pre: ({ children }) => (
              <div className="bg-muted mb-2 overflow-x-auto rounded p-2 font-mono text-xs whitespace-pre-wrap">
                {children}
              </div>
            ),
          }}
        >
          {content}
        </MessageContent>
      </div>
    </div>
  )
}

function LoadingState() {
  return (
    <div className="flex h-full items-center justify-center">
      <div className="text-muted-foreground flex items-center gap-2">
        <Loader2 className="h-4 w-4 animate-spin" />
        <span className="text-sm">Loading messages...</span>
      </div>
    </div>
  )
}

function ErrorState({
  error,
  onRetry,
}: {
  error: string
  onRetry?: () => void
}) {
  const isNetworkError =
    error.includes("fetch") ||
    error.includes("network") ||
    error.includes("HTTP") ||
    error.includes("Failed to fetch")

  return (
    <div className="flex h-full items-center justify-center p-4">
      <div className="text-muted-foreground max-w-[300px] space-y-3 text-center">
        <div className="flex justify-center">
          <AlertCircle className="text-muted-foreground/50 h-8 w-8" />
        </div>
        <div className="space-y-1">
          <p className="text-sm font-medium">Failed to load preview</p>
          <p className="text-xs break-words opacity-70">{error}</p>
        </div>
        {isNetworkError && onRetry && (
          <Button
            variant="outline"
            size="sm"
            onClick={onRetry}
            className="h-8 text-xs"
          >
            <RefreshCw className="mr-1 h-3 w-3" />
            Try again
          </Button>
        )}
      </div>
    </div>
  )
}

function EmptyState() {
  return (
    <div className="flex h-32 items-center justify-center p-4">
      <p className="text-muted-foreground text-center text-sm">
        No messages in this conversation yet
      </p>
    </div>
  )
}

function DefaultState() {
  return (
    <div className="flex h-full items-center justify-center p-4">
      <div className="text-muted-foreground space-y-2 text-center">
        <p className="text-sm opacity-60">Select a conversation to preview</p>
      </div>
    </div>
  )
}

export function ChatPreviewPanel({
  chatId,
  onHover,
  messages = [],
  isLoading = false,
  error = null,
  onFetchPreview,
}: ChatPreviewPanelProps) {
  const bottomRef = useRef<HTMLDivElement>(null)
  const scrollAreaRef = useRef<HTMLDivElement>(null)
  const [lastChatId, setLastChatId] = useState<string | null>(null)
  const [retryCount, setRetryCount] = useState(0)
  const maxRetries = 3

  const shouldFetch = chatId && chatId !== lastChatId

  if (shouldFetch && onFetchPreview) {
    console.log("ChatPreviewPanel: Fetching preview for new chatId:", chatId)
    setLastChatId(chatId)
    setRetryCount(0)
    onFetchPreview(chatId)
  }

  const handleRetry = useCallback(() => {
    if (chatId && onFetchPreview && retryCount < maxRetries) {
      console.log(
        "ChatPreviewPanel: Retrying fetch for chatId:",
        chatId,
        "attempt:",
        retryCount + 1
      )
      setRetryCount((prev) => prev + 1)
      onFetchPreview(chatId)
    }
  }, [chatId, onFetchPreview, retryCount, maxRetries])

  // Immediately scroll to bottom when chatId changes or messages load
  useLayoutEffect(() => {
    if (chatId && messages.length > 0 && scrollAreaRef.current) {
      const scrollContainer = scrollAreaRef.current.querySelector(
        "[data-radix-scroll-area-viewport]"
      )
      if (scrollContainer) {
        scrollContainer.scrollTop = scrollContainer.scrollHeight
      }
    }
  }, [chatId, messages.length])

  return (
    <div
      className="border-border bg-background col-span-3 flex h-[480px] flex-col rounded-lg border border-l"
      data-testid="chat-preview-panel"
      onMouseEnter={() => onHover?.(true)}
      onMouseLeave={() => onHover?.(false)}
      key={chatId}
    >
      <div className="border-border flex items-center justify-between border-b px-4 py-3">
        <div className="flex items-center gap-2">
          <MessageSquare className="h-4 w-4" />
          <span className="text-sm font-medium">Conversation Preview</span>
        </div>
      </div>

      <div className="flex-1 overflow-hidden">
        {!chatId && <DefaultState />}
        {chatId && isLoading && <LoadingState />}
        {chatId && error && !isLoading && (
          <ErrorState
            error={error}
            onRetry={retryCount < maxRetries ? handleRetry : undefined}
          />
        )}
        {chatId && !isLoading && !error && messages.length === 0 && (
          <EmptyState />
        )}
        {chatId && !isLoading && !error && messages.length > 0 && (
          <ScrollArea ref={scrollAreaRef} className="h-full">
            <div className="space-y-4 p-6">
              <div className="flex justify-center">
                <div className="text-muted-foreground bg-muted/50 rounded-full px-2 py-1 text-xs">
                  Last {messages.length} messages
                </div>
              </div>
              {messages.map((message) => (
                <div key={message.id} data-testid="preview-message">
                  <MessageBubble
                    content={message.content}
                    role={message.role}
                    timestamp={message.created_at}
                  />
                </div>
              ))}
            </div>
            <div ref={bottomRef} />
          </ScrollArea>
        )}
      </div>
    </div>
  )
}
