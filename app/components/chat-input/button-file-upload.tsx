// File upload is disabled in local-only mode
type ButtonFileUploadProps = {
  onFileUpload: (files: File[]) => void
  isUserAuthenticated: boolean
  model: string
}

export function ButtonFileUpload({
  onFileUpload,
  isUserAuthenticated,
  model,
}: ButtonFileUploadProps) {
  // File upload is disabled in local-only mode
  void onFileUpload
  void isUserAuthenticated
  void model

  return null
}
