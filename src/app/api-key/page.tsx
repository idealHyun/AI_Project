"use client";

import { useState } from "react";

type Props = {};

export default function Page({}: Props) {
  const [apiKey, setApiKey] = useState<string | null>(null);

  const fetchApiKey = async () => {
    try {
      // Replace this URL with your actual API endpoint
      const response = await fetch("/api/api-key");
      if (!response.ok) {
        throw new Error("Failed to fetch API key");
      }
      const data = await response.json();
      setApiKey(data.apiKey);
    } catch (error) {
      console.error("Error fetching API key:", error);
      alert("API key 발급에 실패했습니다.");
    }
  };

  const handleCopy = () => {
    if (apiKey) {
      navigator.clipboard.writeText(apiKey);
      alert("API key를 복사했습니다.");
    }
  };

  return (
    <div className="w-screen h-screen flex flex-col items-center justify-center space-y-6">
      <button
        onClick={fetchApiKey}
        className="px-6 py-3 bg-blue-500 text-white font-semibold rounded-lg shadow-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-400"
      >
        api key 발급
      </button>

      {apiKey && (
        <div className="flex flex-col items-center space-y-3">
          <span className="text-lg font-mono text-black bg-gray-100 p-3 rounded-md border border-gray-300">
            {apiKey}
          </span>
          <button
            onClick={handleCopy}
            className="px-4 py-2 bg-gray-500 text-white font-semibold rounded-lg shadow-md hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-400"
          >
            복사하기
          </button>
        </div>
      )}
    </div>
  );
}
