/*
================================================================================
|                                                                              |
|      ARCHIVO: components/register/Step3AthleteProfile.tsx                    |
|                                                                              |
================================================================================
*/

import React from 'react';
import { AthleteForm } from './AthleteForm';

interface Step3AthleteProfileProps {
  formData: any; // puedes tipar mejor si quieres
  /**
   * Función opcional para actualizar los datos de atleta.
   * Si no se pasa, el componente no petará (no-op).
   */
  setAthleteData?: (
    athleteKey: 'athlete1' | 'athlete2',
    data: any
  ) => void;
}

export const Step3AthleteProfile: React.FC<Step3AthleteProfileProps> = ({
  formData,
  setAthleteData = () => {}, // 👈 valor por defecto: función vacía
}) => {
  return (
    <div className="space-y-8 animate-fade-in">
      <h2 className="text-2xl font-semibold text-gray-800 text-center">
        Perfil del Atleta
      </h2>

      {/* Atleta 1 */}
      <AthleteForm
        athleteData={formData.athlete1}
        setAthleteData={(data: any) =>
          setAthleteData('athlete1', data)
        }
        athleteNumber={1}
      />

      {/* Atleta 2 sólo si es dobles en mismo dispositivo */}
      {formData.category === 'doubles' &&
        formData.mode === 'same-device' && (
          <div className="pt-8">
            <AthleteForm
              athleteData={formData.athlete2}
              setAthleteData={(data: any) =>
                setAthleteData('athlete2', data)
              }
              athleteNumber={2}
            />
          </div>
        )}
    </div>
  );
};
