import axios from "axios";
import express from "express";
import { GoogleGenAI } from "@google/genai";
import { Server } from "socket.io";
import { createServer } from "http"
const API_KEY = "AIzaSyD8HF21DpaNVuWfmPJS8mpT-2hsV6utpcM";
const genAI = new GoogleGenAI({ apiKey: API_KEY });

const app = express();
const server = createServer(app);
const gameHistory = new Map();



const io = new Server(server, {
    cors: {
        origin: "*",
    },
});

let socketId = ""
io.on("connection", (socket) => {
    console.log("socket connected:", socket.id);

    socketId = socket.id

    socket.on("disconnect", () => {
        console.log("socket disconnected:", socket.id);
    });
})
async function doPrediction() {
    try {
        // Fetch game history
        const response = await axios.get("https://draw.ar-lottery01.com/WinGo/WinGo_30S/GetHistoryIssuePage.json");
        const data = response.data.data.list;

        // Process and store unique history items
        for (let x of data) {
            if (!gameHistory.has(x.issueNumber)) {
                const bigOrSmall = x.number === 0 || x.number < 5 ? "Small" : "Big";
                gameHistory.set(x.issueNumber, {
                    number: x.number,
                    color: x.color,
                    size: bigOrSmall
                });
            }
        }
        console.log("gameHistory:", gameHistory)
        // Prepare recent 20 entries for prompt
        const recentEntries = [...gameHistory.entries()]
            .reverse()
            .map(([issue, { number, color, size }], index) => {
                return `#${index + 1} - Issue ${issue}: Number = ${number}, Color = ${color}, Size = ${size}`;
            })
            .join("\n");

        // Send prompt to Gemini
        const result = await genAI.models.generateContent({
            model: "gemini-2.0-flash",
            contents: `
You are a professional AI trained for predictive analytics and statistical pattern recognition. Your task is to analyze the WinGo 30-second lottery game results and predict the next outcome based on deep pattern analysis.

## Game Rules:
- Each draw outputs a number from 0 to 9.
- "Small" = 0 to 4, "Big" = 5 to 9.
- Each draw has a color: red, green, violet, or combinations.

## Task:
Based on the most recent draws, predict whether the **next result will be "Big" or "Small"** using any of the following techniques:
- Identify repetition or alternation sequences (e.g., BBSS, SBSB, etc.).
- Detect clusters (e.g., multiple "Big" or "Small" in groups).
- Spot distribution imbalance (e.g., too many "Small" recently could hint at a "Big" outcome).
- Use simple probability and streak behavior to reason.
- Check if color patterns influence the size outcomes.

## Last Results (Latest on top):
${recentEntries}

## Output Format:
Prediction: [Big/Small]  
Reason: [Provide reasoning using pattern, trend, or imbalance – avoid randomness or guesses.]
`

        });

        console.log(result.text);
        io.emit("prediction", result.text)
    } catch (error) {
        console.error("Error:", error.message);
    }
}

setInterval(doPrediction, 30000);


const PORT = process.env.PORT || 8080
server.listen(PORT, () => {
    console.log("Server is running on port 3000");
});
