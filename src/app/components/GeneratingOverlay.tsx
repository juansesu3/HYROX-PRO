// components/GeneratingOverlay.tsx
import React from 'react';

interface GeneratingOverlayProps {
  messages: string[];
  currentStep: number;
  isVisible: boolean;
}

export default function GeneratingOverlay({ messages, currentStep, isVisible }: GeneratingOverlayProps) {
  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-70 flex flex-col justify-center items-center text-white p-4">
      <div className="mb-6">
        {/* Spinner simple */}
        <svg
          className="animate-spin h-16 w-16 text-white"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          ></circle>
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
          ></path>
        </svg>
      </div>
      <div className="text-center max-w-sm">
        {messages.map((msg, idx) => (
          <p
            key={idx}
            className={`mb-2 transition-opacity duration-500 ${
              idx === currentStep ? 'opacity-100 font-semibold' : 'opacity-50'
            }`}
          >
            {msg}
          </p>
        ))}
      </div>
    </div>
  );
}
