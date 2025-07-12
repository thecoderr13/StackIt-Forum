"use client"

import { useState, useEffect } from "react"
import { formatDistanceToNow } from "date-fns"
import { User, Edit, Save, X } from "lucide-react"
import axios from "axios"
import toast from "react-hot-toast"
import { useAuth } from "../context/AuthContext"

const Profile = () => {
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(false)
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

      setProfile(response.data.user)
      updateUser(response.data.user)
      setEditing(false)
      toast.success("Profile updated successfully")
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to update profile")
    } finally {
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

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Profile Info */}
        <div className="lg:col-span-1">
          <div className="card p-6">
            <div className="text-center mb-6">
              <div className="w-24 h-24 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <User className="w-12 h-12 text-primary-600" />
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
                    <button onClick={handleSave} disabled={saving} className="btn-primary flex-1 disabled:opacity-50">
                      <Save className="w-4 h-4 mr-2" />
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
                Member since {formatDistanceToNow(new Date(profile.createdAt), { addSuffix: true })}
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
                    <div key={question._id} className="border-b border-gray-200 pb-4 last:border-b-0">
                      <h3 className="font-medium text-gray-900 mb-1">{question.title}</h3>
                      <p className="text-sm text-gray-600">
                        Asked {formatDistanceToNow(new Date(question.createdAt), { addSuffix: true })}
                      </p>
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
                    <div key={answer._id} className="border-b border-gray-200 pb-4 last:border-b-0">
                      <div
                        className="text-sm text-gray-900 mb-1 line-clamp-2"
                        dangerouslySetInnerHTML={{
                          __html: answer.content.substring(0, 150) + "...",
                        }}
                      />
                      <p className="text-sm text-gray-600">
                        Answered {formatDistanceToNow(new Date(answer.createdAt), { addSuffix: true })}
                      </p>
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
  )
}

export default Profile
