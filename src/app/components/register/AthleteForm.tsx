import React, { useEffect } from 'react';

interface AthleteFormProps {
    athleteData: any; 
    setAthleteData: (data: any) => void;
    athleteNumber: number;
    // 👇 NUEVA PROP: Si tiene valor, fuerza el género y bloquea los botones
    lockedGender?: 'men' | 'women' | null; 
}

export const AthleteForm = ({
    athleteData,
    setAthleteData,
    athleteNumber,
    lockedGender = null,
}: AthleteFormProps) => {

    // Efecto para forzar el género si viene bloqueado desde arriba
    useEffect(() => {
        if (lockedGender && athleteData.gender !== lockedGender) {
            setAthleteData({ gender: lockedGender });
        }
    }, [lockedGender, athleteData.gender, setAthleteData]);

    const hyroxExercises = [
        'SkiErg', 'Sled Push', 'Sled Pull', 'Burpee Broad Jumps',
        'Rowing', "Farmer's Carry", 'Sandbag Lunges', 'Wall Balls',
    ];

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setAthleteData({ [name]: value });
    };

    // Helpers para fortalezas y debilidades
    const handleToggleArray = (field: 'strengths' | 'weaknesses', exercise: string) => {
        const currentList = athleteData[field] || [];
        const newList = currentList.includes(exercise)
            ? currentList.filter((item: string) => item !== exercise)
            : [...currentList, exercise].slice(-3);
        setAthleteData({ [field]: newList });
    };

    return (
        <div className="space-y-6 bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
            <h3 className="text-xl font-bold text-gray-800 border-b pb-3 flex items-center justify-between">
                <span>Información del Atleta {athleteNumber}</span>
                {lockedGender && (
                    <span className="text-xs font-normal text-gray-500 bg-gray-100 px-2 py-1 rounded">
                        Género predefinido
                    </span>
                )}
            </h3>

            {/* SELECCIÓN DE GÉNERO */}
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                    Género {lockedGender && "(Fijo por categoría)"}
                </label>
                <div className="flex gap-3">
                    <button
                        type="button"
                        // Si está bloqueado en 'women', deshabilita el botón 'men' y baja opacidad
                        disabled={lockedGender === 'women'} 
                        onClick={() => setAthleteData({ gender: 'men' })}
                        className={`flex-1 px-4 py-2 text-sm font-medium rounded-md border transition-all ${
                            athleteData.gender === 'men'
                                ? 'bg-gray-900 text-white border-gray-900'
                                : 'bg-white text-gray-700 border-gray-300 hover:border-gray-400'
                        } ${lockedGender === 'women' ? 'opacity-30 cursor-not-allowed' : ''}`}
                    >
                        Hombre
                    </button>
                    
                    <button
                        type="button"
                        // Si está bloqueado en 'men', deshabilita el botón 'women'
                        disabled={lockedGender === 'men'}
                        onClick={() => setAthleteData({ gender: 'women' })}
                        className={`flex-1 px-4 py-2 text-sm font-medium rounded-md border transition-all ${
                            athleteData.gender === 'women'
                                ? 'bg-pink-600 text-white border-pink-600'
                                : 'bg-white text-gray-700 border-gray-300 hover:border-gray-400'
                        } ${lockedGender === 'men' ? 'opacity-30 cursor-not-allowed' : ''}`}
                    >
                        Mujer
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Username</label>
                    <input
                        type="text"
                        name="username"
                        value={athleteData.username || ''}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Edad</label>
                    <input
                        type="number"
                        name="age"
                        value={athleteData.age || ''}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Peso (kg)</label>
                    <input
                        type="number"
                        name="weight"
                        value={athleteData.weight || ''}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Altura (cm)</label>
                    <input
                        type="number"
                        name="height"
                        value={athleteData.height || ''}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    />
                </div>
            </div>

            {/* Selectores de Experiencia y Objetivo (Sin cambios mayores) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Experiencia</label>
                    <select
                        name="experience"
                        value={athleteData.experience || 'beginner'}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    >
                        <option value="beginner">Principiante (1ra vez)</option>
                        <option value="intermediate">Intermedio (1-3 carreras)</option>
                        <option value="advanced">Avanzado (+3 carreras)</option>
                        <option value="pro">Pro / Elite</option>
                    </select>
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Objetivo</label>
                    <select
                        name="goal"
                        value={athleteData.goal || 'finish'}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    >
                        <option value="finish">Terminar</option>
                        <option value="time_goal">Tiempo Específico</option>
                        <option value="competitive">Competir</option>
                        <option value="podium">Podio</option>
                    </select>
                </div>
            </div>

            {athleteData.goal === 'time_goal' && (
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Tiempo Objetivo</label>
                    <input
                        type="text"
                        name="targetTime"
                        value={athleteData.targetTime || ''}
                        onChange={handleChange}
                        placeholder="01:15:00"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    />
                </div>
            )}

            {/* Fortalezas y Debilidades */}
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Fortalezas (max 3)</label>
                <div className="flex flex-wrap gap-2">
                    {hyroxExercises.map((ex) => (
                        <button
                            key={ex}
                            type="button"
                            onClick={() => handleToggleArray('strengths', ex)}
                            className={`px-2 py-1 text-xs rounded-full border transition-colors ${
                                athleteData.strengths?.includes(ex)
                                    ? 'bg-green-100 text-green-700 border-green-200 font-medium'
                                    : 'bg-gray-50 text-gray-600 border-gray-200'
                            }`}
                        >
                            {ex}
                        </button>
                    ))}
                </div>
            </div>
             <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Debilidades (max 3)</label>
                <div className="flex flex-wrap gap-2">
                    {hyroxExercises.map((ex) => (
                        <button
                            key={ex}
                            type="button"
                            onClick={() => handleToggleArray('weaknesses', ex)}
                            className={`px-2 py-1 text-xs rounded-full border transition-colors ${
                                athleteData.weaknesses?.includes(ex)
                                    ? 'bg-red-100 text-red-700 border-red-200 font-medium'
                                    : 'bg-gray-50 text-gray-600 border-gray-200'
                            }`}
                        >
                            {ex}
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
};