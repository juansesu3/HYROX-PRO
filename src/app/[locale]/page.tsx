'use client';

import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import WeekNavigation from '@/app/components/WeekNavigation';
import SessionCard from '@/app/components/SessionCard';
import OverviewCharts from '@/app/components/OverviewCharts';
import ReferenceModal from '@/app/components/ReferenceModal';
import { TrainingBlock as TrainingBlockType } from '@/app/lib/definitions';
import GeneratingOverlay from '@/app/components/GeneratingOverlay';
import { trainers, Trainer } from '@/app/lib/coaches/coaches';
import TrainerCard from '@/app/components/coaches/TrainerCard';

// --- TIPOS DE USUARIO PARA LA UI ---
type UserProfile = {
    username: string;
    email: string;
    category: 'individual' | 'doubles'; // Esto viene de la BD
    coachId?: string;
};

export default function HomePage() {
    // --- ESTADOS DE DATOS ---
    const { data: session } = useSession();
    const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
    const [trainingBlocks, setTrainingBlocks] = useState<TrainingBlockType[]>([]);
    
    // --- ESTADOS DE UI/NAVEGACIÓN ---
    const [activeBlockIndex, setActiveBlockIndex] = useState(0);
    const [activeWeekIndex, setActiveWeekIndex] = useState(0);
    const [isLoading, setIsLoading] = useState(true);
    const [isGenerating, setIsGenerating] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [error, setError] = useState<string | null>(null);
    
    // --- ESTADOS DE SELECCIÓN DE COACH ---
    const [selectedTrainer, setSelectedTrainer] = useState<Trainer | null>(null);
    const [isCoachSelectionMode, setIsCoachSelectionMode] = useState(false);

    // --- ESTADOS DE GENERACIÓN ---
    const [genMessages] = useState<string[]>([
        'Analizando perfil de atleta...',
        'Conectando con el entrenador seleccionado...',
        'Diseñando microciclo semana 1...',
        'Optimizando cargas de trabajo...',
    ]);
    const [genStep, setGenStep] = useState(0);
    const [showSuccess, setShowSuccess] = useState(false);

    // 1. CARGA INICIAL (Simulada para User Profile + Fetch real para bloques)
    const fetchInitialData = async () => {
        setIsLoading(true);
        setError(null);
        try {
            // A) Obtener Perfil del Usuario (Simulado o endpoint real /api/user/me)
            // Aquí deberías llamar a tu API real para saber si es dobles o individual
            // const userRes = await fetch('/api/user/me');
            // const userData = await userRes.json();
            
            // MOCK DATA PARA DEMOSTRACIÓN:
            const mockUser: UserProfile = {
                username: session?.user?.name || "Atleta",
                email: session?.user?.email || "",
                category: 'doubles', // CAMBIA ESTO A 'individual' PARA PROBAR EL FILTRO
                coachId: undefined // Si es undefined, forzamos selección
            };
            setUserProfile(mockUser);

            // B) Obtener Bloques de Entrenamiento
            const response = await fetch('/api/blocks');
            if (response.ok) {
                const data: TrainingBlockType[] = await response.json();
                const sortedData = data.sort((a, b) => a.blockNumber - b.blockNumber);
                setTrainingBlocks(sortedData);
                
                if (sortedData.length > 0) {
                    setActiveBlockIndex(sortedData.length - 1);
                    setActiveWeekIndex(0);
                }
            } else {
                console.log("No hay bloques previos.");
            }

            // Si no hay bloques Y no hay coach seleccionado en perfil, activar modo selección
            if (!mockUser.coachId && trainingBlocks.length === 0) {
                setIsCoachSelectionMode(true);
            }

        } catch (err: any) {
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

    // 2. FUNCIÓN PARA GENERAR EL PRIMER BLOQUE (O SIGUIENTE)
    const handleGenerateBlock = async () => {
        // Si estamos en modo selección, necesitamos un trainer
        const trainerIdToUse = selectedTrainer?.id || userProfile?.coachId;

        if (!trainerIdToUse) {
            alert("Por favor selecciona un entrenador primero.");
            return;
        }

        setIsGenerating(true);
        setShowSuccess(false);
        setGenStep(0);
        setError(null);

        try {
            // Simulación de pasos de IA
            for (let i = 0; i < 3; i++) {
                await new Promise(r => setTimeout(r, 800));
                setGenStep(i + 1);
            }

            // Llamada real al backend para generar (o mock)
            // const response = await fetch('/api/generate-block', ...);
            
            // AQUÍ IRÍA TU LÓGICA DE GENERACIÓN CON AI
            // Usando trainerIdToUse para el prompt style
            
            await new Promise(r => setTimeout(r, 1000)); // Finalizando

            setGenStep(3);
            setShowSuccess(true);
            
            setTimeout(() => {
                setShowSuccess(false);
                setIsGenerating(false);
                setIsCoachSelectionMode(false); // Salir del modo selección
                // Recargar datos para mostrar el nuevo bloque
                // fetchInitialData(); 
            }, 1500);

        } catch (err: any) {
            setError(err.message);
            setIsGenerating(false);
        }
    };
    
    // --- RENDERERS ---

    // A) PANTALLA DE CARGA
    if (isLoading) {
        return (
            <div className="flex flex-col justify-center items-center min-h-screen bg-gray-50 space-y-4">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                <p className="text-gray-500 font-medium">Cargando tu perfil...</p>
            </div>
        );
    }

    // B) PANTALLA DE SELECCIÓN DE COACH (Si no hay coach o bloques)
    if (isCoachSelectionMode && userProfile) {
        // Filtramos los entrenadores según la categoría del usuario
        const availableCoaches = trainers.filter(t => 
            t.specialty === userProfile.category || t.specialty === 'hybrid'
        );

        return (
            <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6 md:p-12">
                <div className="max-w-6xl mx-auto space-y-10">
                    
                    {/* Header de Bienvenida */}
                    <div className="text-center space-y-4 animate-fade-in-down">
                        <div className="inline-block px-4 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-semibold tracking-wide mb-2">
                            SETUP INICIAL
                        </div>
                        <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 tracking-tight">
                            Hola, <span className="text-blue-600">{userProfile.username}</span> 👋
                        </h1>
                        <p className="text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
                            Hemos detectado que compites en categoría 
                            <strong className="text-gray-900 mx-1 uppercase">
                                {userProfile.category === 'individual' ? 'Individual' : 'Dobles'}
                            </strong>.
                            <br/>
                            Selecciona a tu entrenador especialista para diseñar tu plan perfecto.
                        </p>
                    </div>

                    {/* Grid de Entrenadores */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 pt-4">
                        {availableCoaches.map(trainer => (
                            <TrainerCard
                                key={trainer.id}
                                trainer={trainer}
                                isSelected={selectedTrainer?.id === trainer.id}
                                onSelect={setSelectedTrainer}
                            />
                        ))}
                    </div>

                    {/* Botón de Confirmación (Sticky bottom en móvil) */}
                    <div className={`
                        fixed bottom-0 left-0 right-0 p-4 bg-white/90 backdrop-blur-md border-t border-gray-200 
                        transition-transform duration-300 transform
                        ${selectedTrainer ? 'translate-y-0' : 'translate-y-full'}
                        md:relative md:bg-transparent md:border-none md:translate-y-0 md:p-0 md:flex md:justify-center
                    `}>
                         <button
                            onClick={handleGenerateBlock}
                            disabled={!selectedTrainer}
                            className={`
                                w-full md:w-auto px-10 py-4 rounded-xl font-bold text-lg shadow-xl transition-all
                                ${selectedTrainer 
                                    ? 'bg-blue-600 text-white hover:bg-blue-700 hover:scale-105' 
                                    : 'bg-gray-300 text-gray-500 cursor-not-allowed opacity-0 md:opacity-50'}
                            `}
                        >
                            Confirmar a {selectedTrainer?.name?.split(' ')[0]} y Generar Plan
                        </button>
                    </div>
                </div>

                {/* Overlays de generación */}
                <GeneratingOverlay
                    isVisible={isGenerating && !showSuccess}
                    messages={genMessages}
                    currentStep={genStep}
                />
            </div>
        );
    }

    // C) DASHBOARD PRINCIPAL (Si ya tiene bloques)
    // Este es tu código original de dashboard, mejorado visualmente si lo deseas
    const activeBlock = trainingBlocks[activeBlockIndex];
    if (!activeBlock) return null; // No debería pasar por la lógica anterior, pero por seguridad
    const activeWeekData = activeBlock.weeks[activeWeekIndex];

    const handleBlockNavigation = (direction: 'next' | 'prev') => {
        const newIndex = direction === 'next' ? activeBlockIndex + 1 : activeBlockIndex - 1;
        if (newIndex >= 0 && newIndex < trainingBlocks.length) {
            setActiveBlockIndex(newIndex);
            setActiveWeekIndex(0);
        }
    };

    return (
        <div className="bg-gray-50 min-h-screen font-sans text-gray-800">
             {/* Navbar simple o Header de usuario */}
            <nav className="bg-white border-b px-6 py-4 flex justify-between items-center mb-6">
                <div className="font-bold text-xl tracking-tight">HYROX<span className="text-blue-600">.AI</span></div>
                <div className="flex items-center gap-3">
                    <div className="text-right hidden sm:block">
                        <p className="text-sm font-bold text-gray-900">{userProfile?.username}</p>
                        <p className="text-xs text-gray-500 uppercase">{userProfile?.category}</p>
                    </div>
                    <div className="h-10 w-10 bg-gray-200 rounded-full flex items-center justify-center text-gray-500">
                        {userProfile?.username?.charAt(0).toUpperCase()}
                    </div>
                </div>
            </nav>

            <div className="container mx-auto p-4 sm:p-6 lg:p-8">
                {/* Header de Bloque */}
                <header className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
                    <div>
                        <h1 className="text-3xl font-extrabold text-gray-900">
                            Bloque {activeBlock.blockNumber}
                        </h1>
                        <p className="text-gray-500">Objetivo: Superar el crono de 1h14</p>
                    </div>
                    
                    <div className="flex items-center gap-2 bg-white p-1 rounded-lg shadow-sm border">
                        <button
                            onClick={() => handleBlockNavigation('prev')}
                            disabled={activeBlockIndex === 0}
                            className="px-4 py-2 text-sm font-medium rounded-md hover:bg-gray-100 disabled:opacity-30 transition-colors"
                        >
                            &larr; Anterior
                        </button>
                        <div className="h-4 w-px bg-gray-300 mx-1"></div>
                        <button
                            onClick={() => handleBlockNavigation('next')}
                            disabled={activeBlockIndex >= trainingBlocks.length - 1}
                            className="px-4 py-2 text-sm font-medium rounded-md hover:bg-gray-100 disabled:opacity-30 transition-colors"
                        >
                            Siguiente &rarr;
                        </button>
                    </div>
                </header>

                <OverviewCharts block={activeBlock} />

                <div className="sticky top-0 bg-white/90 backdrop-blur-md py-4 z-10 mb-8 rounded-xl shadow-sm border border-gray-100 px-4 mt-8">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-xl font-bold text-gray-800">Plan Semanal</h2>
                        <button
                            onClick={() => setIsModalOpen(true)}
                            className="text-blue-600 text-sm font-bold hover:underline"
                        >
                            Ver Referencias
                        </button>
                    </div>
                    <WeekNavigation
                        activeWeekIndex={activeWeekIndex}
                        setActiveWeekIndex={setActiveWeekIndex}
                        totalWeeks={activeBlock.weeks.length}
                    />
                </div>

                <main className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pb-20">
                    {activeWeekData.sessions.map((session, index) => (
                        <SessionCard
                            key={`${activeBlock.blockNumber}-${activeWeekIndex}-${index}`}
                            session={session}
                            blockNumber={activeBlock.blockNumber}
                            weekIndex={activeWeekIndex}
                            sessionIndex={index}
                        />
                    ))}
                </main>

                {activeWeekIndex === activeBlock.weeks.length - 1 && (
                    <div className="mt-8 text-center pb-12">
                         <div className="inline-block p-6 bg-white rounded-2xl shadow-lg border border-blue-100 max-w-md">
                            <h3 className="text-lg font-bold mb-2">¿Terminaste el Bloque {activeBlock.blockNumber}?</h3>
                            <p className="text-gray-500 text-sm mb-4">
                                Tu entrenador analizará tu rendimiento y ajustará las cargas para el siguiente bloque.
                            </p>
                            <button
                                onClick={handleGenerateBlock}
                                className="w-full bg-blue-600 text-white font-bold py-3 px-6 rounded-xl hover:bg-blue-700 transition-all shadow-md hover:shadow-lg disabled:bg-gray-400"
                                disabled={isGenerating}
                            >
                                {isGenerating ? 'Generando...' : `Generar Bloque ${activeBlock.blockNumber + 1}`}
                            </button>
                         </div>
                    </div>
                )}

                <ReferenceModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
            </div>

            {/* Overlay global para cuando se genera desde el dashboard */}
            <GeneratingOverlay
                isVisible={isGenerating && !showSuccess}
                messages={genMessages}
                currentStep={genStep}
            />
            
            {isGenerating && showSuccess && (
                <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center backdrop-blur-sm">
                    <div className="bg-white p-8 rounded-2xl shadow-2xl text-center transform animate-bounce-in">
                        <div className="text-5xl mb-4">🚀</div>
                        <h2 className="text-2xl font-bold text-gray-900">¡Bloque listo!</h2>
                        <p className="text-gray-600">A entrenar.</p>
                    </div>
                </div>
            )}
        </div>
    );
}