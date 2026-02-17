'use client';

import { useState, useEffect, useMemo } from 'react';
import { useSession } from 'next-auth/react';
import { useTheme } from 'next-themes';
import {
  FiChevronLeft,
  FiChevronRight,
  FiZap,
  FiActivity,
  FiMoon,
  FiSun,
} from 'react-icons/fi';

import SessionCard from '@/app/components/SessionCard';
import OverviewCharts from '@/app/components/OverviewCharts';
import ReferenceModal from '@/app/components/ReferenceModal';
import { TrainingBlock as TrainingBlockType } from '@/app/lib/definitions';
import GeneratingOverlay from '@/app/components/GeneratingOverlay';
import { trainers, Trainer } from '@/app/lib/coaches/coaches';
import TrainerCard from '@/app/components/coaches/TrainerCard';

type UserProfile = {
  username: string;
  email: string;
  category: 'individual' | 'doubles';
  coachId?: string;
};

function ThemeToggleSport() {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);
  if (!mounted) return null;

  const isDark = resolvedTheme === 'dark';

  return (
    <button
      type="button"
      onClick={() => setTheme(isDark ? 'light' : 'dark')}
      className="
        group inline-flex items-center gap-2 rounded-2xl px-3 py-2 text-sm font-bold
        border shadow-sm transition active:scale-[0.98]
        bg-white text-slate-900 border-slate-200 hover:bg-slate-50
        dark:bg-slate-900 dark:text-slate-100 dark:border-slate-800 dark:hover:bg-slate-800/70
      "
      aria-label="Cambiar tema"
    >
      <span
        className="
          grid h-8 w-8 place-items-center rounded-xl
          bg-slate-900 text-white
          dark:bg-gradient-to-br dark:from-blue-500 dark:via-emerald-400 dark:to-lime-400 dark:text-slate-950
          transition
        "
      >
        {isDark ? <FiSun className="h-4 w-4" /> : <FiMoon className="h-4 w-4" />}
      </span>
      <span className="hidden sm:inline">{isDark ? 'Light' : 'Dark'}</span>
    </button>
  );
}

export default function HomePage() {
  const { data: session } = useSession();
  const userId = (session?.user as any)?.id;

  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [trainingBlocks, setTrainingBlocks] = useState<TrainingBlockType[]>([]);

  // UI States
  const [activeBlockIndex, setActiveBlockIndex] = useState(0);
  const [activeWeekIndex, setActiveWeekIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Coach Selection
  const [selectedTrainer, setSelectedTrainer] = useState<Trainer | null>(null);
  const [isCoachSelectionMode, setIsCoachSelectionMode] = useState(false);

  // Generation States
  const [genMessages, setGenMessages] = useState<string[]>([
    'Analizando perfil...',
    'Diseñando microciclo...',
    'Optimizando cargas...',
    'Finalizando...',
  ]);
  const [genStep, setGenStep] = useState(0);
  const [showSuccess, setShowSuccess] = useState(false);

  const fetchInitialData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      // 1. Obtener Categoría Real desde el Training
      const trainingRes = await fetch('/api/training/active');
      let realCategory: 'individual' | 'doubles' = 'individual';

      if (trainingRes.ok) {
        const trainingData = await trainingRes.json();
        if (trainingData.division) realCategory = trainingData.division;
      }

      // Configurar perfil con datos reales
      const userProfileData: UserProfile = {
        username: session?.user?.name || 'Atleta',
        email: session?.user?.email || '',
        category: realCategory,
        coachId: undefined,
      };
      setUserProfile(userProfileData);

      // 2. Obtener Bloques
      const blocksRes = await fetch('/api/blocks');
      let hasBlocks = false;

      if (blocksRes.ok) {
        const data: TrainingBlockType[] = await blocksRes.json();
        if (data.length > 0) {
          hasBlocks = true;
          const sortedData = data.sort((a, b) => a.blockNumber - b.blockNumber);
          setTrainingBlocks(sortedData);
          setActiveBlockIndex(sortedData.length - 1);
          setActiveWeekIndex(0);
        }
      }

      setIsCoachSelectionMode(!hasBlocks);
    } catch (err: any) {
      console.error('Error fetching data:', err);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (session) fetchInitialData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session]);

  // --- LÓGICA DE INTERACCIÓN CON TARJETA ---
  const handleCoachCardClick = (trainer: Trainer) => {
    if (selectedTrainer?.id === trainer.id) {
      handleGenerateBlock();
    } else {
      setSelectedTrainer(trainer);
    }
  };

  // --- GENERACIÓN DE BLOQUE INTELIGENTE ---
  const handleGenerateBlock = async () => {
    const isInitial = trainingBlocks.length === 0;
    const trainerIdToUse = selectedTrainer?.id || userProfile?.coachId;

    if (isInitial && !trainerIdToUse) {
      alert('Por favor selecciona un entrenador primero.');
      return;
    }

    const activeTrainerId = trainerIdToUse || trainers[0].id;

    if (!userId) {
      alert('Error de sesión. Por favor recarga la página.');
      return;
    }

    setIsGenerating(true);
    setShowSuccess(false);
    setGenStep(0);
    setError(null);

    setGenMessages(
      isInitial
        ? ['Analizando perfil de atleta...', 'Conectando con entrenador...', 'Diseñando Semana 1...', 'Finalizando...']
        : [
            'Analizando feedback semana anterior...',
            'Ajustando cargas y volumen...',
            `Generando Semana ${trainingBlocks.length + 1}...`,
            'Finalizando...',
          ]
    );

    try {
      await new Promise((r) => setTimeout(r, 1000));
      setGenStep(1);

      const endpoint = isInitial ? '/api/genrative-first-training' : '/api/generate-next-block';
      const payload = isInitial
        ? { userId, trainerId: activeTrainerId }
        : {
            userId,
            trainerId: activeTrainerId,
            completedBlockNumber: trainingBlocks[trainingBlocks.length - 1].blockNumber,
          };

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Error al generar el entrenamiento.');
      }

      const data = await response.json();
      const newBlock = data.block;

      setGenStep(2);
      await new Promise((r) => setTimeout(r, 800));
      setGenStep(3);
      await new Promise((r) => setTimeout(r, 800));

      const updatedBlocks = [...trainingBlocks, newBlock].sort((a, b) => a.blockNumber - b.blockNumber);
      setTrainingBlocks(updatedBlocks);

      setActiveBlockIndex(updatedBlocks.length - 1);
      setActiveWeekIndex(0);

      setShowSuccess(true);

      setTimeout(() => {
        setShowSuccess(false);
        setIsGenerating(false);
        setIsCoachSelectionMode(false);
      }, 1500);
    } catch (err: any) {
      console.error(err);
      setError(err.message);
      setIsGenerating(false);
    }
  };

  // --- RENDERIZADO ---

  if (isLoading) {
    return (
      <div className="relative min-h-screen overflow-hidden bg-slate-50 dark:bg-slate-950">
        {/* sporty glow */}
        <div className="pointer-events-none absolute -top-24 left-1/2 h-72 w-72 -translate-x-1/2 rounded-full bg-blue-500/20 blur-3xl dark:bg-blue-500/25" />
        <div className="pointer-events-none absolute -bottom-24 left-1/3 h-72 w-72 -translate-x-1/2 rounded-full bg-emerald-400/20 blur-3xl dark:bg-emerald-400/25" />

        <div className="flex min-h-screen flex-col items-center justify-center gap-4 px-6 text-slate-900 dark:text-slate-100">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 dark:border-emerald-300" />
          <p className="text-slate-600 dark:text-slate-400 font-medium animate-pulse">
            Cargando tu plan...
          </p>
        </div>
      </div>
    );
  }

  // --- VISTA 1: SELECCIÓN DE COACH ---
  if (isCoachSelectionMode && userProfile) {
    const availableCoaches = trainers.filter(
      (t) => t.specialty === userProfile.category || t.specialty === 'hybrid'
    );

    return (
      <div className="relative min-h-screen overflow-hidden bg-slate-50 dark:bg-slate-950 pb-12">
        {/* energetic background */}
        <div className="pointer-events-none absolute -top-28 right-[-120px] h-96 w-96 rounded-full bg-blue-500/15 blur-3xl dark:bg-blue-500/25" />
        <div className="pointer-events-none absolute -bottom-28 left-[-120px] h-96 w-96 rounded-full bg-lime-400/10 blur-3xl dark:bg-lime-400/20" />

        <div className="max-w-6xl mx-auto px-4 py-8 md:p-12 space-y-8 relative">
          <div className="flex items-center justify-between gap-3">
            <div className="text-left space-y-2">
              <div
                className="
                  inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-black tracking-widest
                  bg-blue-100 text-blue-700 border border-blue-200
                  dark:bg-blue-950/40 dark:text-blue-200 dark:border-blue-900/50
                "
              >
                <FiZap className="h-3.5 w-3.5" />
                SETUP INICIAL
              </div>
              <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 dark:text-slate-100">
                Elige a tu Coach
              </h1>
              <p className="text-base text-slate-600 dark:text-slate-400 max-w-xl">
                Según tu categoría{' '}
                <strong className="text-slate-900 dark:text-slate-100 uppercase">
                  {userProfile.category}
                </strong>
                , estos son los especialistas disponibles.
              </p>
            </div>

            <ThemeToggleSport />
          </div>

          {/* Carrusel Móvil / Grid Desktop */}
          <div
            className="
              flex overflow-x-auto snap-x snap-mandatory gap-4 pb-8 -mx-4 px-4
              md:grid md:grid-cols-2 md:gap-6 md:overflow-visible md:pb-0 md:mx-0 md:px-0 lg:grid-cols-3
              items-stretch
            "
          >
            {availableCoaches.map((trainer) => (
              <div
                key={trainer.id}
                className="min-w-[85vw] sm:min-w-[60vw] md:min-w-0 snap-center h-auto flex"
              >
                <div className="w-full">
                  <TrainerCard
                    trainer={trainer}
                    isSelected={selectedTrainer?.id === trainer.id}
                    onSelect={handleCoachCardClick}
                  />
                </div>
              </div>
            ))}
          </div>

          {/* Indicador de Scroll (Solo Móvil) */}
          <div className="md:hidden flex justify-center gap-1.5 mt-[-10px]">
            {availableCoaches.map((trainer, idx) => (
              <div
                key={idx}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  selectedTrainer?.id === trainer.id
                    ? 'w-7 bg-blue-600 dark:bg-emerald-300'
                    : 'w-1.5 bg-slate-300 dark:bg-slate-700'
                }`}
              />
            ))}
          </div>

          {error && (
            <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-rose-800 dark:border-rose-900/40 dark:bg-rose-950/40 dark:text-rose-200">
              <div className="text-sm font-bold">Error</div>
              <div className="text-sm opacity-90">{error}</div>
            </div>
          )}
        </div>

        <GeneratingOverlay isVisible={isGenerating && !showSuccess} messages={genMessages} currentStep={genStep} />
      </div>
    );
  }

  // --- VISTA 2: DASHBOARD PRINCIPAL ---
  const activeBlock = trainingBlocks[activeBlockIndex];
  if (!activeBlock) return null;

  const activeWeekData = activeBlock.weeks[activeWeekIndex];

  const handleBlockNavigation = (direction: 'next' | 'prev') => {
    const newIndex = direction === 'next' ? activeBlockIndex + 1 : activeBlockIndex - 1;
    if (newIndex >= 0 && newIndex < trainingBlocks.length) {
      setActiveBlockIndex(newIndex);
      setActiveWeekIndex(0);
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden pb-20 font-sans bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100">
      {/* energetic background */}
      <div className="pointer-events-none absolute -top-28 left-1/2 h-80 w-80 -translate-x-1/2 rounded-full bg-blue-500/10 blur-3xl dark:bg-blue-500/20" />
      <div className="pointer-events-none absolute -bottom-32 left-1/3 h-80 w-80 -translate-x-1/2 rounded-full bg-emerald-400/10 blur-3xl dark:bg-emerald-400/20" />

      <div className="container mx-auto relative p-4 sm:p-6 lg:p-8">
        <header className="flex flex-col md:flex-row justify-between items-start md:items-end mb-10 gap-6 border-b border-slate-200/60 dark:border-slate-800/60 pb-6">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <span
                className="
                  inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-black
                  bg-blue-50 text-blue-600 border border-blue-100
                  dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-900/50
                "
              >
                <FiZap className="w-3 h-3" />
                Microciclo IA
              </span>

              <span
                className="
                  inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-black
                  bg-emerald-50 text-emerald-600 border border-emerald-100
                  dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-900/50
                "
              >
                <FiActivity className="w-3 h-3" />
                Activo
              </span>

              <span
                className="
                  inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-black
                  bg-slate-900 text-white border border-slate-900
                  dark:bg-gradient-to-r dark:from-blue-500 dark:via-emerald-400 dark:to-lime-400 dark:text-slate-950 dark:border-transparent
                "
              >
                BOOST
              </span>
            </div>

            <h1 className="text-3xl md:text-4xl font-black tracking-tight text-slate-900 dark:text-slate-100">
              Semana {activeBlock.blockNumber}
            </h1>
            <p className="text-slate-600 dark:text-slate-400 text-sm font-medium max-w-md leading-relaxed">
              Planificación optimizada por tu entrenador IA para mejorar tus debilidades.
            </p>

            {error && (
              <div className="mt-3 rounded-2xl border border-rose-200 bg-rose-50 p-3 text-rose-800 dark:border-rose-900/40 dark:bg-rose-950/40 dark:text-rose-200">
                <div className="text-xs font-black tracking-widest uppercase">Error</div>
                <div className="text-sm">{error}</div>
              </div>
            )}
          </div>

          <div className="flex items-center gap-2 w-full md:w-auto">
            <ThemeToggleSport />

            <div
              className="
                flex items-center gap-1 w-full md:w-auto p-1.5 rounded-2xl border shadow-sm
                bg-white border-slate-200
                dark:bg-slate-900 dark:border-slate-800
              "
            >
              <button
                onClick={() => handleBlockNavigation('prev')}
                disabled={activeBlockIndex === 0}
                className="
                  p-3.5 rounded-xl transition-all active:scale-95 group
                  text-slate-600 hover:bg-slate-50 disabled:opacity-30 disabled:hover:bg-transparent
                  dark:text-slate-300 dark:hover:bg-slate-800/70
                "
              >
                <FiChevronLeft className="w-5 h-5 group-hover:-translate-x-0.5 transition-transform" />
              </button>

              <div className="flex flex-col items-center justify-center px-6 min-w-[120px] border-x border-slate-200/50 dark:border-slate-800/50 h-10">
                <span className="text-[10px] text-slate-400 dark:text-slate-500 font-black uppercase tracking-widest mb-0.5">
                  Semana
                </span>
                <span className="text-base font-black text-slate-900 dark:text-slate-100 font-mono leading-none">
                  {activeBlockIndex + 1}{' '}
                  <span className="text-slate-300 dark:text-slate-700 mx-1">/</span> {trainingBlocks.length}
                </span>
              </div>

              <button
                onClick={() => handleBlockNavigation('next')}
                disabled={activeBlockIndex >= trainingBlocks.length - 1}
                className="
                  p-3.5 rounded-xl transition-all active:scale-95 group
                  text-slate-600 hover:bg-slate-50 disabled:opacity-30 disabled:hover:bg-transparent
                  dark:text-slate-300 dark:hover:bg-slate-800/70
                "
              >
                <FiChevronRight className="w-5 h-5 group-hover:translate-x-0.5 transition-transform" />
              </button>
            </div>
          </div>
        </header>

        <OverviewCharts currentBlock={activeBlock} allBlocks={trainingBlocks} />

        <main className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {activeWeekData?.sessions?.map((session, index) => (
            <SessionCard
              key={`${activeBlock.blockNumber}-${activeWeekIndex}-${index}`}
              session={session}
              blockNumber={activeBlock.blockNumber}
              weekIndex={activeWeekIndex}
              sessionIndex={index}
            />
          ))}
        </main>

        {activeBlockIndex === trainingBlocks.length - 1 && (
          <div className="mt-12 text-center pb-12">
            <div
              className="
                inline-block max-w-md p-6 rounded-2xl border shadow-sm
                bg-white border-slate-200
                dark:bg-slate-900 dark:border-slate-800
              "
            >
              <h3 className="font-black text-slate-900 dark:text-slate-100 mb-2">¿Semana completada?</h3>
              <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
                Genera el siguiente microciclo basado en tu progreso y comentarios.
              </p>

              <button
                onClick={handleGenerateBlock}
                disabled={isGenerating}
                className="
                  w-full rounded-xl px-6 py-3 font-black text-white shadow-md transition-all active:scale-95 disabled:opacity-50
                  bg-emerald-600 hover:bg-emerald-700
                  dark:bg-gradient-to-r dark:from-emerald-400 dark:via-lime-400 dark:to-cyan-300
                  dark:text-slate-950 dark:hover:opacity-95
                "
              >
                {isGenerating ? 'Generando...' : `Generar Semana ${activeBlock.blockNumber + 1}`}
              </button>
            </div>
          </div>
        )}

        <ReferenceModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
      </div>

      <GeneratingOverlay isVisible={isGenerating && !showSuccess} messages={genMessages} currentStep={genStep} />

      {isGenerating && showSuccess && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center backdrop-blur-sm p-4 animate-in fade-in duration-300">
          <div className="bg-white dark:bg-slate-900 p-8 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl text-center w-full max-w-sm">
            <div className="text-5xl mb-4 animate-bounce">🚀</div>
            <h2 className="text-2xl font-black text-slate-900 dark:text-slate-100">¡Plan Listo!</h2>
            <p className="text-slate-600 dark:text-slate-400 mt-2">
              Tu nueva semana de entrenamiento ha sido creada.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
