import React ,{ useEffect, useState } from "react"
import axios from "axios"
import { useAuth } from "../../context/AuthContext"
import { useNavigate } from "react-router-dom"

const AdminUsers = () => {
  const [users, setUsers] = useState([])
  const { token, user } = useAuth()
  const [showModal, setShowModal] = useState(false)
const [actionUser, setActionUser] = useState(null) // { id, action: 'delete' | 'promote' }

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
        const res = await axios.get(`${import.meta.env.VITE_API_URL}/admin/users`, {
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
  const deleteUser = async (userId) => {
  try {
    await axios.delete(`${import.meta.env.VITE_API_URL}/admin/user/${userId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
    setUsers((prev) => prev.filter((u) => u._id !== userId))
  } catch (err) {
    console.error("Error deleting user", err)
  }
}

const promoteToAdmin = async (userId) => {
  try {
    const res = await axios.put(`${import.meta.env.VITE_API_URL}/admin/user/${userId}/promote`, {}, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })

    setUsers((prev) =>
      prev.map((u) => (u._id === userId ? { ...u, role: "admin" } : u))
    )
  } catch (err) {
    console.error("Error promoting user", err)
  }
}

  return (
    <React.Fragment>
      {showModal && actionUser && (
  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
    <div className="bg-white p-6 rounded-xl shadow-lg w-96 text-center">
      <h2 className="text-xl font-semibold mb-4">Are you sure?</h2>
      <p className="mb-6 text-gray-700">
        This action <span className="font-bold">cannot be undone</span>. Do you want to{" "}
        {actionUser.action === "delete" ? "delete" : "promote"} this user?
      </p>
      <div className="flex justify-center gap-4">
        <button
          onClick={() => {
            setShowModal(false)
            setActionUser(null)
          }}
          className="px-4 py-2 rounded bg-gray-200 hover:bg-gray-300"
        >
          Cancel
        </button>
        <button
          onClick={async () => {
            setShowModal(false)
            if (actionUser.action === "delete") {
              await deleteUser(actionUser.id)
            } else {
              await promoteToAdmin(actionUser.id)
            }
            setActionUser(null)
          }}
          className={`px-4 py-2 rounded text-white ${
            actionUser.action === "delete" ? "bg-red-600 hover:bg-red-700" : "bg-blue-600 hover:bg-blue-700"
          }`}
        >
          {actionUser.action === "delete" ? "Delete" : "Promote"}
        </button>
      </div>
    </div>
  </div>
)}

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
  <div className="flex items-center gap-4">
    {u.avatar ? (
      <img
        src={u.avatar}
        alt={`${u.username}'s avatar`}
        className="w-10 h-10 rounded-full object-cover"
        onError={(e) => {
          e.target.onerror = null
          e.target.style.display = "none"
        }}
      />
    ) : (
      <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
        <span className="text-primary-600 text-sm font-semibold">
          {u.username?.[0]?.toUpperCase() || "U"}
        </span>
      </div>
    )}
    <div>
      <p className="font-semibold">{u.username}</p>
      <p className="text-sm text-gray-600">{u.email}</p>
    </div>
  </div>
  <div className="flex items-center space-x-2">
    {u.role !== "admin" && (
      <button
        className="px-3 py-1 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition"
        onClick={() => {
          setActionUser({ id: u._id, action: "promote" })
          setShowModal(true)
        }}
      >
        Promote
      </button>
    )}
    <button
      className="px-3 py-1 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg transition"
      onClick={() => {
        setActionUser({ id: u._id, action: "delete" })
        setShowModal(true)
      }}
    >
      Delete
    </button>
  </div>
</li>

  ))}
</ul>

    </div>
    </React.Fragment>
  )
}

export default AdminUsers
