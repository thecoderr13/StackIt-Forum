"use client"

import { useMemo } from "react"
import ReactQuill from "react-quill"
import "react-quill/dist/quill.snow.css"
import Quill from "quill"
import ImageUploader from "quill-image-uploader"

// Register image uploader
Quill.register("modules/imageUploader", ImageUploader)

const RichTextEditor = ({ value, onChange, placeholder = "Write your content here..." }) => {
  const modules = useMemo(() => ({
    toolbar: [
      [{ header: [1, 2, 3, false] }],
      ["bold", "italic", "underline", "strike"],
      [{ list: "ordered" }, { list: "bullet" }],
      ["blockquote", "code-block"],
      ["link", "image"],
      [{ align: [] }],
      ["clean"],
    ],
    imageUploader: {
      upload: async (file) => {
        const formData = new FormData()
        formData.append("image", file)

        const res = await fetch("/api/upload-image", {
          method: "POST",
          body: formData,
        })

        const data = await res.json()
        return data.url // this gets inserted into the editor
      },
    },
  }), [])

  const formats = [
    "header",
    "bold",
    "italic",
    "underline",
    "strike",
    "list",
    "bullet",
    "blockquote",
    "code-block",
    "link",
    "image",
    "align",
  ]

  return (
    <div className="bg-white rounded-lg border border-gray-300 overflow-hidden">
      <ReactQuill
        theme="snow"
        value={value}
        onChange={onChange}
        modules={modules}
        formats={formats}
        placeholder={placeholder}
        style={{ height: "200px" }}
      />
    </div>
  )
}

export default RichTextEditor
