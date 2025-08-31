"use client"

// Feedback form is disabled in local-only mode
type FeedbackFormProps = {
  authUserId?: string
  onClose: () => void
}

export function FeedbackForm({ authUserId, onClose }: FeedbackFormProps) {
  // Suppress unused parameter warnings
  void authUserId
  void onClose

  return null
}
