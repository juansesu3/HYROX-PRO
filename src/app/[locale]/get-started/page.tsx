'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';

// Componentes
import Step2CategorySelection from '@/app/components/register/Step2CategorySelection';
import { Step3AthleteProfile } from '@/app/components/register/Step3AthleteProfile';
import { Step4ReviewAndSubmit } from '@/app/components/register/Step4ReviewAndSubmit';
import StepIndicator from '@/app/components/register/StepIndicator';
import { DuoInviteSummary } from '@/app/components/register/DuoInviteSummary';

// Tipos
type AthleteGender = 'men' | 'women' | '';

type Athlete = {
  gender: AthleteGender;
  username: string;
  age: string | number;
  weight: string | number;
  height: string | number;
  experience: string;
  goal: string;
  targetTime?: string;
  strengths?: string[];
  weaknesses?: string[];
};

const initialAthlete: Athlete = {
  gender: '',
  username: '',
  age: '',
  weight: '',
  height: '',
  experience: '',
  goal: '',
  targetTime: '',
  strengths: [],
  weaknesses: [],
};

type TrainingSelection = {
  division: 'individual' | 'doubles';
  gender: 'men' | 'women';
  mode: 'same-device' | 'invite-partner';
};

export type OnboardingFormData = {
  email: string;
  training: TrainingSelection;
  athlete1: Athlete;
  athlete2: Athlete;
};

const GetStartedPage: React.FC = () => {
  const router = useRouter();
  const { data: session } = useSession();
  const userId = (session?.user as any)?.id as string | undefined;

  // --- Estados ---
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3>(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Estado para controlar la vista de invitación
  const [inviteData, setInviteData] = useState<{
    inviteUrl: string;
    expiresAt: string;
  } | null>(null);
  const [showInviteSummary, setShowInviteSummary] = useState(false);

  const [formData, setFormData] = useState<OnboardingFormData>({
    email: (session?.user?.email as string) || '',
    training: {
      division: 'individual',
      gender: 'men',
      mode: 'same-device',
    },
    athlete1: { ...initialAthlete },
    athlete2: { ...initialAthlete },
  });

  // --- Validaciones ---
  const validateStep1 = (): boolean => {
    const { training } = formData;
    if (!training.division) {
      setError('Por favor, elige si competirás en Individual o Dobles.');
      return false;
    }
    if (!training.gender) {
      setError('Por favor, elige si competirás en categoría Hombre o Mujer.');
      return false;
    }
    if (training.division === 'doubles' && !training.mode) {
      setError('Por favor, elige cómo quieres registrar a tu compañero.');
      return false;
    }
    setError(null);
    return true;
  };

  const validateStep2 = (): boolean => {
    const { training, athlete1, athlete2 } = formData;
    if (!athlete1.username || !athlete1.age || !athlete1.weight || !athlete1.height) {
      setError('Por favor, completa los datos básicos del Atleta 1.');
      return false;
    }
    if (training.division === 'doubles' && training.mode === 'same-device') {
      if (!athlete2.username || !athlete2.age || !athlete2.weight || !athlete2.height) {
        setError('Para Dobles (mismo dispositivo), completa los datos del Atleta 2.');
        return false;
      }
    }
    setError(null);
    return true;
  };

  // --- Helpers ---
  const setAthleteData = (
    athleteKey: 'athlete1' | 'athlete2',
    updatedData: Partial<Athlete>
  ) => {
    setFormData((prev) => ({
      ...prev,
      [athleteKey]: { ...prev[athleteKey], ...updatedData },
    }));
  };

  const handleNext = () => {
    if (currentStep === 1) {
      if (!validateStep1()) return;
      setCurrentStep(2);
    } else if (currentStep === 2) {
      if (!validateStep2()) return;
      setCurrentStep(3);
    }
  };

  const handlePrev = () => {
    if (currentStep === 1) return;
    setError(null);
    setCurrentStep((prev) => (prev === 1 ? 1 : (prev - 1) as 1 | 2 | 3));
  };

  // --- LÓGICA PRINCIPAL: Handle Submit ---
  const handleSubmit = async () => {
    setError(null);
    setIsSubmitting(true);

    try {
      if (!userId) throw new Error('No se encontró el usuario en la sesión.');

      const { training, athlete1, athlete2 } = formData;

      // 1. Crear Onboarding (Training + Atleta 1)
      const payload = {
        userId,
        training: {
          division: training.division,
          gender: training.gender,
          mode: training.mode,
        },
        athlete1,
        athlete2:
          training.division === 'doubles' && training.mode === 'same-device'
            ? athlete2
            : null,
      };

      const resOnboarding = await fetch('/api/onboarding/complete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const onboardingData = await resOnboarding.json();

      if (!resOnboarding.ok) {
        throw new Error(onboardingData?.error || 'Error al completar registro.');
      }

      const trainingId = onboardingData.trainingId;

      // 2. Lógica Condicional: ¿Es Dobles con Invitación?
      if (training.division === 'doubles' && training.mode === 'invite-partner') {
        
        if (!trainingId) throw new Error('Falta ID de entrenamiento.');

        // Generar el link de invitación
        const resInvite = await fetch('/api/register/duo-invite', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ trainingId }),
        });

        const inviteJson = await resInvite.json();

        if (!resInvite.ok) {
          throw new Error(inviteJson?.error || 'Error al generar invitación.');
        }

        // ✅ ÉXITO: Guardamos datos y mostramos pantalla de invitación
        setInviteData({
          inviteUrl: inviteJson.inviteUrl,
          expiresAt: inviteJson.expiresAt,
        });
        setShowInviteSummary(true); // Esto cambia el renderizado
        setIsSubmitting(false);     // Quitamos el loading
        return;                     // 🛑 DETENEMOS AQUÍ para no redirigir
      }

      // 3. Caso Normal (Individual o Dobles mismo dispositivo)
      alert('🎉 ¡Setup completado!');
      router.push('/'); // Redirigir al dashboard
      
    } catch (err: any) {
      console.error('Onboarding error:', err);
      setError(err?.message || 'Ocurrió un error inesperado.');
      setIsSubmitting(false);
    }
  };

  // --- Render del Formulario (Pasos 1, 2, 3) ---
  const renderStep = () => {
    if (currentStep === 1) {
      return <Step2CategorySelection formData={formData} setFormData={setFormData} />;
    }
    if (currentStep === 2) {
      return <Step3AthleteProfile formData={formData} setAthleteData={setAthleteData} />;
    }
    return (
      <Step4ReviewAndSubmit
        formData={formData}
        isLoading={isSubmitting}
        handleSubmit={handleSubmit}
      />
    );
  };
   
  // --- UI Principal ---
  return (
    <div className="min-h-screen bg-gray-50 flex justify-center px-1 py-10">
      <div className="w-full max-w-3xl bg-white rounded-2xl shadow-lg p-6 md:p-8 space-y-8">
        
        {/* Título Dinámico */}
        <div className="space-y-2 text-center">
          <h1 className="text-3xl font-bold text-gray-900">
            {showInviteSummary ? '¡Casi listos! Invita a tu compañero 🤝' : '¡Bienvenido a tu setup inicial! 💪'}
          </h1>
          <p className="text-gray-600 max-w-xl mx-auto">
            {showInviteSummary 
              ? 'Comparte este enlace con tu compañero para que complete su perfil y puedan empezar.'
              : 'Configura tu categoría y perfil para empezar a entrenar.'}
          </p>
        </div>

        {/* --- RENDERIZADO CONDICIONAL --- */}
        {showInviteSummary && inviteData ? (
          // Opción A: Mostrar Resumen de Invitación
          <DuoInviteSummary
            inviteUrl={inviteData.inviteUrl}
            expiresAt={inviteData.expiresAt}
            onContinue={() => {
              // El usuario decide cuándo ir al dashboard tras copiar el link
              router.push('/');
            }}
          />
        ) : (
          // Opción B: Mostrar Wizard de Registro
          <>
            <StepIndicator currentStep={currentStep + 1} />

            {error && (
              <div className="text-sm text-red-600 text-center bg-red-50 p-3 rounded-md border border-red-100">
                {error}
              </div>
            )}

            {renderStep()}

            {/* Botones de Navegación */}
            <div className="flex justify-between pt-4 border-t border-gray-100">
              <button
                type="button"
                onClick={handlePrev}
                disabled={currentStep === 1 || isSubmitting}
                className="px-4 py-2 rounded-md border border-gray-300 text-gray-700 text-sm font-medium disabled:opacity-50 hover:bg-gray-50 transition-colors"
              >
                Anterior
              </button>

              {currentStep < 3 ? (
                <button
                  type="button"
                  onClick={handleNext}
                  disabled={isSubmitting}
                  className="px-4 py-2 rounded-md bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 disabled:opacity-50 transition-colors shadow-sm"
                >
                  Siguiente
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                  className="px-6 py-2 rounded-md bg-green-600 text-white text-sm font-medium hover:bg-green-700 disabled:opacity-50 transition-colors shadow-sm flex items-center gap-2"
                >
                  {isSubmitting && (
                    <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                  )}
                  {isSubmitting ? 'Guardando...' : 'Finalizar Registro'}
                </button>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default GetStartedPage;