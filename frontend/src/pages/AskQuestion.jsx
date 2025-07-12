"use client"

import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { X } from "lucide-react"
import axios from "axios"
import toast from "react-hot-toast"
import RichTextEditor from "../components/RichTextEditor"

const AskQuestion = () => {
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [tags, setTags] = useState([])
  const [tagInput, setTagInput] = useState("")
  const [submitting, setSubmitting] = useState(false)
  const navigate = useNavigate()

  const handleAddTag = (e) => {
    e.preventDefault()
    const tag = tagInput.trim().toLowerCase()

    if (tag && !tags.includes(tag) && tags.length < 5) {
      setTags([...tags, tag])
      setTagInput("")
    }
  }

  const handleRemoveTag = (tagToRemove) => {
    setTags(tags.filter((tag) => tag !== tagToRemove))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!title.trim()) {
      toast.error("Please provide a title")
      return
    }

    if (!description.trim()) {
      toast.error("Please provide a description")
      return
    }

    if (tags.length === 0) {
      toast.error("Please add at least one tag")
      return
    }

    try {
      setSubmitting(true)
      const response = await axios.post(`${import.meta.env.VITE_API_URL}/questions`, {
        title,
        description,
        tags,
      })

      toast.success("Question posted successfully!")
      navigate(`/questions/${response.data.question._id}`)
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to post question")
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Ask a Question</h1>
        <p className="text-gray-600">Get help from the community by asking a clear, detailed question.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Title */}
        <div className="card p-6">
          <label className="form-label">Title *</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Be specific and imagine you're asking a question to another person"
            className="form-input"
            maxLength={200}
          />
          <p className="text-sm text-gray-500 mt-1">{title.length}/200 characters</p>
        </div>

        {/* Description */}
        <div className="card p-6">
          <label className="form-label">Description *</label>
          <p className="text-sm text-gray-600 mb-4">
            Include all the information someone would need to answer your question
          </p>
          <RichTextEditor
            value={description}
            onChange={setDescription}
            placeholder="Provide details about your question. Include what you've tried and what you're expecting to happen..."
          />
        </div>

        {/* Tags */}
        <div className="card p-6">
          <label className="form-label">Tags *</label>
          <p className="text-sm text-gray-600 mb-4">Add up to 5 tags to describe what your question is about</p>

          <div className="flex flex-wrap gap-2 mb-4">
            {tags.map((tag, index) => (
              <span
                key={index}
                className="inline-flex items-center bg-primary-100 text-primary-800 text-sm font-medium px-3 py-1 rounded-full"
              >
                {tag}
                <button
                  type="button"
                  onClick={() => handleRemoveTag(tag)}
                  className="ml-2 text-primary-600 hover:text-primary-800"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}
          </div>

          <div className="flex gap-2">
            <input
              type="text"
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && handleAddTag(e)}
              placeholder="Add a tag (e.g., javascript, react, nodejs)"
              className="form-input flex-1"
              disabled={tags.length >= 5}
            />
            <button
              type="button"
              onClick={handleAddTag}
              disabled={!tagInput.trim() || tags.length >= 5}
              className="btn-outline disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Add Tag
            </button>
          </div>

          <p className="text-sm text-gray-500 mt-2">{tags.length}/5 tags added</p>
        </div>

        {/* Submit Button */}
        <div className="flex justify-end space-x-4">
          <button type="button" onClick={() => navigate("/questions")} className="btn-secondary">
            Cancel
          </button>
          <button
            type="submit"
            disabled={submitting || !title.trim() || !description.trim() || tags.length === 0}
            className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {submitting ? "Posting..." : "Post Question"}
          </button>
        </div>
      </form>
    </div>
  )
}

export default AskQuestion
