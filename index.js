const express = require('express');

const app = express();
const PORT = 8001;

// HEALTH CHECK ENDPOINT
app.get('/', (req, res) => {
    return res.status(200).json({message: "Server is up and running!"});
})

app.listen(PORT, () => {
    console.log(`Server is listening on port ${PORT}`);
})