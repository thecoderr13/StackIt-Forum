"use client"

import { useState, useEffect } from "react"
import { useParams, Link } from "react-router-dom"
import { formatDistanceToNow } from "date-fns"
import { ChevronUp, ChevronDown, Eye, MessageCircle, ArrowLeft } from "lucide-react"
import axios from "axios"
import toast from "react-hot-toast"
import { useAuth } from "../context/AuthContext"
import AnswerCard from "../components/AnswerCard"
import RichTextEditor from "../components/RichTextEditor"

const QuestionDetail = () => {
  const { id } = useParams()
  const [question, setQuestion] = useState(null)
  const [answers, setAnswers] = useState([])
  const [loading, setLoading] = useState(true)
  const [answerContent, setAnswerContent] = useState("")
  const [submitting, setSubmitting] = useState(false)
  const [isVoting, setIsVoting] = useState(false)
  const { user, isAuthenticated } = useAuth()

  const fetchQuestion = async () => {
    try {
      setLoading(true)
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/questions/${id}`)
      setQuestion(response.data)
      setAnswers(response.data.answers || [])
    } catch (error) {
      toast.error("Failed to fetch question")
      console.error("Error fetching question:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchQuestion()
  }, [id])

  const handleVote = async (voteType) => {
    if (!isAuthenticated) {
      toast.error("Please login to vote")
      return
    }

    if (isVoting) return

    try {
      setIsVoting(true)
      const response = await axios.put(`${import.meta.env.VITE_API_URL}/questions/${id}/vote`, {
        voteType,
      })

      setQuestion((prev) => ({
        ...prev,
        voteScore: response.data.voteScore,
      }))
      toast.success("Vote recorded")
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to vote")
    } finally {
      setIsVoting(false)
    }
  }

  const handleSubmitAnswer = async (e) => {
    e.preventDefault()

    if (!isAuthenticated) {
      toast.error("Please login to answer")
      return
    }

    if (!answerContent.trim()) {
      toast.error("Please provide an answer")
      return
    }

    try {
      setSubmitting(true)
      const response = await axios.post(`${import.meta.env.VITE_API_URL}/answers`, {
        content: answerContent,
        questionId: id,
      })

      setAnswers((prev) => [...prev, response.data.answer])
      setAnswerContent("")
      toast.success("Answer submitted successfully")
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to submit answer")
    } finally {
      setSubmitting(false)
    }
  }

  const handleAnswerUpdate = (answerId, updates) => {
    setAnswers((prev) => prev.map((answer) => (answer._id === answerId ? { ...answer, ...updates } : answer)))
  }

  const handleAnswerAccept = (answerId) => {
    setAnswers((prev) =>
      prev.map((answer) => ({
        ...answer,
        isAccepted: answer._id === answerId,
      })),
    )
    setQuestion((prev) => ({
      ...prev,
      acceptedAnswer: answerId,
    }))
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="spinner"></div>
      </div>
    )
  }

  if (!question) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="card p-12 text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Question not found</h2>
          <p className="text-gray-600 mb-6">The question you're looking for doesn't exist.</p>
          <Link to="/questions" className="btn-primary">
            Browse Questions
          </Link>
        </div>
      </div>
    )
  }

  const hasUpvoted = isAuthenticated && question.votes?.upvotes?.includes(user?.id)
  const hasDownvoted = isAuthenticated && question.votes?.downvotes?.includes(user?.id)
  const isAuthor = isAuthenticated && question.author?._id === user?.id

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Back Button */}
      <Link to="/questions" className="inline-flex items-center text-primary-600 hover:text-primary-700 mb-6">
        <ArrowLeft className="w-4 h-4 mr-2" />
        Back to Questions
      </Link>

      {/* Question */}
      <div className="card p-8 mb-8">
        <div className="flex space-x-6">
          {/* Vote Controls */}
          <div className="flex flex-col items-center space-y-2">
            <button
              onClick={() => handleVote("up")}
              disabled={!isAuthenticated || isVoting}
              className={`vote-btn ${hasUpvoted ? "active" : ""} ${!isAuthenticated ? "opacity-50 cursor-not-allowed" : ""}`}
            >
              <ChevronUp className="w-8 h-8" />
            </button>

            <span
              className={`font-bold text-2xl ${question.voteScore > 0 ? "text-green-600" : question.voteScore < 0 ? "text-red-600" : "text-gray-600"}`}
            >
              {question.voteScore}
            </span>

            <button
              onClick={() => handleVote("down")}
              disabled={!isAuthenticated || isVoting}
              className={`vote-btn ${hasDownvoted ? "active" : ""} ${!isAuthenticated ? "opacity-50 cursor-not-allowed" : ""}`}
            >
              <ChevronDown className="w-8 h-8" />
            </button>
          </div>

          {/* Question Content */}
          <div className="flex-1 min-w-0">
            <h1 className="text-3xl font-bold text-gray-900 mb-6">{question.title}</h1>

            <div className="flex items-center space-x-4 text-sm text-gray-500 mb-6">
              <div className="flex items-center space-x-1">
                <Eye className="w-4 h-4" />
                <span>{question.views} views</span>
              </div>
              <div className="flex items-center space-x-1">
                <MessageCircle className="w-4 h-4" />
                <span>{answers.length} answers</span>
              </div>
              <span>Asked {formatDistanceToNow(new Date(question.createdAt), { addSuffix: true })}</span>
            </div>

            <div
              className="prose prose-lg max-w-none mb-6"
              dangerouslySetInnerHTML={{ __html: question.description }}
            />

            {/* Tags */}
            <div className="flex flex-wrap gap-2 mb-6">
              {question.tags.map((tag, index) => (
                <span key={index} className="tag">
                  {tag}
                </span>
              ))}
            </div>

            {/* Author Info */}
            <div className="flex items-center space-x-3 text-sm">
  {question.author?.avatar ? (
    <img
      src={question.author.avatar}
      alt={`${question.author.username}'s avatar`}
      className="w-10 h-10 rounded-full object-cover"
      onError={(e) => {
        e.target.onerror = null
        e.target.style.display = "none"
      }}
    />
  ) : (
    <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
      <span className="text-primary-600 font-medium">
        {question.author?.username?.[0]?.toUpperCase() || "U"}
      </span>
    </div>
  )}
  <div>
    <p className="font-medium text-gray-900">{question.author?.username}</p>
    <p className="text-gray-500">{question.author?.reputation || 0} reputation</p>
  </div>
</div>

          </div>
        </div>
      </div>

      {/* Answers Section */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">
          {answers.length} {answers.length === 1 ? "Answer" : "Answers"}
        </h2>

        {/* Sort accepted answer first */}
        {answers
          .sort((a, b) => {
            if (a.isAccepted && !b.isAccepted) return -1
            if (!a.isAccepted && b.isAccepted) return 1
            return new Date(b.createdAt) - new Date(a.createdAt)
          })
          .map((answer) => (
            <div key={answer._id} className="mb-6">
              <AnswerCard
                answer={answer}
                questionAuthorId={question.author?._id}
                onUpdate={handleAnswerUpdate}
                onAccept={handleAnswerAccept}
              />
            </div>
          ))}
      </div>

      {/* Answer Form */}
      {isAuthenticated ? (
        <div className="card p-6">
          <h3 className="text-xl font-semibold text-gray-900 mb-4">Your Answer</h3>
          <form onSubmit={handleSubmitAnswer}>
            <div className="mb-6">
              <RichTextEditor
                value={answerContent}
                onChange={setAnswerContent}
                placeholder="Write your answer here..."
              />
            </div>
            <button
              type="submit"
              disabled={submitting || !answerContent.trim()}
              className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? "Submitting..." : "Post Your Answer"}
            </button>
          </form>
        </div>
      ) : (
        <div className="card p-6 text-center">
          <h3 className="text-lg font-medium text-gray-900 mb-2">Want to answer this question?</h3>
          <p className="text-gray-600 mb-4">Please login or register to post an answer.</p>
          <div className="flex justify-center space-x-4">
            <Link to="/login" className="btn-primary">
              Login
            </Link>
            <Link to="/register" className="btn-outline">
              Register
            </Link>
          </div>
        </div>
      )}
    </div>
  )
}

export default QuestionDetail
