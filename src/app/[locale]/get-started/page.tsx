// src/app/[locale]/get-started/page.tsx
'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';

import Step2CategorySelection from '@/app/components/register/Step2CategorySelection';
import { Step3AthleteProfile } from '@/app/components/register/Step3AthleteProfile';
import { Step4ReviewAndSubmit } from '@/app/components/register/Step4ReviewAndSubmit';
import StepIndicator from '@/app/components/register/StepIndicator';
import { useSession } from 'next-auth/react';
import { DuoInviteSummary } from '@/app/components/register/DuoInviteSummary';

type Athlete = {
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

export type OnboardingFormData = {
  email: string;
  category: 'individual' | 'doubles' | '';
  mode: 'same-device' | 'invite-partner';
  doublesType?: 'men' | 'women' | 'mixed' | '';
  athlete1: Athlete;
  athlete2: Athlete;
};

const initialAthlete: Athlete = {
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

const GetStartedPage: React.FC = () => {
  const router = useRouter();
  const { data: session } = useSession();

  // id del usuario desde next-auth
  const userId = (session?.user as any)?.id as string | undefined;

  const [currentStep, setCurrentStep] = useState<1 | 2 | 3>(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState<OnboardingFormData>({
    email: (session?.user?.email as string) || '',
    category: '',
    mode: 'same-device',
    doublesType: '',
    athlete1: { ...initialAthlete },
    athlete2: { ...initialAthlete },
  });

  // Estado para la pantalla de invitación (dobles + invite-partner)
  const [inviteData, setInviteData] = useState<{
    inviteUrl: string;
    expiresAt: string;
  } | null>(null);
  const [showInviteSummary, setShowInviteSummary] = useState(false);

  // --- Validaciones ---

  const validateStep1 = (): boolean => {
    if (!formData.category) {
      setError('Por favor, elige una categoría (Individual o Dobles).');
      return false;
    }

    if (formData.category === 'doubles' && !formData.mode) {
      setError('Por favor, elige cómo quieres registrar a tu compañero.');
      return false;
    }

    setError(null);
    return true;
  };

  const validateStep2 = (): boolean => {
    const a1 = formData.athlete1;

    if (!a1.username || !a1.age || !a1.weight || !a1.height) {
      setError(
        'Por favor, completa al menos nombre, edad, peso y altura del Atleta 1.'
      );
      return false;
    }

    if (formData.category === 'doubles' && formData.mode === 'same-device') {
      const a2 = formData.athlete2;
      if (!a2.username || !a2.age || !a2.weight || !a2.height) {
        setError(
          'Has elegido Dobles (mismo dispositivo). Completa también los datos básicos del Atleta 2.'
        );
        return false;
      }
    }

    setError(null);
    return true;
  };

  // --- Helpers de actualización ---

  const setAthleteData = (
    athleteKey: 'athlete1' | 'athlete2',
    updatedData: Partial<Athlete>
  ) => {
    setFormData((prev) => ({
      ...prev,
      [athleteKey]: {
        ...prev[athleteKey],
        ...updatedData,
      },
    }));
  };

  // --- Navegación entre pasos ---

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

  // --- Submit global del onboarding ---

  const handleSubmit = async () => {
    setError(null);
    setIsSubmitting(true);

    try {
      if (!userId) {
        setError('No se encontró el usuario en la sesión.');
        return;
      }

      // 1) Llamar a la API de onboarding (crear atletas + actualizar user)
      const payload = {
        userId,
        category: formData.category === '' ? 'individual' : formData.category,
        mode: formData.mode,
        doublesType:
          formData.category === 'doubles'
            ? formData.doublesType || 'mixed'
            : undefined,
        athlete1: formData.athlete1,
        athlete2:
          formData.category === 'doubles' &&
          formData.mode === 'same-device'
            ? formData.athlete2
            : null,
      };

      const resOnboarding = await fetch('/api/onboarding/complete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const onboardingData = await resOnboarding.json();

      if (!resOnboarding.ok) {
        setError(
          onboardingData?.error || 'No se pudo completar el registro.'
        );
        return;
      }

      // 2) Si es dobles + invite-partner → generar invitación y mostrar pantalla de compartir
      if (
        formData.category === 'doubles' &&
        formData.mode === 'invite-partner'
      ) {
        const resInvite = await fetch('/api/register/duo-invite', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId,
            category: 'doubles',
            doublesType: formData.doublesType || 'mixed',
          }),
        });

        const inviteJson = await resInvite.json();

        if (!resInvite.ok) {
          setError(
            inviteJson?.error ||
              'Se completó tu perfil, pero no se pudo generar el enlace de invitación.'
          );
          return;
        }

        setInviteData({
          inviteUrl: inviteJson.inviteUrl,
          expiresAt: inviteJson.expiresAt, // 👈 devuelto desde el backend
        });
        setShowInviteSummary(true);
        return;
      }

      // 3) Caso normal: individual o dobles + same-device
      alert(
        '🎉 ¡Setup completado! Ya puedes empezar con tu plan de entrenamiento.'
      );
      router.push('/');
    } catch (err: any) {
      console.error('Onboarding error:', err);
      setError(
        err?.message ||
          'Ocurrió un error al completar el registro. Inténtalo de nuevo.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  // --- Render del contenido por paso ---

  const renderStep = () => {
    if (currentStep === 1) {
      return (
        <Step2CategorySelection
          formData={formData}
          setFormData={setFormData}
        />
      );
    }

    if (currentStep === 2) {
      return (
        <Step3AthleteProfile
          formData={formData}
          setAthleteData={setAthleteData}
        />
      );
    }

    return (
      <Step4ReviewAndSubmit
        formData={formData}
        isLoading={isSubmitting}
      />
    );
  };

  // --- UI ---

  return (
    <div className="min-h-screen bg-gray-50 flex justify-center px-1 py-10">
      <div className="w-full max-w-3xl bg-white rounded-2xl shadow-lg p-6 md:p-8 space-y-8">
        {/* Mensaje de bienvenida */}
        <div className="space-y-2 text-center">
          <h1 className="text-3xl font-bold text-gray-900">
            ¡Bienvenido a tu setup inicial de entrenamiento! 💪
          </h1>
          <p className="text-gray-600 max-w-xl mx-auto">
            En unos pocos pasos configuraremos tu categoría y tu perfil de
            atleta para que puedas empezar a entrenar con un plan adaptado a ti.
          </p>
        </div>

        {/* Si estamos en la pantalla de invitación, mostramos solo eso */}
        {showInviteSummary && inviteData ? (
          <DuoInviteSummary
            inviteUrl={inviteData.inviteUrl}
            expiresAt={inviteData.expiresAt}
            onContinue={() => {
              router.push('/');
            }}
          />
        ) : (
          <>
            {/* StepIndicator global (Cuenta ya completada, seguimos desde paso 2) */}
            <StepIndicator currentStep={currentStep + 1} />

            {/* Error */}
            {error && (
              <p className="text-sm text-red-600 text-center bg-red-50 p-3 rounded-md">
                {error}
              </p>
            )}

            {/* Contenido del paso */}
            {renderStep()}

            {/* Navegación de pasos */}
            <div className="flex justify-between pt-4">
              <button
                type="button"
                onClick={handlePrev}
                disabled={currentStep === 1 || isSubmitting}
                className="px-4 py-2 rounded-md border border-gray-300 text-gray-700 text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Anterior
              </button>

              {currentStep < 3 ? (
                <button
                  type="button"
                  onClick={handleNext}
                  disabled={isSubmitting}
                  className="px-4 py-2 rounded-md bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Siguiente
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                  className="px-4 py-2 rounded-md bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? 'Guardando...' : 'Comenzar a entrenar'}
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
