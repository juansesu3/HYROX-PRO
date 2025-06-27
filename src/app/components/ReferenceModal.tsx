'use client';

import React, { useEffect, useRef } from 'react';
import Chart from 'chart.js/auto';

interface ReferenceModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ReferenceModal({ isOpen, onClose }: ReferenceModalProps) {
  const weightsChartRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!isOpen) return;

    const ctx = weightsChartRef.current?.getContext('2d');
    let chart: Chart;
    if (ctx) {
      chart = new Chart(ctx, {
        type: 'bar',
        data: {
          labels: ['Sandbag', 'Farmer Carry', 'Wall Balls', 'Sled Push'],
          datasets: [
            { label: 'Hombre (kg)', data: [20, 24, 6, 112.5], backgroundColor: '#007bff' },
            { label: 'Mujer (kg)', data: [10, 16, 4, 87.5], backgroundColor: '#fd7e14' }
          ]
        },
        options: {
          indexAxis: 'y',
          responsive: true,
          maintainAspectRatio: false,
        }
      });
    }
    
    return () => {
        chart?.destroy();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center p-4 z-50" onClick={onClose}>
      <div className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-3xl relative" onClick={(e) => e.stopPropagation()}>
        <button onClick={onClose} className="absolute top-4 right-4 text-2xl font-bold text-gray-500 hover:text-gray-800">&times;</button>
        <h2 className="text-2xl font-bold text-center mb-6 text-[#007bff]">Datos de Referencia</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <h3 className="font-bold text-lg mb-4 text-center">Ritmos de Carrera (min/km)</h3>
            <ul className="space-y-3 text-center">
              <li className="bg-red-100 p-3 rounded-lg"><span className="font-bold">Ritmo A (Intenso):</span> 4:30 - 4:45</li>
              <li className="bg-yellow-100 p-3 rounded-lg"><span className="font-bold">Ritmo B (Controlado):</span> 5:00 - 5:15</li>
              <li className="bg-green-100 p-3 rounded-lg"><span className="font-bold">Ritmo C (Suave):</span> 5:45 - 6:15</li>
            </ul>
          </div>
          <div>
            <h3 className="font-bold text-lg text-center mb-4">Comparativa de Pesos (kg)</h3>
            <div className="relative h-64"><canvas ref={weightsChartRef}></canvas></div>
          </div>
        </div>
      </div>
    </div>
  );
}
