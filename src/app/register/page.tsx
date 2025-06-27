'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    age: '',
    weight: '',
    height: '',
    physicalActivityLevel: 'sedentary',
  });
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Error al registrar el usuario.');
      }

      // Si el registro es exitoso, redirigir al login
      router.push('/login');
// eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <div className="w-full max-w-lg p-8 space-y-6 bg-white rounded-xl shadow-md">
        <h1 className="text-3xl font-bold text-center text-gray-800">Crear una Cuenta</h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Nombre de Usuario</label>
              <input type="text" name="username" value={formData.username} onChange={handleChange} required className="w-full px-3 py-2 mt-1 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"/>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Email</label>
              <input type="email" name="email" value={formData.email} onChange={handleChange} required className="w-full px-3 py-2 mt-1 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"/>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Contraseña</label>
            <input type="password" name="password" value={formData.password} onChange={handleChange} required className="w-full px-3 py-2 mt-1 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"/>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Edad</label>
              <input type="number" name="age" value={formData.age} onChange={handleChange} className="w-full px-3 py-2 mt-1 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"/>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Peso (kg)</label>
              <input type="number" name="weight" value={formData.weight} onChange={handleChange} className="w-full px-3 py-2 mt-1 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"/>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Altura (cm)</label>
              <input type="number" name="height" value={formData.height} onChange={handleChange} className="w-full px-3 py-2 mt-1 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"/>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Nivel de Actividad Física</label>
            <select name="physicalActivityLevel" value={formData.physicalActivityLevel} onChange={handleChange} className="w-full px-3 py-2 mt-1 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500">
              <option value="sedentary">Sedentario</option>
              <option value="light">Ligero</option>
              <option value="moderate">Moderado</option>
              <option value="active">Activo</option>
              <option value="very_active">Muy Activo</option>
            </select>
          </div>

          {error && <p className="text-sm text-red-600 text-center">{error}</p>}

          <button type="submit" disabled={isLoading} className="w-full px-4 py-2 font-bold text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-gray-400">
            {isLoading ? 'Registrando...' : 'Crear Cuenta'}
          </button>
        </form>
        <p className="text-sm text-center text-gray-600">
          ¿Ya tienes una cuenta? <Link href="/login" className="font-medium text-blue-600 hover:underline">Inicia Sesión</Link>
        </p>
      </div>
    </div>
  );
}