const express = require("express");
const textStore = require("../models/TextStore");
const router = express.Router();

// Route to save text for testing purposes
router.post("/", (req, res) => {
  const { id, text } = req.body;
  if (!id || !text) {
    return res.status(400).json({ message: "Missing id or text." });
  }
  textStore.saveText(id, text);
  res.status(200).json({ message: "Text saved successfully." });
});

module.exports = router;
