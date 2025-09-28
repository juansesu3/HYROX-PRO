// components/TrainerCard.tsx
import React from 'react';
import { Trainer } from '@/app/lib/coaches/coaches';

interface TrainerCardProps {
  trainer: Trainer;
  onSelect: (trainer: Trainer) => void;
}

export default function TrainerCard({ trainer, onSelect }: TrainerCardProps) {
  return (
    <div className="bg-white shadow-md rounded-xl p-4 flex flex-col items-center text-center border border-gray-100 hover:shadow-lg transition cursor-pointer">
      <img
        src={trainer.image}
        alt={trainer.name}
        className="w-32 h-32 rounded-2xl  object-contain mb-4"
      />
      <h3 className="text-xl font-bold text-gray-800">{trainer.name}</h3>
      <p className="text-sm text-blue-600 font-semibold mt-1">{trainer.style}</p>
      <p className="text-gray-600 text-sm mt-2">{trainer.description}</p>
      <button
        onClick={() => onSelect(trainer)}
        className="mt-4 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition"
      >
        Seleccionar
      </button>
    </div>
  );
}
