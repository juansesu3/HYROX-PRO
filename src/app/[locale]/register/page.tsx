// src/app/[locale]/register/page.tsx
'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { signIn } from 'next-auth/react';
import { useAppDispatch, useAppSelector } from '@/app/lib/store/hooks/hooks';
import {
  setField,
  setError,
  registerUser,
} from '@/app/lib/store/silce/registerSlice';

import { Step1AccountInfo } from '@/app/components/register/Step1AccountInfo';

function RegisterForm() {
  const dispatch = useAppDispatch();
  const router = useRouter();

  const { formData, error, isLoading } = useAppSelector(
    (state) => state.register
  );

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    dispatch(setField({ name: name as any, value }));
  };

  const validate = () => {
    const { email, username, password, confirmPassword } = formData;

    if (!email || !username || !password || !confirmPassword) {
      dispatch(
        setError(
          'Por favor, completa email, nombre de usuario y las contraseñas.'
        )
      );
      return false;
    }

    if (password !== confirmPassword) {
      dispatch(setError('Las contraseñas no coinciden.'));
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    dispatch(setError(null));

    if (!validate()) return;

    // 1) Registrar usuario en tu API
    const result = await dispatch(registerUser());

    if (!registerUser.fulfilled.match(result)) {
      // El slice ya rellenó state.error
      return;
    }

    // 2) Login automático con NextAuth (CredentialsProvider)
    //    Usamos el email como "identifier" porque tu provider acepta email o username
    const signInResult = await signIn('credentials', {
      redirect: false,
      identifier: formData.email,
      password: formData.password,
    });

    if (signInResult?.error) {
      // Si por alguna razón falla el login automático, mostramos error
      dispatch(
        setError(
          'La cuenta se creó, pero hubo un problema iniciando sesión automáticamente. Intenta iniciar sesión manualmente.'
        )
      );
      return;
    }

    // 3) Redirigir a la pantalla autenticada que quieras
    router.push('/get-started'); // o '/', o '/get-started', lo que tú quieras
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 font-sans">
      <div className="w-full max-w-md p-8 space-y-8 bg-white rounded-2xl shadow-lg my-10">
        <h1 className="text-3xl font-bold text-center text-gray-900">
          Crear cuenta
        </h1>
        <p className="text-center text-gray-600">
          Regístrate con tu email, nombre de usuario y contraseña.
        </p>

        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <p className="text-sm text-red-600 text-center bg-red-50 p-3 rounded-md">
              {error}
            </p>
          )}

          <Step1AccountInfo formData={formData} handleChange={handleChange} />

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-2 px-4 rounded-md bg-blue-600 text-white font-semibold hover:bg-blue-700 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Creando cuenta...' : 'Registrarse'}
          </button>
        </form>

        <p className="text-sm text-center text-gray-600">
          ¿Ya tienes una cuenta?{' '}
          <Link
            href="/login"
            className="font-medium text-blue-600 hover:underline"
          >
            Inicia sesión
          </Link>
        </p>
      </div>
    </div>
  );
}

export default function RegisterPage() {
  return <RegisterForm />;
}
