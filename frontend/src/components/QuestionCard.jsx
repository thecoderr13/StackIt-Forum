import { Link } from "react-router-dom"
import { formatDistanceToNow } from "date-fns"
import { Check } from "lucide-react"

const QuestionCard = ({ question }) => {
  const { _id, title, description, tags, author, voteScore, answerCount, views, acceptedAnswer, createdAt } = question

  // Strip HTML tags from description for preview
  const getTextPreview = (html, maxLength = 150) => {
    const div = document.createElement("div")
    div.innerHTML = html
    const text = div.textContent || div.innerText || ""
    return text.length > maxLength ? text.substring(0, maxLength) + "..." : text
  }

  return (
    <div className="card p-6 hover:shadow-md transition-shadow duration-200">
      <div className="flex space-x-4">
        {/* Vote and Stats */}
        <div className="flex flex-col items-center space-y-2 text-sm text-gray-600 min-w-[60px]">
          <div className="flex flex-col items-center">
            <span className={`font-medium ${voteScore > 0 ? "text-green-600" : voteScore < 0 ? "text-red-600" : ""}`}>
              {voteScore}
            </span>
            <span className="text-xs">votes</span>
          </div>

          <div className="flex flex-col items-center">
            <span
              className={`font-medium ${acceptedAnswer ? "text-green-600" : answerCount > 0 ? "text-blue-600" : ""}`}
            >
              {answerCount}
            </span>
            <span className="text-xs">answers</span>
            {acceptedAnswer && <Check className="w-3 h-3 text-green-600 mt-1" />}
          </div>

          <div className="flex flex-col items-center">
            <span className="font-medium">{views}</span>
            <span className="text-xs">views</span>
          </div>
        </div>

        {/* Question Content */}
        <div className="flex-1 min-w-0">
          <div className="mb-3">
            <Link
              to={`/questions/${_id}`}
              className="text-lg font-semibold text-gray-900 hover:text-primary-600 transition-colors duration-200 line-clamp-2"
            >
              {title}
            </Link>
          </div>

          <div className="mb-4">
            <p className="text-gray-600 text-sm line-clamp-3">{getTextPreview(description)}</p>
          </div>

          {/* Tags */}
          <div className="flex flex-wrap gap-2 mb-4">
            {tags.map((tag, index) => (
              <span key={index} className="tag">
                {tag}
              </span>
            ))}
          </div>

          {/* Author and Date */}
          <div className="flex items-center justify-between text-sm text-gray-500">
            <div className="flex items-center space-x-2">
              {author?.avatar ? (
  <img
    src={author.avatar}
    alt={`${author.username}'s avatar`}
    className="w-8 h-8 rounded-full object-cover"
    onError={(e) => {
      e.target.onerror = null
      e.target.style.display = "none"
    }}
  />
) : (
  <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
    <span className="text-primary-600 text-xs font-medium">
      {author?.username?.[0]?.toUpperCase() || "U"}
    </span>
  </div>
)}

              <span className="font-medium text-gray-700">{author?.username}</span>
              <span>•</span>
              <span>{formatDistanceToNow(new Date(createdAt), { addSuffix: true })}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default QuestionCard
