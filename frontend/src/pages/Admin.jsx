import { useAuth } from "../context/AuthContext"
import { useEffect } from "react"
import { useNavigate } from "react-router-dom"

const Admin = () => {
  const { user, isAuthenticated } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    if (!isAuthenticated || user?.role !== "admin") {
      navigate("/") // kick out non-admins
    }
  }, [isAuthenticated, user, navigate])

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Admin Dashboard</h1>

      <div className="grid gap-6 md:grid-cols-3">
        {/* Users Section */}
        <div className="p-6 rounded-xl shadow-md bg-white hover:shadow-lg transition">
          <h2 className="text-xl font-semibold mb-2">Users</h2>
          <p className="text-sm text-gray-600 mb-4">
            Manage all registered users, promote to admin or delete accounts.
          </p>
          <button
            onClick={() => navigate("/admin/users")}
            className="btn-primary text-sm"
          >
            Manage Users
          </button>
        </div>

        {/* Questions Section */}
        <div className="p-6 rounded-xl shadow-md bg-white hover:shadow-lg transition">
          <h2 className="text-xl font-semibold mb-2">Questions</h2>
          <p className="text-sm text-gray-600 mb-4">
            View or remove any question from the platform.
          </p>
          <button
            onClick={() => navigate("/admin/questions")}
            className="btn-primary text-sm"
          >
            Manage Questions
          </button>
        </div>

        {/* Answers Section */}
        <div className="p-6 rounded-xl shadow-md bg-white hover:shadow-lg transition">
          <h2 className="text-xl font-semibold mb-2">Answers</h2>
          <p className="text-sm text-gray-600 mb-4">
            View or delete answers submitted by users.
          </p>
          <button
            onClick={() => navigate("/admin/answers")}
            className="btn-primary text-sm"
          >
            Manage Answers
          </button>
        </div>
      </div>
    </div>
  )
}

export default Admin
