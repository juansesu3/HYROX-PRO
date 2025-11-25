/*
================================================================================
|                                                                              |
|               ARCHIVO: components/register/Step1AccountInfo.tsx              |
|                                                                              |
================================================================================
*/
import { useState } from 'react';
import { FiEye, FiEyeOff } from 'react-icons/fi';
import React from 'react';

// Si quieres, puedes usar:
// import type { RegisterFormData } from '@/app/lib/store/silce/registerSlice';
// type Step1FormData = Pick<RegisterFormData, 'email' | 'username' | 'password' | 'confirmPassword'>;

type Step1FormData = {
  email: string;
  username: string;
  password: string;
  confirmPassword: string;
};

interface Step1AccountInfoProps {
  formData: Step1FormData;
  handleChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export const Step1AccountInfo = ({
  formData,
  handleChange,
}: Step1AccountInfoProps) => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const passwordsMatch =
    formData.password && formData.confirmPassword
      ? formData.password === formData.confirmPassword
      : true;

  return (
    <div className="space-y-4 animate-fade-in">
      <h2 className="text-2xl font-semibold text-gray-800 text-center">
        Información de la Cuenta
      </h2>

      {/* Email */}
      <div>
        <label className="block text-sm font-medium text-gray-700">
          Email
        </label>
        <input
          type="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          required
          className="w-full px-3 py-2 mt-1 border border-gray-300 rounded-md shadow-sm
                     focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          placeholder="tuemail@ejemplo.com"
        />
      </div>

      {/* Username */}
      <div>
        <label className="block text-sm font-medium text-gray-700">
          Nombre de usuario
        </label>
        <input
          type="text"
          name="username"
          value={formData.username}
          onChange={handleChange}
          required
          className="w-full px-3 py-2 mt-1 border border-gray-300 rounded-md shadow-sm
                     focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          placeholder="elige un nombre único"
        />
        <p className="mt-1 text-xs text-gray-500">
          Este nombre se usará para identificarte en la plataforma (rankings,
          perfil, etc.).
        </p>
      </div>

      {/* Password */}
      <div className="relative">
        <label className="block text-sm font-medium text-gray-700">
          Contraseña
        </label>
        <input
          type={showPassword ? 'text' : 'password'}
          name="password"
          value={formData.password}
          onChange={handleChange}
          required
          className="w-full px-3 py-2 mt-1 border border-gray-300 rounded-md shadow-sm
                     focus:outline-none focus:ring-blue-500 focus:border-blue-500"
        />
        <button
          type="button"
          onClick={() => setShowPassword((prev) => !prev)}
          className="absolute right-3 top-9 text-gray-500"
        >
          {showPassword ? <FiEyeOff /> : <FiEye />}
        </button>
      </div>

      {/* Confirm Password */}
      <div className="relative">
        <label className="block text-sm font-medium text-gray-700">
          Confirmar Contraseña
        </label>
        <input
          type={showConfirmPassword ? 'text' : 'password'}
          name="confirmPassword"
          value={formData.confirmPassword}
          onChange={handleChange}
          required
          className={`w-full px-3 py-2 mt-1 border ${
            passwordsMatch ? 'border-gray-300' : 'border-red-500'
          } rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500`}
        />
        <button
          type="button"
          onClick={() => setShowConfirmPassword((prev) => !prev)}
          className="absolute right-3 top-9 text-gray-500"
        >
          {showConfirmPassword ? <FiEyeOff /> : <FiEye />}
        </button>
        {!passwordsMatch && formData.confirmPassword && (
          <p className="text-sm text-red-500 mt-1">
            Las contraseñas no coinciden.
          </p>
        )}
      </div>
    </div>
  );
};
