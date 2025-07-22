import { useEffect, useState } from "react"
import axios from "axios"
import { useAuth } from "../../context/AuthContext"
import { useNavigate } from "react-router-dom"

const AdminQuestions = () => {
  const [questions, setQuestions] = useState([])
  const [searchTerm, setSearchTerm] = useState("")
  const { token, user } = useAuth()
  const navigate = useNavigate()

  const filteredQuestions = questions.filter((q) =>
    (q.title?.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
    (q.author?.username?.toLowerCase() || "").includes(searchTerm.toLowerCase())
  )

  useEffect(() => {
    if (!user || user.role !== "admin") {
      return navigate("/")
    }

    const fetchQuestions = async () => {
      try {
        const res = await axios.get(`${import.meta.env.VITE_API_URL}/admin/questions`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        setQuestions(res.data)
      } catch (err) {
        console.error("Error fetching questions", err)
      }
    }

    fetchQuestions()
  }, [token, user, navigate])

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-4">All Questions</h1>

      <input
        type="text"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        placeholder="Search by title or author"
        className="w-full md:w-1/2 px-4 py-2 mb-6 border rounded-lg shadow-sm focus:ring-2 focus:ring-primary-500"
      />

      <ul className="space-y-4">
        {filteredQuestions.map((q) => (
          <li key={q._id} className="p-4 bg-white rounded-xl shadow-md flex justify-between items-center">
          <div className="flex items-center gap-4">
  {q.author?.avatar ? (
    <img
      src={q.author.avatar}
      alt={`${q.author.username}'s avatar`}
      className="w-10 h-10 rounded-full object-cover"
      onError={(e) => {
        e.target.onerror = null
        e.target.style.display = "none"
      }}
    />
  ) : (
    <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
      <span className="text-primary-600 text-sm font-semibold">
        {q.author?.username?.[0]?.toUpperCase() || "U"}
      </span>
    </div>
  )}
  <div>
    <p className="font-semibold whitespace-pre-wrap break-words">{q.title}</p>

    <p className="text-sm text-gray-600">By: {q.author?.username}</p>
  </div>
</div>

            <button
              className="px-3 py-1 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg transition"
              onClick={() => deleteQuestion(q._id)}
            >
              Delete
            </button>
          </li>
        ))}
      </ul>
    </div>
  )
}

export default AdminQuestions
