// Ruta: app/login/page.tsx
// =========================================================================
'use client';

import React, { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const result = await signIn('credentials', {
        redirect: false,
        email,
        password,
      });

      if (result?.error) {
        setError('Credenciales inválidas. Por favor, inténtalo de nuevo.');
      } else if (result?.ok) {
        router.push('/');
      }
    } catch (err) {
      console.log(err)
      setError('Ha ocurrido un error inesperado.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-900 text-white p-4">
      <div className="w-full max-w-md p-8 space-y-8 bg-gray-800 rounded-2xl shadow-lg border border-gray-700">
        <div>
          <h1 className="text-4xl font-extrabold text-center uppercase tracking-wider">
            Hyrox<span className="text-blue-500">PRO</span>
          </h1>
          <p className="mt-2 text-center text-gray-400">
            El esfuerzo compartido es doble victoria.
          </p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-400">Email</label>
            <input 
              type="email" 
              value={email} 
              onChange={(e) => setEmail(e.target.value)} 
              required 
              className="w-full px-4 py-3 mt-1 bg-gray-700 border border-gray-600 rounded-md text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-400">Contraseña</label>
            <input 
              type="password" 
              value={password} 
              onChange={(e) => setPassword(e.target.value)} 
              required 
              className="w-full px-4 py-3 mt-1 bg-gray-700 border border-gray-600 rounded-md text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          {error && <p className="text-sm text-red-500 text-center animate-pulse">{error}</p>}
          
          <button 
            type="submit" 
            disabled={isLoading} 
            className="w-full px-4 py-3 font-bold text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-blue-500 disabled:bg-gray-500 transition-all duration-300 ease-in-out"
          >
            {isLoading ? 'INICIANDO...' : 'INICIAR SESIÓN'}
          </button>
        </form>
        <p className="text-sm text-center text-gray-400">
          ¿No tienes una cuenta?{' '}
          <Link href="/register" className="font-medium text-blue-500 hover:underline">
            Regístrate aquí
          </Link>
        </p>
      </div>
    </div>
  );
}