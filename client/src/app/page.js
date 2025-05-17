"use client"

import { connectSocket } from "@/utils/socket";
import { useEffect, useState } from "react";

export default function Home() {
  const [prediction, setPrediction] = useState("")

  useEffect(() => {
    const socket = connectSocket()
    socket.on("prediction", (data) => {
      console.log("data", data)
      setPrediction(data)
    })
  }, [])

  // Extract prediction and reason
  const parsedPrediction = prediction.split("Reason:")
  const predictionTitle = parsedPrediction[0]?.replace("Prediction:", "").trim()
  const reasonText = parsedPrediction[1]?.trim()

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-6">
      <div className="bg-white shadow-lg rounded-2xl p-8 max-w-2xl w-full">
        <h1 className="text-2xl font-bold mb-4 text-gray-800">
          Prediction: <span className="text-blue-600">{predictionTitle}</span>
        </h1>
        {reasonText && (
          <div>
            <h2 className="text-lg font-semibold text-gray-700 mb-2">Reason:</h2>
            <p className="text-gray-600 leading-relaxed whitespace-pre-line">
              {reasonText}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
