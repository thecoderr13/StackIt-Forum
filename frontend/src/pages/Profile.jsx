"use client"
import React from "react"
import { useNavigate } from "react-router-dom"
import { useState, useEffect } from "react"
import { formatDistanceToNow } from "date-fns"
import { User, Edit, Save, X } from "lucide-react"
import { Trash } from "lucide-react"
import axios from "axios"
import toast from "react-hot-toast"
import { useAuth } from "../context/AuthContext"
import PfpUpload from "../components/AvatarUpload";
const Profile = () => {
  const navigate = useNavigate()
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(false)
  const [showModal, setShowModal] = useState(false)
  const [questionToDelete, setQuestionToDelete] = useState(null)
  const [answerToDelete, setAnswerToDelete] = useState(null)

  const [formData, setFormData] = useState({
    username: "",
    bio: "",
  })
  const [saving, setSaving] = useState(false)
  const { user, updateUser } = useAuth()

  const fetchProfile = async () => {
    try {
      setLoading(true)
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/users/profile`)
      setProfile(response.data.user)
      setFormData({
        username: response.data.user.username,
        bio: response.data.user.bio || "",
      })
      

    } catch (error) {
      toast.error("Failed to fetch profile")
      console.error("Error fetching profile:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchProfile()
  }, [])

 const handleSave = async () => {
  try {
    setSaving(true)
    const response = await axios.put(`${import.meta.env.VITE_API_URL}/users/profile`, formData)
    
    toast.success("Profile updated successfully")
    
    await fetchProfile() // 🧠 Fetch full fresh profile with all data
    setEditing(false)
  } catch (error) {
  const message = error.response?.data?.message || "Failed to update profile"
  if (message.toLowerCase().includes("username")) {
    toast.error("That username is already taken.")
  } else {
    toast.error(message)
  }
}
 finally {
    setSaving(false)
  }
}


  const handleCancel = () => {
    setFormData({
      username: profile.username,
      bio: profile.bio || "",
    })
    setEditing(false)
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="spinner"></div>
      </div>
    )
  }
  const handleDeleteClick = (questionId) => {
  setQuestionToDelete(questionId)
  setShowModal(true)
}

const confirmDelete = async () => {
  try {
    await axios.delete(`${import.meta.env.VITE_API_URL}/questions/${questionToDelete}`)
    toast.success("Question deleted")
    setProfile((prev) => ({
      ...prev,
      questionsAsked: prev.questionsAsked.filter((q) => q._id !== questionToDelete),
    }))
  } catch (err) {
    toast.error("Failed to delete question")
  } finally {
    setShowModal(false)
    setQuestionToDelete(null)
  }
}
  const handleAnswerDeleteClick = (answerId) => {
  setAnswerToDelete(answerId)
  setShowModal(true)
}

const confirmAnswerDelete = async () => {
  try {
    await axios.delete(`${import.meta.env.VITE_API_URL}/answers/${answerToDelete}`)
    toast.success("Answer deleted")
    setProfile((prev) => ({
      ...prev,
      answersGiven: prev.answersGiven.filter((a) => a._id !== answerToDelete),
    }))
  } catch (err) {
    toast.error("Failed to delete answer")
  } finally {
    setShowModal(false)
    setAnswerToDelete(null)
  }
}

  return (
    <React.Fragment>
     {showModal && (
  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
    <div className="bg-white p-6 rounded-lg shadow-lg max-w-sm w-full">
      <h2 className="text-lg font-semibold text-gray-800 mb-4">
        Are you sure you want to delete this {questionToDelete ? "question" : "answer"}?
      </h2>
      <p className="text-sm text-gray-600 mb-6">This action cannot be undone.</p>
      <div className="flex justify-end space-x-2">
        <button
          className="px-4 py-2 rounded bg-gray-200 hover:bg-gray-300 text-gray-800"
          onClick={() => {
            setShowModal(false)
            setQuestionToDelete(null)
            setAnswerToDelete(null)
          }}
        >
          Cancel
        </button>
        <button
          className="px-4 py-2 rounded bg-red-600 hover:bg-red-700 text-white"
          onClick={questionToDelete ? confirmDelete : confirmAnswerDelete}
        >
          Delete
        </button>
      </div>
    </div>
  </div>
)}


    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Profile Info */}
        <div className="lg:col-span-1">
          <div className="card p-6">
            <div className="text-center mb-6">
         <div className="flex justify-center mb-6">
  {editing ? (
    <PfpUpload
      currentAvatar={profile?.avatar || "/default-avatar.png"}
      onUploadSuccess={(newAvatar) => {
        setProfile((prev) => ({ ...prev, avatar: newAvatar }))
        updateUser({ avatar: newAvatar })
        toast.success("Profile picture updated")
      }}
      showModalConfirm 
    />
  ) : (
    <img
      src={profile?.avatar || "/default-avatar.png"}
      alt="User Avatar"
      className="w-24 h-24 rounded-full object-cover shadow-md"
    />
  )}
</div>





              {editing ? (
                <div className="space-y-4">
                  <div>
                    <label className="form-label text-left">Username</label>
                    <input
                      type="text"
                      value={formData.username}
                      onChange={(e) => setFormData((prev) => ({ ...prev, username: e.target.value }))}
                      className="form-input"
                    />
                  </div>
                  <div>
                    <label className="form-label text-left">Bio</label>
                    <textarea
                      value={formData.bio}
                      onChange={(e) => setFormData((prev) => ({ ...prev, bio: e.target.value }))}
                      className="form-input"
                      rows={3}
                      placeholder="Tell us about yourself..."
                    />
                  </div>
                  <div className="flex space-x-2">
                    <button
  onClick={handleSave}
  disabled={saving}
  className="btn-primary flex items-center justify-center gap-2 px-4 py-2 rounded-md font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition duration-200"
>
  <Save className="w-4 h-4" />
  {saving ? "Saving..." : "Save"}
</button>

                    <button onClick={handleCancel} className="btn-secondary">
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <h1 className="text-2xl font-bold text-gray-900 mb-2">{profile.username}</h1>
                  <p className="text-gray-600 mb-4">{profile.bio || "No bio provided"}</p>
                  <button onClick={() => setEditing(true)} className="btn-outline inline-flex items-center">
                    <Edit className="w-4 h-4 mr-2" />
                    Edit Profile
                  </button>
                </>
              )}
            </div>

            <div className="border-t pt-6">
              <div className="grid grid-cols-2 gap-4 text-center">
                <div>
                  <div className="text-2xl font-bold text-primary-600">{profile.reputation || 0}</div>
                  <div className="text-sm text-gray-600">Reputation</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-primary-600">{profile.questionsAsked?.length || 0}</div>
                  <div className="text-sm text-gray-600">Questions</div>
                </div>
              </div>
            </div>

            <div className="border-t pt-6 mt-6">
              <p className="text-sm text-gray-600">
  {profile.createdAt
    ? `Member since ${formatDistanceToNow(new Date(profile.createdAt), { addSuffix: true })}`
    : "Member since (unknown)"}
</p>

            </div>
          </div>
        </div>

        {/* Activity */}
        <div className="lg:col-span-2">
          <div className="space-y-6">
            {/* Recent Questions */}
            <div className="card p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Recent Questions ({profile.questionsAsked?.length || 0})
              </h2>

              {profile.questionsAsked?.length > 0 ? (
  <div className="space-y-4">
    {profile.questionsAsked.slice(0, 5).map((question) => (
      <div key={question._id} className="border-b border-gray-200 pb-4 last:border-b-0 flex justify-between items-start">
        <div>
            <h3 className="font-medium text-blue-600 hover:underline mb-1 cursor-pointer" onClick={() => navigate(`/questions/${question._id}`)}>
            {question.title}
          </h3>

          <p className="text-sm text-gray-600">
            {question.createdAt
              ? `Asked ${formatDistanceToNow(new Date(question.createdAt), { addSuffix: true })}`
              : "Asked (date unknown)"}
          </p>
        </div>
        <button
          onClick={() => handleDeleteClick(question._id)}
          className="text-red-500 hover:text-red-700"
          title="Delete Question"
        >
          <Trash className="w-4 h-4" />
        </button>
      </div>
    ))}
  </div>
) : (
  <p className="text-gray-600">No questions asked yet.</p>
)}

            </div>

            {/* Recent Answers */}
            <div className="card p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Recent Answers ({profile.answersGiven?.length || 0})
              </h2>

           {profile.answersGiven?.length > 0 ? (
  <div className="space-y-4">
    {profile.answersGiven.slice(0, 5).map((answer) => (
      <div key={answer._id} className="border-b border-gray-200 pb-4 last:border-b-0 flex justify-between items-start">
        <div>
<div
  className="text-sm text-blue-600 hover:underline cursor-pointer mb-1 line-clamp-2"
  onClick={() => {
    console.log("Clicked answer:", answer)
    if (answer.question && answer.question._id) {
      navigate(`/questions/${answer.question._id}`)
    } else {
      console.warn("Missing question in answer", answer)
    }
  }}
  dangerouslySetInnerHTML={{
    __html: answer.content.substring(0, 150) + "...",
  }}
/>




          <p className="text-sm text-gray-600">
            {answer.createdAt
              ? `Answered ${formatDistanceToNow(new Date(answer.createdAt), { addSuffix: true })}`
              : "Answered (date unknown)"}
          </p>
        </div>
        <button
          onClick={() => handleAnswerDeleteClick(answer._id)}
          className="text-red-500 hover:text-red-700"
          title="Delete Answer"
        >
          <Trash className="w-4 h-4" />
        </button>
      </div>
    ))}
  </div>
) : (
  <p className="text-gray-600">No answers given yet.</p>
)}

            </div>
          </div>
        </div>
      </div>
    </div>
    </React.Fragment>
  )
}

export default Profile
