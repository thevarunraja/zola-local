import { toast } from "@/components/ui/toast"
import { useModel } from "@/lib/model-store/provider"
import { LocalStorageManager } from "@/lib/storage/local-storage"
import { useUser } from "@/lib/user-store/provider"
import { debounce } from "@/lib/utils"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { useCallback, useRef } from "react"

export function useFavoriteModels() {
  const queryClient = useQueryClient()
  const { favoriteModels: initialFavoriteModels, refreshFavoriteModelsSilent } =
    useModel()
  const { refreshUser } = useUser()

  // Ensure we always have an array
  const safeInitialData = Array.isArray(initialFavoriteModels)
    ? initialFavoriteModels
    : []

  // Query to fetch favorite models from localStorage
  const {
    data: favoriteModels = safeInitialData,
    isLoading,
    error,
  } = useQuery<string[]>({
    queryKey: ["favorite-models"],
    queryFn: async () => {
      // For local storage mode, get from LocalStorageManager
      try {
        const user = LocalStorageManager.getUser()
        return user?.favorite_models || []
      } catch (error) {
        console.error("Failed to get favoriteModels from localStorage:", error)
        return []
      }
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 1,
    initialData: safeInitialData,
  })

  // Mutation to update favorite models in localStorage
  const updateFavoriteModelsMutation = useMutation({
    mutationFn: async (favoriteModels: string[]) => {
      try {
        // Update user data with new favorite models
        const currentUser = LocalStorageManager.getUser()
        if (currentUser) {
          const updatedUser = {
            ...currentUser,
            favorite_models: favoriteModels,
          }
          LocalStorageManager.setUser(updatedUser)
        }
        return { success: true, favorite_models: favoriteModels }
      } catch {
        throw new Error("Failed to save favorite models to local storage")
      }
    },
    onMutate: async (newFavoriteModels) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: ["favorite-models"] })

      // Snapshot the previous value
      const previousFavoriteModels = queryClient.getQueryData<string[]>([
        "favorite-models",
      ])

      // Optimistically update to the new value
      queryClient.setQueryData(["favorite-models"], newFavoriteModels)

      // Return a context object with the snapshotted value
      return { previousFavoriteModels }
    },
    onError: (error, _newFavoriteModels, context) => {
      // If the mutation fails, use the context returned from onMutate to roll back
      if (
        context &&
        "previousFavoriteModels" in context &&
        context.previousFavoriteModels
      ) {
        queryClient.setQueryData(
          ["favorite-models"],
          context.previousFavoriteModels
        )
      }

      console.error("❌ Error saving favorite models:", error)

      toast({
        title: "Failed to save favorite models",
        description: error.message || "Please try again.",
      })

      // Also refresh ModelProvider and UserProvider on error to sync back with server state
      refreshFavoriteModelsSilent()
      refreshUser()
    },
    onSuccess: () => {
      // Invalidate the cache to trigger a refetch
      queryClient.invalidateQueries({ queryKey: ["favorite-models"] })

      // Also refresh the ModelProvider's favorite models (silently)
      refreshFavoriteModelsSilent()

      // Also refresh the UserProvider to update user.favorite_models
      refreshUser()
    },
  })

  // Debounced version of the mutation for reordering
  const debouncedUpdateFavoriteModels = useRef(
    debounce((favoriteModels: string[]) => {
      updateFavoriteModelsMutation.mutate(favoriteModels)
    }, 500)
  ).current

  // Wrapper function that decides whether to debounce or not
  const updateFavoriteModels = useCallback(
    (favoriteModels: string[], shouldDebounce = false) => {
      // Always update the cache immediately for optimistic updates
      queryClient.setQueryData(["favorite-models"], favoriteModels)

      if (shouldDebounce) {
        debouncedUpdateFavoriteModels(favoriteModels)
      } else {
        updateFavoriteModelsMutation.mutate(favoriteModels)
      }
    },
    [updateFavoriteModelsMutation, debouncedUpdateFavoriteModels, queryClient]
  )

  return {
    favoriteModels,
    isLoading,
    error,
    updateFavoriteModels,
    updateFavoriteModelsDebounced: (favoriteModels: string[]) =>
      updateFavoriteModels(favoriteModels, true),
    isUpdating: updateFavoriteModelsMutation.isPending,
    updateError: updateFavoriteModelsMutation.error,
  }
}
