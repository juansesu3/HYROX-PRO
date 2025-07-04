'use client';

import React, { useState, useEffect } from 'react';
import WeekNavigation from './components/WeekNavigation';
import SessionCard from './components/SessionCard';
import OverviewCharts from './components/OverviewCharts';
import ReferenceModal from './components/ReferenceModal';
import { TrainingBlock as TrainingBlockType } from './lib/definitions';
import GeneratingOverlay from './components/GeneratingOverlay';

export default function HomePage() {
    const [trainingBlocks, setTrainingBlocks] = useState<TrainingBlockType[]>([]);
    const [activeBlockIndex, setActiveBlockIndex] = useState(0);
    const [activeWeekIndex, setActiveWeekIndex] = useState(0);
    const [isLoading, setIsLoading] = useState(true);
    const [isGenerating, setIsGenerating] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const [genMessages] = useState<string[]>([
        'Analizando comentarios previos...',
        'Generando nuevo bloque de entrenamiento...',
        'Actualizando la base de datos...',
        'Finalizando...',
    ]);
    const [genStep, setGenStep] = useState(0);
    const [showSuccess, setShowSuccess] = useState(false);

    // Función para cargar los datos desde la API
    const fetchTrainingData = async () => {
        setIsLoading(true);
        setError(null);
        try {
            const response = await fetch('/api/blocks');
            if (!response.ok) {
                throw new Error('Error al cargar los datos del plan desde la API');
            }
            const data: TrainingBlockType[] = await response.json();
            
            const sortedData = data.sort((a, b) => a.blockNumber - b.blockNumber);
            setTrainingBlocks(sortedData);
            
            if (sortedData.length > 0) {
                // Empezar en el bloque más reciente
                setActiveBlockIndex(sortedData.length - 1);
                setActiveWeekIndex(0);
            } else {
                console.log("No se encontraron planes de entrenamiento en la base de datos.");
            }
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } catch (err: any) {
            setError(err.message);
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchTrainingData();
    }, []);

    

    const handleGenerateNextBlock = async () => {
        if (!activeBlock) return;
        setIsGenerating(true);
        setShowSuccess(false);
        setGenStep(0);
        setError(null);

        try {
            // Paso 0: Analizando comentarios previos
            await new Promise(r => setTimeout(r, 1000));
            setGenStep(1);

            const completedBlockNumber = activeBlock.blockNumber;
            const response = await fetch('/api/generate-next-block', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ completedBlockNumber }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Error al generar el nuevo bloque.');
            }

            setGenStep(2);

            const { newBlock } = await response.json();

            const updatedBlocks = [...trainingBlocks, newBlock];
            setTrainingBlocks(updatedBlocks);
            setActiveBlockIndex(updatedBlocks.length - 1);
            setActiveWeekIndex(0);

            setGenStep(3);
            await new Promise(r => setTimeout(r, 1500)); // Mostrar mensaje final

            setShowSuccess(true);
            setTimeout(() => {
                setShowSuccess(false);
                setIsGenerating(false);
            }, 2000);
// eslint-disable-next-line @typescript-eslint/no-explicit-any
        } catch (err: any) {
            setError(err.message);
            alert(`Error: ${err.message}`);
            setIsGenerating(false);
        }
    };

    const handleBlockNavigation = (direction: 'next' | 'prev') => {
        const newIndex = direction === 'next' ? activeBlockIndex + 1 : activeBlockIndex - 1;
        if (newIndex >= 0 && newIndex < trainingBlocks.length) {
            setActiveBlockIndex(newIndex);
            setActiveWeekIndex(0);
        }
    };

    const activeBlock = trainingBlocks[activeBlockIndex];

    if (isLoading) {
        return <div className="flex justify-center items-center min-h-screen">Cargando Plan...</div>;
    }

    if (error) {
         return <div className="flex flex-col justify-center items-center min-h-screen">
            <p className="text-red-500 mb-4">{error}</p>
            <button onClick={fetchTrainingData} className="px-4 py-2 bg-blue-500 text-white rounded">Reintentar</button>
        </div>;
    }
    
    if (!activeBlock) {
        return <div className="flex justify-center items-center min-h-screen">No hay planes de entrenamiento disponibles. Por favor, asegúrate de haber poblado la base de datos.</div>;
    }

    const activeWeekData = activeBlock.weeks[activeWeekIndex];

    return (
        <>
        <div className="bg-gray-50 min-h-screen">
            <div className="container mx-auto p-4 sm:p-6 lg:p-8 text-[#343a40]">
                <header className="text-center mb-8">
                    <div className="flex justify-center items-center gap-4 mb-2">
                        <button
                            onClick={() => handleBlockNavigation('prev')}
                            disabled={activeBlockIndex === 0}
                            className="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            &larr; Bloque Ant.
                        </button>
                        <h1 className="text-4xl md:text-5xl font-extrabold text-[#007bff] w-64 text-center">
                            Bloque {activeBlock.blockNumber}
                        </h1>
                        <button
                            onClick={() => handleBlockNavigation('next')}
                            disabled={activeBlockIndex >= trainingBlocks.length - 1}
                            className="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Bloque Sig. &rarr;
                        </button>
                    </div>
                    <p className="text-lg text-[#6c757d] mt-2">Tu camino para superar el crono de 1h14</p>
                </header>

                <OverviewCharts block={activeBlock} />

                <div className="sticky top-0 bg-gray-50/80 backdrop-blur-sm py-4 z-10 mb-8 rounded-lg">
                    <div className="flex justify-between items-center mb-4 px-2">
                        <h2 className="text-2xl font-bold">Plan Semanal</h2>
                        <button
                            onClick={() => setIsModalOpen(true)}
                            className="bg-[#fd7e14] text-white font-bold py-2 px-4 rounded-lg hover:bg-[#e46f12] transition-colors"
                        >
                            Ver Datos
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
                    <div className="mt-8 text-center">
                        <button
                            onClick={handleGenerateNextBlock}
                            className="bg-green-600 text-white font-bold py-3 px-6 rounded-lg hover:bg-green-700 transition-colors disabled:bg-gray-400"
                            disabled={isGenerating}
                        >
                            {isGenerating ? 'Generando Bloque...' : `Finalizar Bloque ${activeBlock.blockNumber} y Generar Siguiente`}
                        </button>
                    </div>
                )}

                <ReferenceModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
            </div>
        </div>

        {/* Overlay de generación */}
        <GeneratingOverlay
            isVisible={isGenerating && !showSuccess}
            messages={genMessages}
            currentStep={genStep}
        />

        {/* Mensaje éxito */}
        {isGenerating && showSuccess && (
            <div className="fixed inset-0 z-50 bg-green-700 bg-opacity-90 flex items-center justify-center text-white text-2xl font-bold">
                ¡Bloque generado con éxito! 🚀
            </div>
        )}
        </>
    );
}
