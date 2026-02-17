'use client';

import React, { useEffect, useRef } from 'react';
import Chart from 'chart.js/auto';
import { useTheme } from 'next-themes';
import { TrainingBlock } from '../lib/definitions';

// --- Helper Functions ---

// Analiza el foco de la semana actual (Doughnut)
const getFocusData = (block: TrainingBlock) => {
  const counts = { Carrera: 0, Fuerza: 0, Híbrido: 0 };

  const currentWeek = block.weeks[0];
  if (!currentWeek) return [0, 0, 0];

  currentWeek.sessions.forEach((session) => {
    const title = (session.title || '').toLowerCase();
    const focus = (session.focus || '').toLowerCase();
    const textToCheck = `${title} ${focus}`;

    if (textToCheck.match(/carrera|run|running|track|pista|interval|🏃/)) {
      counts.Carrera++;
    } else if (textToCheck.match(/fuerza|strength|lift|weight|gym|pesas|hypertrophy|💪/)) {
      counts.Fuerza++;
    } else if (
      textToCheck.match(
        /híbrido|hybrid|hyrox|metcon|wod|crossfit|wall ball|sled|burpee|⚙️/
      )
    ) {
      counts.Híbrido++;
    } else {
      counts.Híbrido++;
    }
  });

  const total = Object.values(counts).reduce((a, b) => a + b, 0);
  if (total === 0) return [33, 33, 33];

  return Object.values(counts).map((count) => (count / total) * 100);
};

// Analiza la progresión de TODAS las semanas disponibles (Line Chart)
const getProgressionData = (allBlocks: TrainingBlock[]) => {
  const sortedBlocks = [...allBlocks].sort((a, b) => a.blockNumber - b.blockNumber);

  return sortedBlocks.map((block) => {
    let intensityScore = 5;
    const week = block.weeks[0];
    if (!week) return { label: `S${block.blockNumber}`, score: 5 };

    const combinedText = week.sessions
      .map((s) => `${s.focus} ${s.title} ${s.details}`)
      .join(' ')
      .toLowerCase();

    if (combinedText.match(/test|competición|competition|race|pico|peak|max|pr |rm /)) {
      intensityScore = 10;
    } else if (
      combinedText.match(
        /intensidad|intensity|potencia|power|fuerte|hard|rpe 9|rpe 10|threshold|umbral|vo2/
      )
    ) {
      intensityScore = 8;
    } else if (
      combinedText.match(/volumen|volume|acumulación|accumulation|construcción|build|hypertrophy/)
    ) {
      intensityScore = 7;
    } else if (combinedText.match(/técnica|technique|habilidad|skill|drills/)) {
      intensityScore = 6;
    } else if (combinedText.match(/descarga|deload|recuperación|recovery|taper|suave|easy|light|rest/)) {
      intensityScore = 3;
    }

    return { label: `Semana ${block.blockNumber}`, score: intensityScore };
  });
};

interface OverviewChartsProps {
  currentBlock: TrainingBlock | null;
  allBlocks: TrainingBlock[];
}

export default function OverviewCharts({ currentBlock, allBlocks }: OverviewChartsProps) {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === 'dark';

  const focusChartRef = useRef<HTMLCanvasElement>(null);
  const progressionChartRef = useRef<HTMLCanvasElement>(null);
  const chartInstancesRef = useRef<Chart[]>([]);

  useEffect(() => {
    // Limpieza de instancias previas
    chartInstancesRef.current.forEach((chart) => chart.destroy());
    chartInstancesRef.current = [];

    if (!currentBlock || !allBlocks || allBlocks.length === 0) return;

    // Paleta “sport energetic” pero legible en dark
    const labelColor = isDark ? '#cbd5e1' : '#64748b'; // slate-300 / slate-500
    const titleColor = isDark ? '#e2e8f0' : '#0f172a'; // slate-200 / slate-900
    const gridColor = isDark ? 'rgba(148,163,184,0.15)' : '#f1f5f9'; // slate-400/15 / slate-100
    const tooltipBg = isDark ? '#0b1220' : '#1e293b'; // deep slate
    const tooltipText = '#e2e8f0';

    const commonOptions: any = {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          labels: {
            color: labelColor,
            font: { family: 'system-ui', weight: '700' as any },
          },
        },
        tooltip: {
          backgroundColor: tooltipBg,
          titleColor: tooltipText,
          bodyColor: tooltipText,
          padding: 12,
          borderColor: isDark ? 'rgba(148,163,184,0.18)' : 'rgba(15,23,42,0.08)',
          borderWidth: 1,
        },
      },
    };

    // --- 1. Gráfico de Foco (Doughnut) ---
    const focusCtx = focusChartRef.current?.getContext('2d');
    if (focusCtx) {
      const focusData = getFocusData(currentBlock);

      const focusChart = new Chart(focusCtx, {
        type: 'doughnut',
        data: {
          labels: ['Carrera', 'Fuerza', 'Híbrido'],
          datasets: [
            {
              data: focusData,
              // mantenemos colores “energéticos”
              backgroundColor: ['#3b82f6', '#f59e0b', '#10b981'],
              borderWidth: 0,
              hoverOffset: 6,
            },
          ],
        },
        options: {
          ...commonOptions,
          cutout: '75%',
          plugins: {
            ...commonOptions.plugins,
            legend: {
              position: 'bottom',
              labels: {
                ...commonOptions.plugins.legend.labels,
                usePointStyle: true,
                padding: 18,
              },
            },
          },
        },
      });

      chartInstancesRef.current.push(focusChart);
    }

    // --- 2. Gráfico de Progresión (Line) ---
    const progressionCtx = progressionChartRef.current?.getContext('2d');
    if (progressionCtx) {
      const progressionInfo = getProgressionData(allBlocks);

      const lineColor = '#6366f1'; // indigo
      const fillColor = isDark ? 'rgba(99, 102, 241, 0.18)' : 'rgba(99, 102, 241, 0.10)';
      const pointBg = isDark ? '#0f172a' : '#ffffff';

      const progressionChart = new Chart(progressionCtx, {
        type: 'line',
        data: {
          labels: progressionInfo.map((p) => p.label),
          datasets: [
            {
              label: 'Intensidad',
              data: progressionInfo.map((p) => p.score),
              borderColor: lineColor,
              backgroundColor: fillColor,
              borderWidth: 3,
              pointBackgroundColor: pointBg,
              pointBorderColor: lineColor,
              pointBorderWidth: 2,
              pointRadius: 5,
              pointHoverRadius: 7,
              fill: true,
              tension: 0.4,
            },
          ],
        },
        options: {
          ...commonOptions,
          scales: {
            y: {
              beginAtZero: true,
              max: 10,
              min: 0,
              grid: { color: gridColor },
              ticks: { stepSize: 2, color: labelColor },
              border: { color: isDark ? 'rgba(148,163,184,0.18)' : 'rgba(15,23,42,0.06)' },
            },
            x: {
              grid: { display: false },
              ticks: { color: labelColor },
              border: { color: isDark ? 'rgba(148,163,184,0.18)' : 'rgba(15,23,42,0.06)' },
            },
          },
          plugins: {
            ...commonOptions.plugins,
            legend: { display: false },
            tooltip: {
              ...commonOptions.plugins.tooltip,
              callbacks: {
                label: (context: any) => {
                  const val = context.raw as number;
                  let text = '';
                  if (val >= 9) text = 'Muy Alta (Pico)';
                  else if (val >= 7) text = 'Alta (Carga)';
                  else if (val >= 5) text = 'Media (Base)';
                  else text = 'Baja (Descarga)';
                  return `Nivel: ${val} - ${text}`;
                },
              },
            },
          },
        },
      });

      chartInstancesRef.current.push(progressionChart);
    }

    return () => {
      chartInstancesRef.current.forEach((chart) => chart.destroy());
      chartInstancesRef.current = [];
    };
  }, [currentBlock, allBlocks, isDark]);

  if (!currentBlock) return null;

  return (
    <section className="mb-12 animate-fade-in">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Card 1: Enfoque */}
        <div
          className="
            relative overflow-hidden rounded-2xl border shadow-sm p-6 flex flex-col
            bg-white border-slate-200
            dark:bg-slate-900 dark:border-slate-800
          "
        >
          {/* sporty glow */}
          <div className="pointer-events-none absolute -top-16 -right-16 h-40 w-40 rounded-full bg-blue-500/10 blur-3xl dark:bg-blue-500/20" />
          <div className="pointer-events-none absolute -bottom-20 -left-16 h-48 w-48 rounded-full bg-emerald-400/10 blur-3xl dark:bg-emerald-400/20" />

          <div className="relative mb-6 flex justify-between items-start">
            <div>
              <h3 className="font-black text-slate-900 dark:text-slate-100 text-lg">
                Enfoque Semanal
              </h3>
              <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                Distribución de carga
              </p>
            </div>

            <div
              className="
                p-2 rounded-xl border
                bg-blue-50 border-blue-100
                dark:bg-blue-950/40 dark:border-blue-900/50
              "
              aria-hidden="true"
              title="Enfoque"
            >
              <svg
                className="w-5 h-5 text-blue-600 dark:text-blue-300"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z"
                />
              </svg>
            </div>
          </div>

          <div className="relative flex-grow min-h-[220px] flex items-center justify-center">
            <canvas ref={focusChartRef}></canvas>

            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none pb-8">
              <span className="text-3xl font-black text-slate-900 dark:text-slate-100">
                {currentBlock.blockNumber}
              </span>
              <span className="text-[10px] font-black uppercase text-slate-400 dark:text-slate-500 tracking-wider">
                Semana
              </span>
            </div>
          </div>
        </div>

        {/* Card 2: Progresión */}
        <div
          className="
            relative overflow-hidden rounded-2xl border shadow-sm p-6 flex flex-col
            bg-white border-slate-200
            dark:bg-slate-900 dark:border-slate-800
          "
        >
          {/* sporty glow */}
          <div className="pointer-events-none absolute -top-16 -left-16 h-44 w-44 rounded-full bg-indigo-500/10 blur-3xl dark:bg-indigo-500/20" />
          <div className="pointer-events-none absolute -bottom-20 -right-16 h-48 w-48 rounded-full bg-lime-400/10 blur-3xl dark:bg-lime-400/18" />

          <div className="relative mb-6 flex justify-between items-start">
            <div>
              <h3 className="font-black text-slate-900 dark:text-slate-100 text-lg">
                Progresión del Plan
              </h3>
              <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                Intensidad acumulada
              </p>
            </div>

            <div
              className="
                p-2 rounded-xl border
                bg-indigo-50 border-indigo-100
                dark:bg-indigo-950/40 dark:border-indigo-900/50
              "
              aria-hidden="true"
              title="Progresión"
            >
              <svg
                className="w-5 h-5 text-indigo-600 dark:text-indigo-300"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
                />
              </svg>
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
