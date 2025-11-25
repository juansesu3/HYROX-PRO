'use client';

import React, { useEffect, useRef } from 'react';
import Chart from 'chart.js/auto';
import { TrainingBlock } from '../lib/definitions';

// --- Helper Functions ---

// Analiza el foco de la semana actual (Doughnut)
const getFocusData = (block: TrainingBlock) => {
  const counts = { 'Carrera': 0, 'Fuerza': 0, 'Híbrido': 0 };
  
  const currentWeek = block.weeks[0];
  if (!currentWeek) return [0,0,0];

  currentWeek.sessions.forEach(session => {
    const title = (session.title || '').toLowerCase();
    const focus = (session.focus || '').toLowerCase();
    // Concatenamos para buscar en ambos campos
    const textToCheck = `${title} ${focus}`;

    // BUSQUEDA ROBUSTA (Español + Inglés + Iconos)
    if (textToCheck.match(/carrera|run|running|track|pista|interval|🏃/)) {
        counts['Carrera']++;
    } else if (textToCheck.match(/fuerza|strength|lift|weight|gym|pesas|hypertrophy|💪/)) {
        counts['Fuerza']++;
    } else if (textToCheck.match(/híbrido|hybrid|hyrox|metcon|wod|crossfit|wall ball|sled|burpee|⚙️/)) {
        counts['Híbrido']++;
    } else {
        // Si no matchea nada claro, asumimos híbrido por defecto en Hyrox
        counts['Híbrido']++;
    }
  });
  
  const total = Object.values(counts).reduce((a, b) => a + b, 0);
  if (total === 0) return [33, 33, 33]; 

  return Object.values(counts).map(count => (count / total) * 100);
};

// Analiza la progresión de TODAS las semanas disponibles (Line Chart)
const getProgressionData = (allBlocks: TrainingBlock[]) => {
    const sortedBlocks = [...allBlocks].sort((a, b) => a.blockNumber - b.blockNumber);

    return sortedBlocks.map(block => {
        let intensityScore = 5; // Score base
        const week = block.weeks[0];
        if (!week) return { label: `S${block.blockNumber}`, score: 5 };

        // Buscamos en título, foco y detalles para tener más contexto
        const combinedText = week.sessions.map(s => `${s.focus} ${s.title} ${s.details}`).join(' ').toLowerCase();

        // Heurística de palabras clave BILINGÜE
        // Nivel 10: Max esfuerzo
        if (combinedText.match(/test|competición|competition|race|pico|peak|max|pr |rm /)) {
            intensityScore = 10;
        } 
        // Nivel 8: Alta intensidad
        else if (combinedText.match(/intensidad|intensity|potencia|power|fuerte|hard|rpe 9|rpe 10|threshold|umbral|vo2/)) {
            intensityScore = 8;
        } 
        // Nivel 7: Volumen / Construcción
        else if (combinedText.match(/volumen|volume|acumulación|accumulation|construcción|build|hypertrophy/)) {
            intensityScore = 7;
        } 
        // Nivel 6: Técnica
        else if (combinedText.match(/técnica|technique|habilidad|skill|drills/)) {
            intensityScore = 6;
        } 
        // Nivel 3: Descarga
        else if (combinedText.match(/descarga|deload|recuperación|recovery|taper|suave|easy|light|rest/)) {
            intensityScore = 3;
        }

        return {
            label: `Semana ${block.blockNumber}`,
            score: intensityScore
        };
    });
};

interface OverviewChartsProps {
  currentBlock: TrainingBlock | null;
  allBlocks: TrainingBlock[];
}

export default function OverviewCharts({ currentBlock, allBlocks }: OverviewChartsProps) {
  const focusChartRef = useRef<HTMLCanvasElement>(null);
  const progressionChartRef = useRef<HTMLCanvasElement>(null);
  const chartInstancesRef = useRef<Chart[]>([]);

  useEffect(() => {
    // Limpieza de instancias previas para evitar errores de "Canvas is already in use"
    chartInstancesRef.current.forEach(chart => chart.destroy());
    chartInstancesRef.current = [];

    if (!currentBlock || !allBlocks || allBlocks.length === 0) return;

    const commonOptions = {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          labels: { color: '#64748b', font: { family: 'system-ui' } }
        }
      }
    };
    
    // --- 1. Gráfico de Foco (Doughnut) ---
    const focusCtx = focusChartRef.current?.getContext('2d');
    if (focusCtx) {
      const focusData = getFocusData(currentBlock);
      const focusChart = new Chart(focusCtx, {
        type: 'doughnut',
        data: {
          labels: ['Carrera', 'Fuerza', 'Híbrido'],
          datasets: [{
            data: focusData,
            backgroundColor: ['#3b82f6', '#f59e0b', '#10b981'], 
            borderWidth: 0,
            hoverOffset: 4
          }],
        },
        options: {
            ...commonOptions,
            cutout: '75%',
            plugins: {
                legend: { position: 'bottom', labels: { usePointStyle: true, padding: 20 } }
            }
        },
      });
      chartInstancesRef.current.push(focusChart);
    }

    // --- 2. Gráfico de Progresión (Line) ---
    const progressionCtx = progressionChartRef.current?.getContext('2d');
    if (progressionCtx) {
      const progressionInfo = getProgressionData(allBlocks);
      const progressionChart = new Chart(progressionCtx, {
        type: 'line',
        data: {
          labels: progressionInfo.map(p => p.label),
          datasets: [{
            label: 'Intensidad',
            data: progressionInfo.map(p => p.score),
            borderColor: '#6366f1',
            backgroundColor: 'rgba(99, 102, 241, 0.1)',
            borderWidth: 3,
            pointBackgroundColor: '#ffffff',
            pointBorderColor: '#6366f1',
            pointBorderWidth: 2,
            pointRadius: 5,
            pointHoverRadius: 7,
            fill: true,
            tension: 0.4,
          }],
        },
        options: {
          ...commonOptions,
          scales: {
            y: { 
                beginAtZero: true, 
                max: 10,
                min: 0,
                grid: { color: '#f1f5f9' }, 
                ticks: { stepSize: 2 } 
            },
            x: {
                grid: { display: false }
            }
          },
          plugins: {
              legend: { display: false },
              tooltip: {
                  backgroundColor: '#1e293b',
                  padding: 12,
                  callbacks: {
                      label: (context) => {
                          const val = context.raw as number;
                          let text = '';
                          if (val >= 9) text = 'Muy Alta (Pico)';
                          else if (val >= 7) text = 'Alta (Carga)';
                          else if (val >= 5) text = 'Media (Base)';
                          else text = 'Baja (Descarga)';
                          return `Nivel: ${val} - ${text}`;
                      }
                  }
              }
          }
        },
      });
      chartInstancesRef.current.push(progressionChart);
    }
    
    // Limpieza final al desmontar el componente
    return () => {
        chartInstancesRef.current.forEach(chart => chart.destroy());
        chartInstancesRef.current = [];
    }

  }, [currentBlock, allBlocks]);

  if (!currentBlock) return null;

  return (
    <section className="mb-12 animate-fade-in">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Card 1: Enfoque */}
        <div className="bg-white p-6 rounded-2xl shadow-[0_2px_8px_rgba(0,0,0,0.04)] border border-gray-100 flex flex-col">
          <div className="mb-6 flex justify-between items-start">
            <div>
                <h3 className="font-bold text-gray-900 text-lg">Enfoque Semanal</h3>
                <p className="text-xs text-gray-500">Distribución de carga</p>
            </div>
            <div className="p-2 bg-blue-50 rounded-lg">
                <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z" /></svg>
            </div>
          </div>
          <div className="relative flex-grow min-h-[220px] flex items-center justify-center">
             <canvas ref={focusChartRef}></canvas>
             <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none pb-8">
                <span className="text-3xl font-black text-gray-900">{currentBlock.blockNumber}</span>
                <span className="text-[10px] font-bold uppercase text-gray-400 tracking-wider">Semana</span>
             </div>
          </div>
        </div>

        {/* Card 2: Progresión */}
        <div className="bg-white p-6 rounded-2xl shadow-[0_2px_8px_rgba(0,0,0,0.04)] border border-gray-100 flex flex-col">
          <div className="mb-6 flex justify-between items-start">
            <div>
                <h3 className="font-bold text-gray-900 text-lg">Progresión del Plan</h3>
                <p className="text-xs text-gray-500">Intensidad acumulada</p>
            </div>
            <div className="p-2 bg-indigo-50 rounded-lg">
                <svg className="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>
            </div>
          </div>
          <div className="relative flex-grow min-h-[220px]">
            <canvas ref={progressionChartRef}></canvas>
          </div>
        </div>
      </div>
    </section>
  );
}