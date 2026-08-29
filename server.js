import express from "express";
import path from "path";
import axios from "axios";
import { fileURLToPath } from "url";

const app = express();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const distPath = path.join(__dirname, "dist");

app.use(express.json());

// health check
app.get("/health", (req, res) => {
  res.json({ ok: true, service: "bazi-ai-app" });
});

// Gemini API
app.post("/api/gemini", async (req, res) => {
  try {
    const { prompt } = req.body || {};

    if (!prompt) {
      return res.status(400).json({ error: "Missing prompt" });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ error: "GEMINI_API_KEY is not configured" });
    }

    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash-lite:generateContent?key=${apiKey}`;

    const response = await axios.post(
      url,
      {
        contents: [
          {
            parts: [{ text: prompt }],
          },
        ],
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 2048,
        },
      },
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    const text =
      response.data?.candidates?.[0]?.content?.parts?.[0]?.text || "";

    return res.json({ text });
  } catch (error) {
    console.error("Gemini request failed:", error?.response?.data || error.message);
    return res.status(500).json({
      error: "Gemini request failed",
      detail: error?.response?.data || error.message,
    });
  }
});

// 靜態檔案
app.use(express.static(distPath));

// SPA fallback：避免 Express 5 的 * 路由錯誤
app.use((req, res) => {
  res.sendFile(path.join(distPath, "index.html"));
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});