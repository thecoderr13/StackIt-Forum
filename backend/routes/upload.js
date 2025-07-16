const express = require("express")
const multer = require("multer")
const cloudinary = require("../utils/cloudinary.js")
const fs = require("fs")

const router = express.Router()
const upload = multer({ dest: "uploads/" })

router.post("/upload-image", upload.single("image"), async (req, res) => {
  try {
    const result = await cloudinary.uploader.upload(req.file.path, {
      folder: "questions",
    })

    fs.unlinkSync(req.file.path)

    res.status(200).json({
      url: result.secure_url,
      public_id: result.public_id,
    })
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: "Image upload failed" })
  }
})

module.exports = router // ✅ CommonJS export
