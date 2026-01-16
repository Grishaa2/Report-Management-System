"use client"

import { useState, useCallback } from "react"

export const useLoadingOverlay = () => {
  const [isLoading, setIsLoading] = useState(false)

  const showLoading = useCallback(() => {
    setIsLoading(true)
  }, [])

  const hideLoading = useCallback(() => {
    setIsLoading(false)
  }, [])

  return {
    isLoading,
    showLoading,
    hideLoading,
  }
}
