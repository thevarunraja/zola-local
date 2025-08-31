import { toast } from "@/components/ui/toast"
import * as fileType from "file-type"
import { DAILY_FILE_UPLOAD_LIMIT } from "./config"

const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10MB
const UPLOAD_COUNT_KEY = "zola_daily_upload_count"
const UPLOAD_RESET_KEY = "zola_daily_upload_reset"

const ALLOWED_FILE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/gif",
  "application/pdf",
  "text/plain",
  "text/markdown",
  "application/json",
  "text/csv",
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
]

export type Attachment = {
  name: string
  contentType: string
  url: string
}

export async function validateFile(
  file: File
): Promise<{ isValid: boolean; error?: string }> {
  if (file.size > MAX_FILE_SIZE) {
    return {
      isValid: false,
      error: `File size exceeds ${MAX_FILE_SIZE / (1024 * 1024)}MB limit`,
    }
  }

  const buffer = await file.arrayBuffer()
  const type = await fileType.fileTypeFromBuffer(
    Buffer.from(buffer.slice(0, 4100))
  )

  if (!type || !ALLOWED_FILE_TYPES.includes(type.mime)) {
    return {
      isValid: false,
      error: "File type not supported or doesn't match its extension",
    }
  }

  return { isValid: true }
}

export function createAttachment(file: File, url: string): Attachment {
  return {
    name: file.name,
    contentType: file.type,
    url,
  }
}

export async function processFiles(
  files: File[],
  chatId: string,
  userId: string
): Promise<Attachment[]> {
  const attachments: Attachment[] = []

  for (const file of files) {
    const validation = await validateFile(file)
    if (!validation.isValid) {
      console.warn(`File ${file.name} validation failed:`, validation.error)
      toast({
        title: "File validation failed",
        description: validation.error,
        status: "error",
      })
      continue
    }

    try {
      // In local mode, create object URLs for files
      const url = URL.createObjectURL(file)
      attachments.push(createAttachment(file, url))

      // Update local upload count
      const currentCount = await checkFileUploadLimit(userId)
      localStorage.setItem(UPLOAD_COUNT_KEY, (currentCount + 1).toString())
    } catch (error) {
      console.error(`Error processing file ${file.name}:`, error)
    }
  }

  return attachments
}

export class FileUploadLimitError extends Error {
  code: string
  constructor(message: string) {
    super(message)
    this.code = "DAILY_FILE_LIMIT_REACHED"
  }
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export async function checkFileUploadLimit(_userId: string) {
  // Check local storage for daily upload count
  const uploadCountStr = localStorage.getItem(UPLOAD_COUNT_KEY)
  const uploadResetStr = localStorage.getItem(UPLOAD_RESET_KEY)

  let uploadCount = uploadCountStr ? parseInt(uploadCountStr, 10) : 0
  const lastReset = uploadResetStr ? new Date(uploadResetStr) : null

  // Check if we need to reset daily counter
  const now = new Date()
  const isNewDay =
    !lastReset ||
    now.getUTCFullYear() !== lastReset.getUTCFullYear() ||
    now.getUTCMonth() !== lastReset.getUTCMonth() ||
    now.getUTCDate() !== lastReset.getUTCDate()

  if (isNewDay) {
    uploadCount = 0
    localStorage.setItem(UPLOAD_COUNT_KEY, "0")
    localStorage.setItem(UPLOAD_RESET_KEY, now.toISOString())
  }

  if (uploadCount >= DAILY_FILE_UPLOAD_LIMIT) {
    throw new FileUploadLimitError("Daily file upload limit reached.")
  }

  return uploadCount
}
