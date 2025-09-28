/*
================================================================================
|                                                                              |
|               ARCHIVO: components/register/Step3AthleteProfile.tsx           |
|                                                                              |
================================================================================
*/
// import { FormData, AthleteData } from '@/app/register/page';
// import { AthleteForm } from './AthleteForm';

import { AthleteForm } from "./AthleteForm";

interface Step3AthleteProfileProps {
    formData: any; // Replace with Pick<FormData, 'category' | 'athlete1' | 'athlete2'>
    setAthleteData: (athleteKey: 'athlete1' | 'athlete2', data: any) => void; // Replace with (athleteKey: 'athlete1' | 'athlete2', data: Partial<AthleteData>) => void
}

export const Step3AthleteProfile = ({ formData, setAthleteData }: Step3AthleteProfileProps) => (
    <div className="space-y-8 animate-fade-in">
        <h2 className="text-2xl font-semibold text-gray-800 text-center">Perfil del Atleta</h2>
        <AthleteForm athleteData={formData.athlete1} setAthleteData={(data) => setAthleteData('athlete1', data)} athleteNumber={1} />
        {formData.category === 'doubles' && (
            <div className="pt-8">
                <AthleteForm athleteData={formData.athlete2} setAthleteData={(data) => setAthleteData('athlete2', data)} athleteNumber={2} />
            </div>
        )}
    </div>
);

// export default Step3AthleteProfile; // Already exported above