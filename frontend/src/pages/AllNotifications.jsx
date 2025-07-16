"use client"

import { useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { useNotifications } from "../context/NotificationContext"
import { formatDistanceToNow } from "date-fns"
import { useAuth } from "../context/AuthContext"

const AllNotifications = () => {
  const { notifications, markAsRead, markAllAsRead } = useNotifications()
  const navigate = useNavigate()
  const { user } = useAuth()

  useEffect(() => {
    markAllAsRead()
  }, [])

  const handleNotificationClick = (notification) => {
    if (!notification.isRead) {
      markAsRead(notification._id)
    }

    if (notification.link) {
      navigate(notification.link)
    } else {
      console.warn("Notification has no link.")
    }
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">All Notifications</h1>

      {notifications.length === 0 ? (
        <p className="text-gray-600">You don’t have any notifications yet.</p>
      ) : (
        <ul className="space-y-4">
          {notifications.map((n) => {
            const sender = n.sender
            const senderName = sender?.username ?? "User"
            const senderAvatar = sender?.avatar
            const senderInitial = senderName[0]?.toUpperCase() ?? "U"

            return (
              <li
                key={n._id}
                onClick={() => handleNotificationClick(n)}
                className={`p-4 rounded-lg border shadow-sm transition cursor-pointer hover:bg-gray-50 ${
                  !n.isRead ? "bg-blue-50" : "bg-white"
                }`}
              >
                <div className="flex justify-between items-start gap-3">
                  {/* Avatar */}
                  {senderAvatar ? (
                    <img
                      src={senderAvatar}
                      alt={`${senderName}'s avatar`}
                      className="w-8 h-8 rounded-full object-cover mt-1"
                      onError={(e) => {
                        e.target.onerror = null
                        e.target.style.display = "none"
                      }}
                    />
                  ) : (
                    <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center mt-1">
                      <span className="text-primary-600 text-xs font-medium">
                        {senderInitial}
                      </span>
                    </div>
                  )}

                  {/* Message content */}
                  <div className="flex-1">
                    <p className="text-sm text-gray-800">{n.message}</p>
                    {n.relatedQuestion?.title && (
                      <p className="text-xs text-primary-600 mt-1">
                        Question: {n.relatedQuestion.title}
                      </p>
                    )}
                    <p className="text-xs text-gray-500 mt-1">
                      {formatDistanceToNow(new Date(n.createdAt), {
                        addSuffix: true,
                      })}
                    </p>
                  </div>

                  {/* Unread dot */}
                  {!n.isRead && (
                    <div className="w-2 h-2 bg-primary-600 rounded-full mt-1" />
                  )}
                </div>
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}

export default AllNotifications
