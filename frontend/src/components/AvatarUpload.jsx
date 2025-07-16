import { useRef, useState } from "react"
import toast from "react-hot-toast"
import axios from "axios"

const AvatarUpload = ({ currentAvatar, onUploadSuccess }) => {
  const [showModal, setShowModal] = useState(false)
  const [selectedFile, setSelectedFile] = useState(null)
  const [uploading, setUploading] = useState(false)
  const fileInputRef = useRef(null)

  const handleUpload = async () => {
    if (!selectedFile) {
      toast.error("No file selected")
      return
    }

    try {
      setUploading(true)
      const formData = new FormData()
      formData.append("avatar", selectedFile)

      const res = await axios.post(`${import.meta.env.VITE_API_URL}/users/avatar`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      })

      toast.success("Avatar uploaded successfully")
      onUploadSuccess(res.data.avatar)
      setShowModal(false)
      setSelectedFile(null)
    } catch (err) {
      console.error("Upload failed:", err.response?.data || err.message)
      toast.error(err.response?.data?.message || "Upload failed")
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="flex flex-col items-center justify-center">
      {/* Avatar Preview */}
      <img
        src={currentAvatar}
        alt="Profile"
        className="w-24 h-24 rounded-full object-cover border-2 border-primary-500 mb-2"
      />

      {/* Edit Trigger */}
      <button
        className="text-sm text-blue-600 underline hover:text-blue-800"
        onClick={() => setShowModal(true)}
      >
        Change Profile Picture
      </button>

      {showModal && (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm transition-opacity duration-300">
    <div className="bg-white p-6 rounded-2xl shadow-2xl w-full max-w-sm transform transition-all duration-300 space-y-4">
      <h2 className="text-xl font-semibold text-gray-800">Upload New Avatar</h2>

      <label className="block">
        <span className="block text-sm font-medium text-gray-700 mb-1">Choose an image</span>
        <input
          type="file"
          accept="image/*"
          onChange={(e) => setSelectedFile(e.target.files[0])}
          ref={fileInputRef}
          className="block w-full text-sm text-gray-900 border border-gray-300 rounded-lg cursor-pointer bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition duration-200"
        />
      </label>

      <div className="flex justify-end gap-3 pt-2">
        <button
          onClick={() => {
            setShowModal(false)
            setSelectedFile(null)
          }}
          className="px-4 py-2 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 transition-colors"
        >
          Cancel
        </button>

        <button
          onClick={handleUpload}
          className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-medium transition-colors disabled:opacity-60"
          disabled={uploading}
        >
          {uploading ? "Uploading..." : "Upload"}
        </button>
      </div>
    </div>
  </div>
)}

    </div>
  )
}

export default AvatarUpload
