/*
================================================================================
|                                                                              |
|                  ARCHIVO: components/register/AthleteForm.tsx                |
|                                                                              |
================================================================================
*/
// Note: AthleteData is imported from page.tsx or defined in a types file
// For simplicity here, we assume it's available.
// import { AthleteData } from '@/app/register/page';

interface AthleteFormProps {
    athleteData: any; // Replace with AthleteData type
    setAthleteData: (data: any) => void; // Replace with (data: Partial<AthleteData>) => void
    athleteNumber: number;
}

export const AthleteForm = ({ athleteData, setAthleteData, athleteNumber }: AthleteFormProps) => {
    const hyroxExercises = [
        "SkiErg", "Sled Push", "Sled Pull", "Burpee Broad Jumps",
        "Rowing", "Farmer's Carry", "Sandbag Lunges", "Wall Balls"
    ];

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setAthleteData({ [name]: value });
    };

    const handleStrengthChange = (exercise: string) => {
        const strengths = athleteData.strengths || [];
        const newStrengths = strengths.includes(exercise)
            ? strengths.filter((s: string) => s !== exercise)
            : [...strengths, exercise].slice(-3); // Keep last 3
        setAthleteData({ strengths: newStrengths });
    };

    const handleWeaknessChange = (exercise: string) => {
        const weaknesses = athleteData.weaknesses || [];
        const newWeaknesses = weaknesses.includes(exercise)
            ? weaknesses.filter((w: string) => w !== exercise)
            : [...weaknesses, exercise].slice(-3); // Keep last 3
        setAthleteData({ weaknesses: newWeaknesses });
    };

    return (
        <div className="space-y-6">
            <h3 className="text-xl font-bold text-gray-800 border-b pb-2">Información del Atleta {athleteNumber}</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input type="text" name="username" value={athleteData.username || ''} onChange={handleChange} placeholder="Nombre de Usuario" required className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500" />
                <input type="number" name="age" value={athleteData.age || ''} onChange={handleChange} placeholder="Edad" required className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500" />
                <input type="number" name="weight" value={athleteData.weight || ''} onChange={handleChange} placeholder="Peso (kg)" required className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500" />
                <input type="number" name="height" value={athleteData.height || ''} onChange={handleChange} placeholder="Altura (cm)" required className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500" />
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nivel de Experiencia en Hyrox</label>
                <select name="experience" value={athleteData.experience || 'beginner'} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500">
                    <option value="beginner">Es mi primera vez</option>
                    <option value="intermediate">He completado 1-3 carreras</option>
                    <option value="advanced">He completado más de 3 carreras</option>
                    <option value="pro">Compito a nivel Pro</option>
                </select>
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Objetivo Principal</label>
                <select name="goal" value={athleteData.goal || 'finish'} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500">
                    <option value="finish">Simplemente terminar la carrera</option>
                    <option value="time_goal">Alcanzar un tiempo específico</option>
                    <option value="competitive">Ser competitivo en mi grupo de edad</option>
                    <option value="podium">Buscar el podio</option>
                </select>
            </div>
            {athleteData.goal === 'time_goal' && (
                <input type="text" name="targetTime" value={athleteData.targetTime || ''} onChange={handleChange} placeholder="Tiempo Objetivo (ej: 01:15:00)" className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500" />
            )}
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Fortalezas (Selecciona hasta 3)</label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                    {hyroxExercises.map(ex => (
                        <button key={ex} type="button" onClick={() => handleStrengthChange(ex)} className={`px-2 py-1 text-sm rounded-md transition-all ${athleteData.strengths?.includes(ex) ? 'bg-green-500 text-white' : 'bg-gray-200'}`}>
                            {ex}
                        </button>
                    ))}
                </div>
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Debilidades (Selecciona hasta 3)</label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                    {hyroxExercises.map(ex => (
                        <button key={ex} type="button" onClick={() => handleWeaknessChange(ex)} className={`px-2 py-1 text-sm rounded-md transition-all ${athleteData.weaknesses?.includes(ex) ? 'bg-red-500 text-white' : 'bg-gray-200'}`}>
                            {ex}
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
};

// export default AthleteForm; // Already exported above