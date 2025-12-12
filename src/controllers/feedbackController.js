const { saveFeedback } = require("../models/feedbackModel");

async function addFeedback(req, res) {
  try {
    const userId = req.user.id;
    const { category, message } = req.body;
	
	if (!category) {
      return res.status(400).json({ category: "Category required" });
    }

    if (!message) {
      return res.status(400).json({ message: "Message required" });
    }

    await saveFeedback(userId, category, message);
    res.status(201).json({ message: "✅ Feedback received. Thank you!" });
  } catch (err) {
    console.error("Feedback error:", err);
    res.status(500).json({ message: "Internal server error" });
  }
}

module.exports = { addFeedback };