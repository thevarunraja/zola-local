"use client"

// Pro model dialog is disabled in local-only mode
type ProModelDialogProps = {
  isOpen: boolean
  setIsOpen: (isOpen: boolean) => void
  currentModel: string
}

export function ProModelDialog({
  isOpen,
  setIsOpen,
  currentModel,
}: ProModelDialogProps) {
  // Suppress unused parameter warnings
  void isOpen
  void setIsOpen
  void currentModel

  return null
}
