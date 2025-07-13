import { useEffect, useState } from "react"
import axios from "axios"
import { useAuth } from "../../context/AuthContext"
import { useNavigate } from "react-router-dom"

const AdminUsers = () => {
  const [users, setUsers] = useState([])
  const { token, user } = useAuth()
  const navigate = useNavigate()
const [searchTerm, setSearchTerm] = useState("")

const filteredUsers = users.filter((u) =>
  (u.username?.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
  (u.email?.toLowerCase() || "").includes(searchTerm.toLowerCase())
)


  useEffect(() => {
    if (!user || user.role !== "admin") {
      return navigate("/")
    }

    const fetchUsers = async () => {
      try {
        const res = await axios.get("/api/admin/users", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
        setUsers(res.data)
        //console.log(users)

      } catch (err) {
        console.error("Error fetching users", err)
      }
    }

    fetchUsers()
  }, [token, user, navigate])

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-4">All Users</h1>
    <input
  type="text"
  value={searchTerm}
  onChange={(e) => setSearchTerm(e.target.value)}
  placeholder="Search by username or email"
  className="w-full md:w-1/2 px-4 py-2 mb-6 border rounded-lg shadow-sm focus:ring-2 focus:ring-primary-500"
/>

    <ul className="space-y-4">
  {filteredUsers.map((u) => (
    <li
      key={u._id}
      className="p-4 bg-white rounded-xl shadow-md flex justify-between items-center"
    >
      <div>
        <p className="font-semibold">{u.username}</p>
        <p className="text-sm text-gray-600">{u.email}</p>
      </div>
      <div className="flex items-center space-x-2">
        {u.role !== "admin" && (
          <button
            className="px-3 py-1 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition"
            onClick={() => promoteToAdmin(u._id)}
          >
            Promote
          </button>
        )}
        <button
          className="px-3 py-1 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg transition"
          onClick={() => deleteUser(u._id)}
        >
          Delete
        </button>
      </div>
    </li>
  ))}
</ul>

    </div>
  )
}

export default AdminUsers
