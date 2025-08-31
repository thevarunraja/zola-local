import { expect, test } from "@playwright/test"

test.describe("Chat History and Messages", () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the app
    await page.goto("/")

    // Wait for the app to load
    await page.waitForLoadState("networkidle")
  })

  test("should display chat contents in history preview", async ({ page }) => {
    // Start a new conversation by typing a message
    const chatInput = page
      .locator(
        'textarea[placeholder*="message"], input[placeholder*="message"], [data-testid="chat-input"]'
      )
      .first()
    await chatInput.fill("Hello, this is a test message for chat history")

    // Send the message
    const sendButton = page
      .locator('button[type="submit"], [data-testid="send-button"]')
      .first()
    await sendButton.click()

    // Wait for the message to appear
    await page.waitForSelector(
      'text="Hello, this is a test message for chat history"',
      { timeout: 10000 }
    )

    // Wait a bit for any response
    await page.waitForTimeout(2000)

    // Open chat history - look for various possible triggers
    const historyTriggers = [
      '[data-testid="chat-history-trigger"]',
      'button:has-text("History")',
      '[aria-label*="history" i]',
      '[title*="history" i]',
      'button[aria-label*="History"]',
      'button:has([data-testid="history-icon"])',
    ]

    let historyOpened = false
    for (const selector of historyTriggers) {
      try {
        const trigger = page.locator(selector).first()
        if (await trigger.isVisible({ timeout: 1000 })) {
          await trigger.click()
          historyOpened = true
          break
        }
      } catch (e) {
        // Continue to next selector
      }
    }

    // If no dedicated history button, try keyboard shortcut
    if (!historyOpened) {
      await page.keyboard.press("Meta+k") // or Ctrl+k on Windows/Linux
      await page.waitForTimeout(500)
    }

    // Check if history panel is visible
    const historyPanel = page.locator('[data-testid="chat-history-panel"]')
    await expect(historyPanel).toBeVisible({ timeout: 5000 })

    // Check if chat appears in history
    const chatItems = page.locator('[data-testid="chat-item"]')
    await expect(chatItems.first()).toBeVisible({ timeout: 5000 })

    // Hover over chat item to trigger preview
    await chatItems.first().hover()

    // Check if preview panel shows up
    const previewPanel = page.locator('[data-testid="chat-preview-panel"]')
    await expect(previewPanel).toBeVisible({ timeout: 5000 })

    // Check if messages are displayed in preview
    const previewMessages = previewPanel.locator(
      '[data-testid="preview-message"]'
    )
    await expect(previewMessages.first()).toBeVisible({ timeout: 5000 })

    // Verify message content appears in preview
    await expect(previewPanel).toContainText(
      "Hello, this is a test message for chat history"
    )
  })

  test("should load messages from IndexedDB", async ({ page }) => {
    // Add console logging to monitor IndexedDB operations
    page.on("console", (msg) => {
      if (
        msg.text().includes("getCachedMessages") ||
        msg.text().includes("useChatPreview") ||
        msg.text().includes("ChatPreviewPanel") ||
        msg.text().includes("CommandHistory")
      ) {
        console.log(`Browser log: ${msg.text()}`)
      }
    })

    // Create test data in IndexedDB
    await page.evaluate(async () => {
      // Helper function to open IndexedDB
      const openDB = () => {
        return new Promise<IDBDatabase>((resolve, reject) => {
          const request = indexedDB.open("chat-storage", 1)
          request.onerror = () => reject(request.error)
          request.onsuccess = () => resolve(request.result)
          request.onupgradeneeded = (event) => {
            const db = (event.target as IDBOpenDBRequest).result
            if (!db.objectStoreNames.contains("messages")) {
              db.createObjectStore("messages", { keyPath: "id" })
            }
            if (!db.objectStoreNames.contains("chats")) {
              db.createObjectStore("chats", { keyPath: "id" })
            }
          }
        })
      }

      // Helper function to write to IndexedDB
      const writeToIndexedDB = async (storeName: string, data: any) => {
        const db = await openDB()
        const transaction = db.transaction([storeName], "readwrite")
        const store = transaction.objectStore(storeName)

        return new Promise<void>((resolve, reject) => {
          const request = store.put(data)
          request.onerror = () => reject(request.error)
          request.onsuccess = () => resolve()
        })
      }

      const testChatId = "test-chat-" + Date.now()
      const testMessages = [
        {
          id: "msg-1",
          role: "user",
          content: "Test user message from IndexedDB",
          createdAt: new Date().toISOString(),
        },
        {
          id: "msg-2",
          role: "assistant",
          content: "Test assistant response from IndexedDB",
          createdAt: new Date().toISOString(),
        },
      ]

      // Save messages to IndexedDB
      await writeToIndexedDB("messages", {
        id: testChatId,
        messages: testMessages,
      })

      // Save chat metadata to IndexedDB
      await writeToIndexedDB("chats", {
        id: testChatId,
        title: "Test Chat from IndexedDB",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        user_id: "test-user",
        model: "gpt-3.5-turbo",
        public: false,
        pinned: false,
        pinned_at: null,
        project_id: null,
      })

      // Store the chat ID for later use
      window.testChatId = testChatId
    })

    // Refresh to load from IndexedDB
    await page.reload()
    await page.waitForLoadState("networkidle")

    // Open history
    await page.keyboard.press("Meta+k")
    await page.waitForTimeout(1000)

    // Look for the test chat
    const chatItem = page
      .locator('[data-testid="chat-item"]')
      .filter({ hasText: "Test Chat from IndexedDB" })
    await expect(chatItem).toBeVisible({ timeout: 10000 })

    // Hover to trigger preview
    await chatItem.hover()

    // Check if preview loads the messages from IndexedDB
    const previewPanel = page.locator('[data-testid="chat-preview-panel"]')
    await expect(previewPanel).toBeVisible({ timeout: 5000 })

    // Verify IndexedDB messages appear in preview
    await expect(previewPanel).toContainText("Test user message from IndexedDB")
    await expect(previewPanel).toContainText(
      "Test assistant response from IndexedDB"
    )
  })

  test("should handle empty chat history gracefully", async ({ page }) => {
    // Clear any existing data
    await page.evaluate(() => {
      return new Promise<void>((resolve) => {
        const deleteReq = indexedDB.deleteDatabase("chat-storage")
        deleteReq.onsuccess = () => resolve()
        deleteReq.onerror = () => resolve() // Resolve even on error
      })
    })

    await page.reload()
    await page.waitForLoadState("networkidle")

    // Open history
    await page.keyboard.press("Meta+k")

    // Should show empty state
    const historyPanel = page.locator('[data-testid="chat-history-panel"]')
    await expect(historyPanel).toBeVisible()
    await expect(historyPanel).toContainText("No chat history found")
  })

  test("should show preview panel when preference is enabled", async ({
    page,
  }) => {
    // Mock user preferences to enable conversation previews
    await page.addInitScript(() => {
      localStorage.setItem(
        "user-preferences",
        JSON.stringify({
          showConversationPreviews: true,
        })
      )
    })

    await page.reload()

    // Create a test message
    const chatInput = page.locator("textarea, input").first()
    await chatInput.fill("Test message for preview")
    await page.keyboard.press("Enter")

    await page.waitForTimeout(2000)

    // Open history
    await page.keyboard.press("Meta+k")

    // Verify preview panel layout is visible (should be 2-column layout)
    const historyPanel = page.locator('[data-testid="chat-history-panel"]')
    await expect(historyPanel).toBeVisible()

    const previewPanel = page.locator('[data-testid="chat-preview-panel"]')

    // Hover over a chat item
    const chatItem = page.locator('[data-testid="chat-item"]').first()
    if (await chatItem.isVisible()) {
      await chatItem.hover()
      await expect(previewPanel).toBeVisible()
    }
  })
})
