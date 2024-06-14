const express = require("express");
const router = express.Router();
const { getLastTwoQuestions } = require("../controllers/QuestionController");

// Route to get the last two questions for a specific quiz
router.get("/last-two-questions/:email/:quizID", async (req, res) => {
  const { email, quizID } = req.params;
  try {
    const questions = await getLastTwoQuestions(email, quizID);
    res.status(200).json(questions);
  }
  catch (error) {
    console.error(`Error fetching the last two questions: ${error.message}`);
    res
      .status(500)
      .json({
        message: "Failed to fetch last two questions",
        error: error.message,
      });
  }
});

module.exports = router;
