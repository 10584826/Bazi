const axios = require("axios");

module.exports = async function (context, req) {
  try {
    if (req.method !== "POST") {
      context.res = {
        status: 405,
        body: { error: "Method Not Allowed" }
      };
      return;
    }

    const { prompt } = req.body || {};
    if (!prompt) {
      context.res = {
        status: 400,
        body: { error: "Missing prompt" }
      };
      return;
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      context.res = {
        status: 500,
        body: { error: "GEMINI_API_KEY is not configured" }
      };
      return;
    }

    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash-lite:generateContent?key=${apiKey}`;

    const response = await axios.post(
      url,
      {
        contents: [
          {
            parts: [{ text: prompt }]
          }
        ],
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 2048
        }
      },
      {
        headers: {
          "Content-Type": "application/json"
        }
      }
    );

    const text =
      response.data?.candidates?.[0]?.content?.parts?.[0]?.text || "";

    context.res = {
      status: 200,
      body: { text }
    };
  } catch (error) {
    context.log.error(error);

    context.res = {
      status: 500,
      body: {
        error: "Gemini request failed",
        detail: error.message
      }
    };
  }
};