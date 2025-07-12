"use client"

import { useState } from "react"
import { formatDistanceToNow } from "date-fns"
import { ChevronUp, ChevronDown, Check, Edit, Trash2 } from "lucide-react"
import { useAuth } from "../context/AuthContext"
import axios from "axios"
import toast from "react-hot-toast"

const AnswerCard = ({ answer, questionAuthorId, onUpdate, onAccept }) => {
  const [isVoting, setIsVoting] = useState(false)
  const { user, isAuthenticated } = useAuth()
  const { _id, content, author, voteScore, votes, isAccepted, createdAt } = answer

  const hasUpvoted = isAuthenticated && votes?.upvotes?.includes(user?.id)
  const hasDownvoted = isAuthenticated && votes?.downvotes?.includes(user?.id)
  const isAuthor = isAuthenticated && author?._id === user?.id
  const isQuestionAuthor = isAuthenticated && questionAuthorId === user?.id

  const handleVote = async (voteType) => {
    if (!isAuthenticated) {
      toast.error("Please login to vote")
      return
    }

    if (isVoting) return

    try {
      setIsVoting(true)
      const response = await axios.put(`${import.meta.env.VITE_API_URL}/answers/${_id}/vote`, {
        voteType,
      })

      onUpdate(_id, { voteScore: response.data.voteScore })
      toast.success("Vote recorded")
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to vote")
    } finally {
      setIsVoting(false)
    }
  }

  const handleAccept = async () => {
    if (!isQuestionAuthor) return

    try {
      await axios.put(`${import.meta.env.VITE_API_URL}/answers/${_id}/accept`)
      onAccept(_id)
      toast.success("Answer accepted")
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to accept answer")
    }
  }

  return (
    <div className={`card p-6 ${isAccepted ? "border-green-200 bg-green-50" : ""}`}>
      <div className="flex space-x-4">
        {/* Vote Controls */}
        <div className="flex flex-col items-center space-y-2">
          <button
            onClick={() => handleVote("up")}
            disabled={!isAuthenticated || isVoting}
            className={`vote-btn ${hasUpvoted ? "active" : ""} ${!isAuthenticated ? "opacity-50 cursor-not-allowed" : ""}`}
          >
            <ChevronUp className="w-6 h-6" />
          </button>

          <span
            className={`font-bold text-lg ${voteScore > 0 ? "text-green-600" : voteScore < 0 ? "text-red-600" : "text-gray-600"}`}
          >
            {voteScore}
          </span>

          <button
            onClick={() => handleVote("down")}
            disabled={!isAuthenticated || isVoting}
            className={`vote-btn ${hasDownvoted ? "active" : ""} ${!isAuthenticated ? "opacity-50 cursor-not-allowed" : ""}`}
          >
            <ChevronDown className="w-6 h-6" />
          </button>

          {/* Accept Button */}
          {isQuestionAuthor && !isAccepted && (
            <button
              onClick={handleAccept}
              className="vote-btn text-green-600 hover:bg-green-100"
              title="Accept this answer"
            >
              <Check className="w-6 h-6" />
            </button>
          )}

          {/* Accepted Badge */}
          {isAccepted && (
            <div className="flex items-center justify-center w-8 h-8 bg-green-600 rounded-full">
              <Check className="w-5 h-5 text-white" />
            </div>
          )}
        </div>

        {/* Answer Content */}
        <div className="flex-1 min-w-0">
          {/* Accepted Badge */}
          {isAccepted && (
            <div className="mb-4">
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                <Check className="w-4 h-4 mr-1" />
                Accepted Answer
              </span>
            </div>
          )}

          {/* Content */}
          <div className="prose prose-sm max-w-none mb-6" dangerouslySetInnerHTML={{ __html: content }} />

          {/* Footer */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              {/* Author Info */}
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
                  <span className="text-primary-600 text-xs font-medium">
                    {author?.username?.[0]?.toUpperCase() || "U"}
                  </span>
                </div>
                <div>
                  <p className="font-medium text-gray-900">{author?.username}</p>
                  <p className="text-xs">answered {formatDistanceToNow(new Date(createdAt), { addSuffix: true })}</p>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            {isAuthor && (
              <div className="flex items-center space-x-2">
                <button className="text-gray-500 hover:text-primary-600 p-1">
                  <Edit className="w-4 h-4" />
                </button>
                <button className="text-gray-500 hover:text-red-600 p-1">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default AnswerCard
