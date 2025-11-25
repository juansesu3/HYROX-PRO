import React from 'react';
import { AthleteForm } from './AthleteForm';

interface Step3Props {
  formData: any;
  setAthleteData: (key: 'athlete1' | 'athlete2', data: any) => void;
}

export const Step3AthleteProfile: React.FC<Step3Props> = ({ formData, setAthleteData }) => {
  const { training, athlete1, athlete2 } = formData;

  // LÓGICA DE BLOQUEO DE GÉNERO
  // Si training.gender es 'mixed', NO bloqueamos nada (null).
  // Si es 'men' o 'women', forzamos ese valor.
  const lockedGender = training.gender === 'mixed' ? null : training.gender;

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold text-gray-900">Perfil de Atleta</h2>
        <p className="text-gray-500">
          Vamos a configurar tu perfil {training.division === 'doubles' ? 'y el de tu compañero' : ''}.
        </p>
      </div>

      {/* Formulario Atleta 1 */}
      <AthleteForm
        athleteNumber={1}
        athleteData={athlete1}
        setAthleteData={(data) => setAthleteData('athlete1', data)}
        lockedGender={lockedGender} // 👈 Pasamos el bloqueo
      />

      {/* Formulario Atleta 2 (Solo si es dobles y mismo dispositivo) */}
      {training.division === 'doubles' && training.mode === 'same-device' && (
        <div className="pt-6 border-t border-gray-200">
             <div className="mb-6 bg-blue-50 border border-blue-100 text-blue-800 p-4 rounded-lg text-sm">
                💡 Estás registrando al segundo atleta ahora. Asegúrate de tener sus datos de peso, altura y tiempos a mano.
            </div>
            <AthleteForm
                athleteNumber={2}
                athleteData={athlete2}
                setAthleteData={(data) => setAthleteData('athlete2', data)}
                lockedGender={lockedGender} // 👈 Pasamos el bloqueo también aquí
            />
        </div>
      )}
    </div>
  );
};