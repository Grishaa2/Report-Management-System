"use client"

// Notification.jsx
import { useEffect, useRef } from "react"
import { useNotification } from "@/hooks/use-notification"
import { toast } from "react-hot-toast"

export const Notification = ({ message, type, isVisible, onClose, autoDismiss = true, dismissDuration = 4000 }) => {
  const { getNotificationIcon, getNotificationColor } = useNotification()
  const notificationRef = useRef(null)
  const timerRef = useRef(null)

  // Auto-dismiss timer
  useEffect(() => {
    if (isVisible && autoDismiss) {
      // Clear any existing timer
      if (timerRef.current) {
        clearTimeout(timerRef.current)
      }
      
      // Set new timer to auto-dismiss
      timerRef.current = setTimeout(() => {
        onClose()
      }, dismissDuration)
    }

    // Cleanup timer on unmount or when visibility changes
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current)
      }
    }
  }, [isVisible, autoDismiss, dismissDuration, onClose])

  useEffect(() => {
    if (notificationRef.current) {
      if (isVisible) {
        notificationRef.current.style.animation = "slideInRight 0.3s ease-out"
      } else {
        notificationRef.current.style.animation = "slideOutRight 0.3s ease-in"
      }
    }
  }, [isVisible])

  
  return (
    <div
      ref={notificationRef}
      className={`notification notification-${type}`}
      style={{
        position: "fixed",
        top: "100px",
        right: "20px",
        background: getNotificationColor(type),
        color: "white",
        padding: "var(--spacing-md)",
        borderRadius: "var(--radius-lg)",
        boxShadow: "var(--shadow-lg)",
        zIndex: "10000",
        display: "flex",
        alignItems: "center",
        gap: "var(--spacing-sm)",
        minWidth: "300px",
      }}
      onAnimationEnd={(e) => {
        if (!isVisible && e.animationName === "slideOutRight") {
          onClose()
        }
      }}
    >
      <div className="notification-content">
        <i className={`fas ${getNotificationIcon(type)}`}></i>
        <span>{message}</span>
      </div>
      <button className="notification-close" onClick={() => onClose()}>
        <i className="fas fa-times"></i>
      </button>
    </div>
  )
}
// In your parent component where CsvVisualizer is used:
export const CsvVisualizerWrapper = ({ data, headers }) => {
  const showNotification = (message, type) => {
    toast[type](message);
  };

  return (
    <CsvVisualizer 
      data={data} 
      headers={headers} 
      showNotification={showNotification}
    />
  );
}