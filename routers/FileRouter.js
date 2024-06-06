const express = require("express");
const router = express.Router();
const multer = require("multer");
const fileController = require("../controllers/FileController");

// Set up multer for in-memory file uploads
const storage = multer.memoryStorage();
const upload = multer({ storage });

// Route to handle file upload
router.post("/upload", upload.single("file"), fileController.uploadFile);

module.exports = router;
