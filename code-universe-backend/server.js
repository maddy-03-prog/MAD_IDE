const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");

const app = express();
app.use(cors());
app.use(bodyParser.json());

app.get("/", (req, res) => {
    res.send({ message: "Backend is running successfully 🚀" });
});

// Example: POST API to receive code from frontend
app.post("/run", (req, res) => {
    const { language, code } = req.body;
    return res.send({
        status: "received",
        language: language,
        code: code
    });
});

const PORT = 5000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
