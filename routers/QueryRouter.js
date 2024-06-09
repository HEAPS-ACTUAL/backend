const express = require("express");
const router = express.Router();
const queryController = require("../controllers/QueryController");

router.post("/query", queryController.handleQuery.bind(queryController));

module.exports = router;
