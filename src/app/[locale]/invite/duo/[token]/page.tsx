// src/app/invite/duo/[token]/page.tsx
'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { AthleteForm } from '@/app/components/register/AthleteForm';
import { Step1AccountInfo } from '@/app/components/register/Step1AccountInfo';

// src/app/invite/duo/[token]/page.tsx

type AthleteGender = 'men' | 'women' | '';

type Athlete = {
  gender: AthleteGender;              // 👈 NUEVO
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
  gender: '',                         // 👈 NUEVO
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


type AccountForm = {
  email: string;
  username: string;
  password: string;
  confirmPassword: string;
};

const initialAccount: AccountForm = {
  email: '',
  username: '',
  password: '',
  confirmPassword: '',
};

const DuoInvitePage: React.FC = () => {
  const params = useParams<{ token: string }>();
  const router = useRouter();
  const token = params.token;

  const [loadingInvite, setLoadingInvite] = useState(true);
  const [inviteError, setInviteError] = useState<string | null>(null);
  const [ownerUsername, setOwnerUsername] = useState<string>('Atleta');
  const [doublesType, setDoublesType] = useState<string | undefined>(undefined);

  // Paso y estados del invitado
  const [step, setStep] = useState<1 | 2>(1);
  const [accountData, setAccountData] = useState<AccountForm>({
    ...initialAccount,
  });
  const [createdUserId, setCreatedUserId] = useState<string | null>(null);

  const [athleteData, setAthleteData] = useState<Athlete>({ ...initialAthlete });
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Cargar info de la invitación
  useEffect(() => {
    const fetchInvite = async () => {
      try {
        setLoadingInvite(true);
        setInviteError(null);

        const res = await fetch(`/api/register/duo-invite/${token}`);
        const data = await res.json();

        if (!res.ok) {
          setInviteError(data?.error || 'No se pudo cargar la invitación.');
          return;
        }

        setOwnerUsername(data.ownerUsername || 'Atleta');
        setDoublesType(data.doublesType);
      } catch (err) {
        console.error(err);
        setInviteError('No se pudo cargar la invitación.');
      } finally {
        setLoadingInvite(false);
      }
    };

    if (token) {
      fetchInvite();
    }
  }, [token]);

  // --- Paso 1: cuenta del invitado ---

  const handleAccountChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const { name, value } = e.target;
    setAccountData((prev) => ({ ...prev, [name]: value }));
  };

  const validateAccountStep = (): boolean => {
    const { email, username, password, confirmPassword } = accountData;

    if (!email || !username || !password || !confirmPassword) {
      setSubmitError(
        'Por favor, completa email, nombre de usuario y ambas contraseñas.'
      );
      return false;
    }

    if (password !== confirmPassword) {
      setSubmitError('Las contraseñas no coinciden.');
      return false;
    }

    return true;
  };

  const handleCreateAccountAndNext = async () => {
    setSubmitError(null);

    if (!validateAccountStep()) return;

    try {
      setSubmitting(true);

      // Reutilizamos el endpoint normal de registro
      const res = await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: accountData.email,
          username: accountData.username,
          password: accountData.password,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setSubmitError(data?.error || 'No se pudo crear tu cuenta.');
        return;
      }

      if (!data.userId) {
        setSubmitError(
          'La cuenta se creó pero no recibimos el ID del usuario.'
        );
        return;
      }

      setCreatedUserId(data.userId as string);

      // Avanzamos al paso 2: completar perfil de atleta
      setStep(2);
    } catch (err: any) {
      console.error(err);
      setSubmitError(
        err?.message ||
          'Ocurrió un error al crear tu cuenta. Inténtalo de nuevo.'
      );
    } finally {
      setSubmitting(false);
    }
  };

  // --- Paso 2: perfil Atleta 2 ---

  const validateAthleteStep = (): boolean => {
    const a = athleteData;

    if (!a.username || !a.age || !a.weight || !a.height) {
      setSubmitError(
        'Por favor, completa al menos nombre, edad, peso y altura.'
      );
      return false;
    }

    if (!a.experience || !a.goal) {
      setSubmitError(
        'Por favor, indica tu experiencia y tu objetivo para Hyrox.'
      );
      return false;
    }

    return true;
  };

  const handleFinalSubmit = async () => {
    setSubmitError(null);

    if (!createdUserId) {
      setSubmitError(
        'No se encontró tu cuenta. Vuelve al paso anterior y crea tu cuenta primero.'
      );
      setStep(1);
      return;
    }

    if (!validateAthleteStep()) return;

    try {
      setSubmitting(true);

      const res = await fetch(`/api/register/duo-invite/${token}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: createdUserId,
          athlete: athleteData,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setSubmitError(data?.error || 'No se pudo completar el perfil.');
        return;
      }

      setSuccess(true);

      // Opcional: redirigir después de unos segundos
      setTimeout(() => {
        router.push('/'); // o una landing específica
      }, 2500);
    } catch (err: any) {
      console.error(err);
      setSubmitError(
        err?.message || 'Ocurrió un error al enviar tu información.'
      );
    } finally {
      setSubmitting(false);
    }
  };

  // --- Render condicional ---

  if (loadingInvite) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <p className="text-gray-600 text-sm">Cargando invitación...</p>
      </div>
    );
  }

  if (inviteError) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow p-6 text-center space-y-3">
          <h1 className="text-xl font-semibold text-gray-900">
            Invitación no disponible
          </h1>
          <p className="text-sm text-gray-600">{inviteError}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex justify-center px-4 py-10">
      <div className="w-full max-w-3xl bg-white rounded-2xl shadow-lg p-6 md:p-8 space-y-8">
        {/* Encabezado */}
        <div className="space-y-2 text-center">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
            Invitación para competir en Dobles
          </h1>
          <p className="text-gray-600 max-w-xl mx-auto text-sm md:text-base">
            <span className="font-semibold">{ownerUsername}</span> te ha invitado
            a formar parte de su equipo Hyrox en modalidad{' '}
            <span className="font-semibold">
              {doublesType ? `Dobles (${doublesType})` : 'Dobles'}
            </span>
            . Primero crea tu cuenta y luego completa tu perfil de atleta.
          </p>
        </div>

        {/* Mensaje de éxito */}
        {success && (
          <div className="p-3 rounded-md bg-green-50 border border-green-200 text-sm text-green-700 text-center">
            🎉 ¡Perfil completado! Redirigiendo...
          </div>
        )}

        {/* Errores */}
        {submitError && (
          <div className="p-3 rounded-md bg-red-50 border border-red-200 text-sm text-red-700 text-center">
            {submitError}
          </div>
        )}

        {/* Paso 1: Cuenta */}
        {step === 1 && (
          <div className="space-y-6">
            <Step1AccountInfo
              formData={accountData}
              handleChange={handleAccountChange}
            />

            <button
              type="button"
              onClick={handleCreateAccountAndNext}
              disabled={submitting || success}
              className="w-full flex justify-center items-center px-4 py-3 font-bold text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-gray-400 transition-all duration-300"
            >
              {submitting ? 'Creando cuenta...' : 'Continuar con mi cuenta'}
            </button>
          </div>
        )}

        {/* Paso 2: Perfil de Atleta 2 */}
        {step === 2 && (
          <div className="space-y-6">
            <AthleteForm
              athleteData={athleteData}
              setAthleteData={(data: Partial<Athlete>) =>
                setAthleteData((prev) => ({ ...prev, ...data }))
              }
              athleteNumber={2}
            />

            <div className="flex justify-between gap-4">
              <button
                type="button"
                onClick={() => setStep(1)}
                disabled={submitting || success}
                className="px-4 py-3 w-1/3 rounded-md border border-gray-300 text-gray-700 text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Volver
              </button>

              <button
                type="button"
                onClick={handleFinalSubmit}
                disabled={submitting || success}
                className="flex-1 flex justify-center items-center px-4 py-3 font-bold text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-gray-400 transition-all duration-300"
              >
                {submitting ? 'Enviando...' : 'Unirme al equipo'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DuoInvitePage;
