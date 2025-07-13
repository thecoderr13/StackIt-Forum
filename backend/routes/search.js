// routes/search.js (example)
const express = require("express");
const router = express.Router();
const Question = require("../models/Question");

router.get("/search", async (req, res) => {
  const query = req.query.q;
  if (!query) return res.json([]);

  try {
    const regex = new RegExp(query, "i"); // case-insensitive match
    const questions = await Question.find({ title: regex })
      .limit(5)
      .select("title _id");

    res.json(questions);
  } catch (err) {
    console.error("Search error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
