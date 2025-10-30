import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import OpenAI from "openai";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const OPENAI_KEY = process.env.OPENAI_API_KEY;
if (!OPENAI_KEY)
  console.warn(
    "Warning: OPENAI_API_KEY is not set. The /recommend endpoint will fail without it."
  );

const openai = new OpenAI({
  apiKey: process.env["OPENAI_API_KEY"], // This is the default and can be omitted
});

app.post("/recommend", async (req, res) => {
  const { prompt, products } = req.body || {};
  if (!prompt) return res.status(400).json({ error: "Missing prompt in body" });
  if (!products || !Array.isArray(products))
    return res.status(400).json({ error: "Missing products array in body" });

  // Build a concise prompt asking the model to return a JSON array of product ids from the provided list.
  const systemPrompt = `You are a helpful product recommender. The user will give preferences. Select zero or more products from the provided list that best match the preferences. Only respond with valid JSON — an object with two keys: \n 1) "recommendedIds": an array of product ids (strings) chosen from the provided list (exact ids),\n 2) "explanation": a short text explanation of the reasoning.\nDo NOT include any other text or commentary.`;

  const productListText = products
    .map(
      (p) =>
        `- id: ${p.id}, name: ${p.name}, category: ${p.category}, price: $${
          p.price
        }, features: ${p.features.join("; ")}`
    )
    .join("\n");

  const userPrompt = `User preferences: ${prompt}\n\nProducts:\n${productListText}\n\nReturn only JSON as described.`;

  try {
    console.log([
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt },
    ]);
    const completion = await openai.chat.completions.create({
      model: "gpt-5-nano",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
    });

    console.log("OpenAI response:", completion);
    const raw = completion.choices[0].message.content || "";

    // Try to parse JSON from the model output. Some safety: attempt to find first JSON object.
    let parsed = null;
    try {
      // If the model returned only JSON, this will succeed.
      parsed = JSON.parse(raw);
    } catch (e) {
      // Attempt to extract a JSON substring
      const m = raw.match(/\{[\s\S]*\}/);
      if (m) {
        try {
          parsed = JSON.parse(m[0]);
        } catch (e2) {
          parsed = null;
        }
      }
    }

    if (!parsed) {
      // as a fallback, return raw text so client can show it.
      return res.json({ recommendedIds: [], modelText: raw });
    }

    // Validate recommendedIds
    const recommendedIds = Array.isArray(parsed.recommendedIds)
      ? parsed.recommendedIds.filter((id) => products.some((p) => p.id === id))
      : [];
    const explanation = parsed.explanation || "";

    return res.json({ recommendedIds, modelText: raw, explanation });
  } catch (err) {
    console.error("OpenAI error", err?.response?.data || err.message || err);
    return res.status(500).json({
      error: "OpenAI request failed",
      detail: err?.message || String(err),
    });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server listening on http://localhost:${PORT}`);
});
