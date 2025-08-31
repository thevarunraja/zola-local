"use client"

// Feedback widget is disabled in local-only mode
type FeedbackWidgetProps = {
  authUserId?: string
}

export function FeedbackWidget({ authUserId }: FeedbackWidgetProps) {
  // Suppress unused parameter warning
  void authUserId

  return null
}
