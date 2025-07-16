"use client"

import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import { Search, Filter, Plus } from "lucide-react"
import axios from "axios"
import toast from "react-hot-toast"
import QuestionCard from "../components/QuestionCard"
import { useAuth } from "../context/AuthContext"

const Questions = () => {
  const [questions, setQuestions] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [sortBy, setSortBy] = useState("createdAt")
  const [sortOrder, setSortOrder] = useState("desc")
  const [selectedTags, setSelectedTags] = useState([])
  const [pagination, setPagination] = useState({
    current: 1,
    pages: 1,
    total: 0,
  })
  const { isAuthenticated } = useAuth()

  const fetchQuestions = async (page = 1) => {
    try {
      setLoading(true)
      const params = new URLSearchParams({
        page: page.toString(),
        limit: "10",
        sortBy,
        sortOrder,
      })

      if (searchTerm) params.append("search", searchTerm)
      if (selectedTags.length > 0) params.append("tags", selectedTags.join(","))

      const response = await axios.get(`${import.meta.env.VITE_API_URL}/questions?${params}`)
      setQuestions(response.data.questions)
      setPagination(response.data.pagination)
    } catch (error) {
      toast.error("Failed to fetch questions")
      console.error("Error fetching questions:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchQuestions()
  }, [searchTerm, sortBy, sortOrder, selectedTags])

  const handleSearch = (e) => {
    e.preventDefault()
    fetchQuestions(1)
  }

  const handlePageChange = (page) => {
    fetchQuestions(page)
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  const sortOptions = [
    { value: "createdAt", label: "Newest" },
    { value: "voteScore", label: "Most Voted" },
    { value: "views", label: "Most Viewed" },
    { value: "answerCount", label: "Most Answered" },
  ]

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">All Questions</h1>
          <p className="text-gray-600">{pagination.total} questions found</p>
        </div>
        {isAuthenticated && (
          <Link to="/ask" className="btn-primary mt-4 md:mt-0 inline-flex items-center">
            <Plus className="w-4 h-4 mr-2" />
            Ask Question
          </Link>
        )}
      </div>

      {/* Search and Filters */}
      <div className="card p-6 mb-8">
        <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-4 mb-4">
          <div className="flex-1">
           <div className="relative w-full">
  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5 pointer-events-none" />
  <input
    type="text"
    placeholder="Search questions..."
    value={searchTerm}
    onChange={(e) => setSearchTerm(e.target.value)}
    className="w-full pl-12 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
  />
</div>

          </div>
          <button type="submit" className="btn-primary px-6">
            Search
          </button>
        </form>

        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex items-center space-x-2">
            <Filter className="w-4 h-4 text-gray-500" />
            <span className="text-sm font-medium text-gray-700">Sort by:</span>
            <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="form-input py-1 text-sm">
              {sortOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-sm font-medium text-gray-700">Order:</span>
            <select
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value)}
              className="form-input py-1 text-sm"
            >
              <option value="desc">Descending</option>
              <option value="asc">Ascending</option>
            </select>
          </div>
        </div>
      </div>

      {/* Questions List */}
      {loading ? (
        <div className="flex justify-center py-12">
          <div className="spinner"></div>
        </div>
      ) : questions.length === 0 ? (
        <div className="card p-12 text-center">
          <h3 className="text-lg font-medium text-gray-900 mb-2">No questions found</h3>
          <p className="text-gray-600 mb-6">
            {searchTerm ? "Try adjusting your search terms" : "Be the first to ask a question!"}
          </p>
          {isAuthenticated && (
            <Link to="/ask" className="btn-primary">
              Ask the First Question
            </Link>
          )}
        </div>
      ) : (
        <div className="space-y-6">
          {questions.map((question) => (
            <QuestionCard key={question._id} question={question} />
          ))}
        </div>
      )}

      {/* Pagination */}
      {pagination.pages > 1 && (
        <div className="flex justify-center mt-12">
          <nav className="flex items-center space-x-2">
            <button
              onClick={() => handlePageChange(pagination.current - 1)}
              disabled={pagination.current === 1}
              className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>

            {Array.from({ length: pagination.pages }, (_, i) => i + 1).map((page) => (
              <button
                key={page}
                onClick={() => handlePageChange(page)}
                className={`px-3 py-2 text-sm font-medium rounded-md ${
                  page === pagination.current
                    ? "bg-primary-600 text-white"
                    : "text-gray-500 bg-white border border-gray-300 hover:bg-gray-50"
                }`}
              >
                {page}
              </button>
            ))}

            <button
              onClick={() => handlePageChange(pagination.current + 1)}
              disabled={pagination.current === pagination.pages}
              className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </nav>
        </div>
      )}
    </div>
  )
}

export default Questions
