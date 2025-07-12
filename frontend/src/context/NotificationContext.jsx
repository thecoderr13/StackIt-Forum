"use client"

import { createContext, useContext, useReducer, useEffect } from "react"
import axios from "axios"
import { useAuth } from "./AuthContext"

const NotificationContext = createContext()

const initialState = {
  notifications: [],
  unreadCount: 0,
  isLoading: false,
}

const notificationReducer = (state, action) => {
  switch (action.type) {
    case "SET_LOADING":
      return { ...state, isLoading: action.payload }
    case "SET_NOTIFICATIONS":
      return {
        ...state,
        notifications: action.payload.notifications,
        unreadCount: action.payload.unreadCount,
        isLoading: false,
      }
    case "MARK_AS_READ":
      return {
        ...state,
        notifications: state.notifications.map((notification) =>
          notification._id === action.payload ? { ...notification, isRead: true } : notification,
        ),
        unreadCount: Math.max(0, state.unreadCount - 1),
      }
    case "MARK_ALL_READ":
      return {
        ...state,
        notifications: state.notifications.map((notification) => ({
          ...notification,
          isRead: true,
        })),
        unreadCount: 0,
      }
    case "ADD_NOTIFICATION":
      return {
        ...state,
        notifications: [action.payload, ...state.notifications],
        unreadCount: state.unreadCount + 1,
      }
    default:
      return state
  }
}

export const NotificationProvider = ({ children }) => {
  const [state, dispatch] = useReducer(notificationReducer, initialState)
  const { isAuthenticated, token } = useAuth()

  const fetchNotifications = async () => {
    if (!isAuthenticated || !token) return

    try {
      dispatch({ type: "SET_LOADING", payload: true })
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/notifications`)
      dispatch({
        type: "SET_NOTIFICATIONS",
        payload: response.data,
      })
    } catch (error) {
      console.error("Error fetching notifications:", error)
      dispatch({ type: "SET_LOADING", payload: false })
    }
  }

  const markAsRead = async (notificationId) => {
    try {
      await axios.put(`${import.meta.env.VITE_API_URL}/notifications/${notificationId}/read`)
      dispatch({ type: "MARK_AS_READ", payload: notificationId })
    } catch (error) {
      console.error("Error marking notification as read:", error)
    }
  }

  const markAllAsRead = async () => {
    try {
      await axios.put(`${import.meta.env.VITE_API_URL}/notifications/read-all`)
      dispatch({ type: "MARK_ALL_READ" })
    } catch (error) {
      console.error("Error marking all notifications as read:", error)
    }
  }

  useEffect(() => {
    if (isAuthenticated) {
      fetchNotifications()
    }
  }, [isAuthenticated])

  const value = {
    ...state,
    fetchNotifications,
    markAsRead,
    markAllAsRead,
  }

  return <NotificationContext.Provider value={value}>{children}</NotificationContext.Provider>
}

export const useNotifications = () => {
  const context = useContext(NotificationContext)
  if (!context) {
    throw new Error("useNotifications must be used within a NotificationProvider")
  }
  return context
}
