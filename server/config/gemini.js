import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";

dotenv.config();

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

if (!GEMINI_API_KEY) {
  console.warn("⚠️  GEMINI_API_KEY not found in environment variables. AI features will use fallback responses.");
}

// Initialize Gemini AI - use null if key not provided (will fail gracefully)
const genAI = GEMINI_API_KEY ? new GoogleGenerativeAI(GEMINI_API_KEY) : null;

export default genAI;

