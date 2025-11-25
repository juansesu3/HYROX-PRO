/*
================================================================================
|                                                                              |
|     ARCHIVO: components/register/Step2CategorySelection.jsx (React JS)       |
|                                                                              |
================================================================================
*/

import React from "react";
import { FiUser, FiUsers } from "react-icons/fi";

const Step2CategorySelection = ({ formData, setFormData }) => {
  return (
    <div className="space-y-6 animate-fade-in">
      <h2 className="text-2xl font-semibold text-gray-800 text-center">
        Elige tu Categoría
      </h2>

      {/* Cards de categoría */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Individual */}
        <div
          onClick={() =>
            setFormData((prev) => ({ ...prev, category: "individual" }))
          }
          className={`p-6 border-2 rounded-lg cursor-pointer transition-all ${
            formData.category === "individual"
              ? "border-blue-600 bg-blue-50"
              : "border-gray-300"
          }`}
        >
          <FiUser className="mx-auto mb-2 text-blue-600" size={32} />
          <h3 className="text-lg font-bold text-center">Individual</h3>
          <p className="text-sm text-center text-gray-600">
            Compite por tu cuenta.
          </p>
        </div>

        {/* Dobles */}
        <div
          onClick={() =>
            setFormData((prev) => ({ ...prev, category: "doubles" }))
          }
          className={`p-6 border-2 rounded-lg cursor-pointer transition-all ${
            formData.category === "doubles"
              ? "border-blue-600 bg-blue-50"
              : "border-gray-300"
          }`}
        >
          <FiUsers className="mx-auto mb-2 text-blue-600" size={32} />
          <h3 className="text-lg font-bold text-center">Dobles</h3>
          <p className="text-sm text-center text-gray-600">
            Compite con un compañero.
          </p>
        </div>
      </div>

      {/* Opciones para dobles */}
      {formData.category === "doubles" && (
        <div className="mt-6 space-y-2 border-t pt-4">
          <p className="text-sm font-medium text-gray-700">
            ¿Cómo quieres registrar al segundo atleta?
          </p>

          <label className="flex items-center gap-2 text-sm text-gray-700">
            <input
              type="radio"
              name="duoMode"
              value="same-device"
              checked={formData.mode === "same-device"}
              onChange={() =>
                setFormData((prev) => ({ ...prev, mode: "same-device" }))
              }
            />
            <span>Rellenar sus datos ahora en este dispositivo</span>
          </label>

          <label className="flex items-center gap-2 text-sm text-gray-700">
            <input
              type="radio"
              name="duoMode"
              value="invite-partner"
              checked={formData.mode === "invite-partner"}
              onChange={() =>
                setFormData((prev) => ({ ...prev, mode: "invite-partner" }))
              }
            />
            <span>
              Enviar un enlace para que mi compañero complete su perfil desde
              su propio dispositivo
            </span>
          </label>
        </div>
      )}
    </div>
  );
};

export default Step2CategorySelection;
