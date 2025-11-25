'use client';

import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { FiChevronLeft, FiChevronRight, FiZap, FiActivity } from 'react-icons/fi';
import WeekNavigation from '@/app/components/WeekNavigation';
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
            let realCategory: 'individual' | 'doubles' = 'individual'; // Default fallback

            if (trainingRes.ok) {
                const trainingData = await trainingRes.json();
                if (trainingData.division) {
                    realCategory = trainingData.division;
                }
            }

            // Configurar perfil con datos reales
            const userProfileData: UserProfile = {
                username: session?.user?.name || "Atleta",
                email: session?.user?.email || "",
                category: realCategory, 
                coachId: undefined 
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

            // Decidir vista
            if (hasBlocks) {
                setIsCoachSelectionMode(false);
            } else {
                setIsCoachSelectionMode(true);
            }

        } catch (err: any) {
            console.error("Error fetching data:", err);
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (session) {
            fetchInitialData();
        }
    }, [session]);

    // --- LÓGICA DE INTERACCIÓN CON TARJETA ---
    const handleCoachCardClick = (trainer: Trainer) => {
        if (selectedTrainer?.id === trainer.id) {
            // Si ya estaba seleccionado, el segundo clic confirma
            handleGenerateBlock();
        } else {
            // Si no, lo selecciona
            setSelectedTrainer(trainer);
        }
    };

    // --- GENERACIÓN DE BLOQUE INTELIGENTE ---
    const handleGenerateBlock = async () => {
        const isInitial = trainingBlocks.length === 0;
        const trainerIdToUse = selectedTrainer?.id || userProfile?.coachId;

        if (isInitial && !trainerIdToUse) {
            alert("Por favor selecciona un entrenador primero.");
            return;
        }

        // Fallback de seguridad
        const activeTrainerId = trainerIdToUse || trainers[0].id; 

        if (!userId) {
            alert("Error de sesión. Por favor recarga la página.");
            return;
        }

        setIsGenerating(true);
        setShowSuccess(false);
        setGenStep(0);
        setError(null);

        setGenMessages(isInitial 
            ? ['Analizando perfil de atleta...', 'Conectando con entrenador...', 'Diseñando Semana 1...', 'Finalizando...']
            : ['Analizando feedback semana anterior...', 'Ajustando cargas y volumen...', `Generando Semana ${trainingBlocks.length + 1}...`, 'Finalizando...']
        );

        try {
            await new Promise(r => setTimeout(r, 1000));
            setGenStep(1);

            const endpoint = isInitial ? '/api/genrative-first-training' : '/api/generate-next-block';
            const payload = isInitial 
                ? { userId, trainerId: activeTrainerId }
                : { 
                    userId, 
                    trainerId: activeTrainerId, 
                    completedBlockNumber: trainingBlocks[trainingBlocks.length - 1].blockNumber 
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
            await new Promise(r => setTimeout(r, 800));
            setGenStep(3);
            await new Promise(r => setTimeout(r, 800));

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
            <div className="flex flex-col justify-center items-center min-h-screen bg-gray-50 space-y-4">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                <p className="text-gray-500 font-medium animate-pulse">Cargando tu plan...</p>
            </div>
        );
    }

    // --- VISTA 1: SELECCIÓN DE COACH (CARRUSEL MÓVIL MEJORADO) ---
    if (isCoachSelectionMode && userProfile) {
        const availableCoaches = trainers.filter(t => 
            t.specialty === userProfile.category || t.specialty === 'hybrid'
        );

        return (
            <div className="min-h-screen bg-gray-50 pb-12">
                <div className="max-w-6xl mx-auto px-4 py-8 md:p-12 space-y-8">
                    <div className="text-center space-y-4">
                        <div className="inline-block px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-bold tracking-wide mb-2">
                            SETUP INICIAL
                        </div>
                        <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900">
                            Elige a tu Coach
                        </h1>
                        <p className="text-base text-gray-600 max-w-xl mx-auto">
                            Según tu categoría <strong className="text-gray-900 uppercase">{userProfile.category}</strong>, 
                            estos son los especialistas disponibles.
                        </p>
                    </div>

                    {/* Carrusel Móvil / Grid Desktop */}
                    <div className="
                        flex overflow-x-auto snap-x snap-mandatory gap-4 pb-8 -mx-4 px-4 
                        md:grid md:grid-cols-2 md:gap-6 md:overflow-visible md:pb-0 md:mx-0 md:px-0 lg:grid-cols-3
                        items-stretch /* Asegura altura igual en Flexbox */
                    ">
                        {availableCoaches.map(trainer => (
                            <div key={trainer.id} className="min-w-[85vw] sm:min-w-[60vw] md:min-w-0 snap-center h-auto flex"> 
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
                                    selectedTrainer?.id === trainer.id ? 'w-6 bg-blue-600' : 'w-1.5 bg-gray-300'
                                }`}
                            />
                        ))}
                    </div>
                </div>

                <GeneratingOverlay
                    isVisible={isGenerating && !showSuccess}
                    messages={genMessages}
                    currentStep={genStep}
                />
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
        <div className="bg-gray-50 min-h-screen font-sans text-gray-800 pb-20">
           

            <div className="container mx-auto p-4 sm:p-6 lg:p-8">
                <header className="flex flex-col md:flex-row justify-between items-start md:items-end mb-10 gap-6 border-b border-gray-200/60 pb-6">
                    <div className="space-y-2">
                        <div className="flex items-center gap-2">
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-50 text-blue-600 border border-blue-100">
                                <FiZap className="w-3 h-3" />
                                Microciclo IA
                            </span>
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold bg-green-50 text-green-600 border border-green-100">
                                <FiActivity className="w-3 h-3" />
                                Activo
                            </span>
                        </div>
                        <h1 className="text-3xl md:text-4xl font-black text-gray-900 tracking-tight">
                            Semana {activeBlock.blockNumber}
                        </h1>
                        <p className="text-gray-500 text-sm font-medium max-w-md leading-relaxed">
                            Planificación optimizada por tu entrenador IA para mejorar tus debilidades.
                        </p>
                    </div>
                    
                    <div className="flex items-center gap-1 bg-white p-1.5 rounded-2xl shadow-[0_2px_8px_rgba(0,0,0,0.04)] border border-gray-100 w-full md:w-auto">
                        <button
                            onClick={() => handleBlockNavigation('prev')}
                            disabled={activeBlockIndex === 0}
                            className="p-3.5 rounded-xl hover:bg-gray-50 text-gray-500 disabled:opacity-30 disabled:hover:bg-transparent transition-all active:scale-95 group"
                        >
                            <FiChevronLeft className="w-5 h-5 group-hover:-translate-x-0.5 transition-transform" />
                        </button>
                        
                        <div className="flex flex-col items-center justify-center px-6 min-w-[120px] border-x border-gray-100/50 h-10">
                            <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mb-0.5">Semana</span>
                            <span className="text-base font-bold text-gray-900 font-mono leading-none">
                                {activeBlockIndex + 1} <span className="text-gray-300 mx-1">/</span> {trainingBlocks.length}
                            </span>
                        </div>

                        <button
                            onClick={() => handleBlockNavigation('next')}
                            disabled={activeBlockIndex >= trainingBlocks.length - 1}
                            className="p-3.5 rounded-xl hover:bg-gray-50 text-gray-500 disabled:opacity-30 disabled:hover:bg-transparent transition-all active:scale-95 group"
                        >
                            <FiChevronRight className="w-5 h-5 group-hover:translate-x-0.5 transition-transform" />
                        </button>
                    </div>
                </header>

                <OverviewCharts 
                    currentBlock={activeBlock} 
                    allBlocks={trainingBlocks} 
                />

                {/* <div className="sticky top-[73px] bg-gray-50/95 py-2 z-30 mb-4 px-1 backdrop-blur-sm">
                    <WeekNavigation
                        activeWeekIndex={activeWeekIndex}
                        setActiveWeekIndex={setActiveWeekIndex}
                        totalWeeks={activeBlock.weeks.length}
                    />
                </div> */}

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
                        <div className="inline-block max-w-md p-6 bg-white rounded-2xl shadow-sm border border-gray-100">
                            <h3 className="font-bold text-gray-900 mb-2">¿Semana completada?</h3>
                            <p className="text-sm text-gray-500 mb-4">
                                Genera el siguiente microciclo basado en tu progreso y comentarios.
                            </p>
                            <button
                                onClick={handleGenerateBlock}
                                className="w-full bg-green-600 text-white font-bold py-3 px-6 rounded-xl hover:bg-green-700 shadow-md transition-all active:scale-95 disabled:bg-gray-400"
                                disabled={isGenerating}
                            >
                                {isGenerating ? 'Generando...' : `Generar Semana ${activeBlock.blockNumber + 1}`}
                            </button>
                        </div>
                    </div>
                )}

                <ReferenceModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
            </div>

            <GeneratingOverlay
                isVisible={isGenerating && !showSuccess}
                messages={genMessages}
                currentStep={genStep}
            />
            
            {isGenerating && showSuccess && (
                <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center backdrop-blur-sm p-4 animate-in fade-in duration-300">
                    <div className="bg-white p-8 rounded-2xl shadow-2xl text-center w-full max-w-sm transform transition-all scale-100">
                        <div className="text-5xl mb-4 animate-bounce">🚀</div>
                        <h2 className="text-2xl font-bold text-gray-900">¡Plan Listo!</h2>
                        <p className="text-gray-500 mt-2">Tu nueva semana de entrenamiento ha sido creada.</p>
                    </div>
                </div>
            )}
        </div>
    );
}