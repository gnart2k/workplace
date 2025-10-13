import { GoogleGenerativeAI } from "@google/generative-ai";
import { Hono } from "hono";

const apiKey = process.env.GEMINI_API_KEY;
if (!apiKey) {
  throw new Error("GEMINI_API_KEY is not set.");
}
const genAI = new GoogleGenerativeAI(apiKey);

const genai = new Hono().post("/generate-description", async (c) => {
  const { title } = await c.req.json();
  if (!title) {
    return c.json({ error: "Title is required" }, 400);
  }

  const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
  const prompt = `Write a short and concise description for a task with the title: "${title}".`;
  const result = await model.generateContent(prompt);
  const response = await result.response;
  const text = response.text();

  return c.json({ description: text });
});

export default genai;
