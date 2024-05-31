const express = require('express');
const cors = require('cors');

const app = express(); // CREATING AN INSTANCE OF EXPRESS
app.use(express.json()); // TELLING EXPRESS TO UNDERSTAND JSON
app.use(cors()); // IM NOT VERY SURE WHAT THIS DOES LOL, HAVE TO FIND OUT 😅

const PORT = 8001; // DEFINING OUR PORT AS 8001

// HEALTH CHECK ENDPOINT
app.get('/', (req, res) => {
    return res.status(200).json({message: "Server is up and running!"});
})

app.listen(PORT, () => {
    console.log(`Server is listening on port ${PORT}`);
})