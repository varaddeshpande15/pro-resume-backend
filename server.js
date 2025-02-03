const express = require("express");
const cors = require("cors");
const latex = require("node-latex");
const { PassThrough } = require("stream");

const app = express();
app.use(express.json());
app.use(cors()); // Allow frontend access

app.post("/compile-latex", async (req, res) => {
    const { latexCode } = req.body;
    if (!latexCode) {
        return res.status(400).json({ error: "LaTeX code is required" });
    }

    try {
        const input = new PassThrough();
        input.end(latexCode);
        const pdfStream = latex(input);
        
        const chunks = [];
        pdfStream.on("data", (chunk) => chunks.push(chunk));
        pdfStream.on("end", () => {
            const pdfBuffer = Buffer.concat(chunks);
            res.setHeader("Content-Type", "application/pdf");
            res.send(pdfBuffer);
        });
        pdfStream.on("error", (err) => {
            console.error("LaTeX error:", err);
            res.status(500).json({ error: "Failed to compile LaTeX" });
        });
    } catch (error) {
        console.error("Server error:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => console.log(`Backend running on port ${PORT}`));
