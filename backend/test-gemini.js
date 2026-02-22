import { GoogleGenerativeAI } from "@google/generative-ai";

const apiKey = "AIzaSyCQkuMjAJdtNlfhommAzUHkjmAVriyelOs";
const genAI = new GoogleGenerativeAI(apiKey);

async function check() {
    try {
        const modelInfo = await genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
        const res = await modelInfo.generateContent("hello");
        console.log("Success with gemini-2.5-flash:", res.response.text());
    } catch (e) {
        console.log("Error with gemini-2.5-flash:", e.message);
    }
}
check();
