"use client"

import { useState, useCallback } from "react"

export const useNotification = () => {
  const [notification, setNotification] = useState(null)

  const showNotification = useCallback((message, type) => {
    setNotification({ message, type, isVisible: true })
  }, [])

  const hideNotification = useCallback(() => {
    setNotification((prev) => {
      if (!prev) return null
      if (prev.isVisible) {
        return { ...prev, isVisible: false }
      } else {
        return null
      }
    })
  }, [])

  const getNotificationIcon = (type) => {
    switch (type) {
      case "success":
        return "fa-check-circle"
      case "error":
        return "fa-exclamation-circle"
      case "warning":
        return "fa-exclamation-triangle"
      case "info":
        return "fa-info-circle"
      default:
        return "fa-info-circle"
    }
  }

  const getNotificationColor = (type) => {
    switch (type) {
      case "success":
        return "var(--success-color)"
      case "error":
        return "var(--error-color)"
      case "warning":
        return "var(--warning-color)"
      case "info":
        return "var(--info-color)"
      default:
        return "var(--primary-color)"
    }
  }

  return {
    notification,
    showNotification,
    hideNotification,
    getNotificationIcon,
    getNotificationColor,
  }
}
