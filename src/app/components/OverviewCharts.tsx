// =========================================================================
// 1. COMPONENTE OverviewCharts (VERSIÓN DINÁMICA MEJORADA)
// Reemplaza el contenido de: app/components/OverviewCharts.tsx
// =========================================================================
'use client';

import React, { useEffect, useRef } from 'react';
import Chart from 'chart.js/auto';
import { TrainingBlock } from '../lib/definitions';

// --- Helper Functions para analizar los datos ---

// Calcula la distribución de tipos de sesión
const getFocusData = (block: TrainingBlock) => {
  const counts = { 'Carrera': 0, 'Fuerza': 0, 'Híbrido': 0 };
  
  block.weeks.forEach(week => {
    week.sessions.forEach(session => {
      if (session.title.includes('Carrera')) counts['Carrera']++;
      else if (session.title.includes('Fuerza')) counts['Fuerza']++;
      else if (session.title.includes('Híbrido')) counts['Híbrido']++;
    });
  });
  
  const total = Object.values(counts).reduce((a, b) => a + b, 0);
  if (total === 0) return [0, 0, 0];

  return Object.values(counts).map(count => (count / total) * 100);
};

// Estima la intensidad de cada semana
const getProgressionData = (block: TrainingBlock) => {
    return block.weeks.map(week => {
        let intensityScore = 5; // Base
        const focusKeywords = week.sessions.map(s => s.focus.toLowerCase()).join(' ');

        if (focusKeywords.includes('intensidad') || focusKeywords.includes('pico')) intensityScore = 9;
        else if (focusKeywords.includes('progresión') || focusKeywords.includes('aumento')) intensityScore = 7;
        else if (focusKeywords.includes('descarga') || focusKeywords.includes('recuperación') || focusKeywords.includes('movilidad')) intensityScore = 3;
        else if (focusKeywords.includes('adaptación')) intensityScore = 5;
        
        return intensityScore;
    });
};


// --- Componente Principal ---

interface OverviewChartsProps {
  block: TrainingBlock | null;
}

export default function OverviewCharts({ block }: OverviewChartsProps) {
  const focusChartRef = useRef<HTMLCanvasElement>(null);
  const progressionChartRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const chartInstances: Chart[] = [];
    
    // Si no hay bloque, no hacemos nada. La limpieza se encargará de destruir gráficos antiguos.
    if (!block) return;

    const commonOptions = {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          labels: {
            color: '#333', // Un color más oscuro para mejor contraste
          }
        }
      }
    };
    
    // --- Gráfico de Foco (Doughnut) ---
    const focusCtx = focusChartRef.current?.getContext('2d');
    if (focusCtx) {
      const focusData = getFocusData(block);
      const focusChart = new Chart(focusCtx, {
        type: 'doughnut',
        data: {
          labels: ['Carrera', 'Fuerza', 'Híbrido'],
          datasets: [{
            data: focusData,
            backgroundColor: ['#007bff', '#fd7e14', '#6c757d'],
            borderColor: '#ffffff', // Un borde blanco para separar segmentos
            borderWidth: 4,
          }],
        },
        options: commonOptions,
      });
      chartInstances.push(focusChart);
    }

    // --- Gráfico de Progresión (Line) ---
    const progressionCtx = progressionChartRef.current?.getContext('2d');
    if (progressionCtx) {
      const progressionData = getProgressionData(block);
      const progressionChart = new Chart(progressionCtx, {
        type: 'line',
        data: {
          labels: block.weeks.map(w => `Semana ${w.weekNumber}`),
          datasets: [{
            label: 'Intensidad Estimada',
            data: progressionData,
            fill: true,
            borderColor: '#007bff',
            backgroundColor: 'rgba(0, 123, 255, 0.1)',
            tension: 0.3,
          }],
        },
        options: {
          ...commonOptions,
          scales: { y: { beginAtZero: true, max: 10 } },
        },
      });
      chartInstances.push(progressionChart);
    }
    
    // Limpieza al desmontar el componente o cuando el bloque cambie
    return () => {
        chartInstances.forEach(chart => chart.destroy());
    }

  }, [block]); // Se re-ejecuta cuando el bloque cambia

  // Si no hay un bloque de datos, muestra un estado de carga o vacío.
  if (!block) {
    return (
        <section id="overview" className="mb-10">
          <h2 className="text-2xl font-bold text-center mb-6">Resumen del Bloque</h2>
          <div className="text-center p-8 bg-white rounded-xl shadow-md text-gray-500">
            <p>Cargando datos del bloque...</p>
            <p className="text-sm text-gray-400 mt-1">O selecciona un bloque para ver el resumen.</p>
          </div>
        </section>
      );
  }

  // Si hay un bloque de datos, muestra los gráficos.
  return (
    <section id="overview" className="mb-10">
      <h2 className="text-2xl font-bold text-center mb-6">Resumen del Bloque</h2>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white p-6 rounded-xl shadow-md">
          <h3 className="font-bold text-lg text-center mb-4">Foco de las Sesiones</h3>
          <div className="relative h-64"><canvas ref={focusChartRef}></canvas></div>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-md">
          <h3 className="font-bold text-lg text-center mb-4">Progresión de Intensidad</h3>
          <div className="relative h-64"><canvas ref={progressionChartRef}></canvas></div>
        </div>
      </div>
    </section>
  );
}