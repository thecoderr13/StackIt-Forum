import { useEffect, useState } from "react"
import axios from "axios"
import { useAuth } from "../../context/AuthContext"
import { useNavigate } from "react-router-dom"

const stripHtml = (html) => {
  const tempDiv = document.createElement("div")
  tempDiv.innerHTML = html
  return tempDiv.textContent || tempDiv.innerText || ""
}

const AdminAnswers = () => {
  const [answers, setAnswers] = useState([])
  const [searchTerm, setSearchTerm] = useState("")
  const { token, user } = useAuth()
  const navigate = useNavigate()

  const filteredAnswers = answers.filter((a) =>
    stripHtml(a.content).toLowerCase().includes(searchTerm.toLowerCase()) ||
    (a.author?.username?.toLowerCase() || "").includes(searchTerm.toLowerCase())
  )

  useEffect(() => {
    if (!user || user.role !== "admin") {
      return navigate("/")
    }

    const fetchAnswers = async () => {
      try {
        const res = await axios.get("/api/admin/answers", {
          headers: { Authorization: `Bearer ${token}` },
        })
        setAnswers(res.data)
      } catch (err) {
        console.error("Error fetching answers", err)
      }
    }

    fetchAnswers()
  }, [token, user, navigate])

  const deleteAnswer = async (id) => {
    try {
      await axios.delete(`/api/admin/answer/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      setAnswers((prev) => prev.filter((a) => a._id !== id))
    } catch (err) {
      console.error("Error deleting answer", err)
    }
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-4">All Answers</h1>

      <input
        type="text"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        placeholder="Search by content or author"
        className="w-full md:w-1/2 px-4 py-2 mb-6 border rounded-lg shadow-sm focus:ring-2 focus:ring-primary-500"
      />

      <ul className="space-y-4">
        {filteredAnswers.map((a) => (
          <li
            key={a._id}
            className="p-4 bg-white rounded-xl shadow-md flex justify-between items-center"
          >
            <div className="flex items-center gap-4">
  {a.author?.avatar ? (
    <img
      src={a.author.avatar}
      alt={`${a.author.username}'s avatar`}
      className="w-10 h-10 rounded-full object-cover"
      onError={(e) => {
        e.target.onerror = null
        e.target.style.display = "none"
      }}
    />
  ) : (
    <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
      <span className="text-primary-600 text-sm font-semibold">
        {a.author?.username?.[0]?.toUpperCase() || "U"}
      </span>
    </div>
  )}
  <div>
   <p className="font-medium whitespace-pre-wrap">{stripHtml(a.content)}</p>

    <p className="text-sm text-gray-600">By: {a.author?.username}</p>
  </div>
</div>

            <button
              onClick={() => deleteAnswer(a._id)}
              className="px-3 py-1 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg transition"
            >
              Delete
            </button>
          </li>
        ))}
      </ul>
    </div>
  )
}

export default AdminAnswers
