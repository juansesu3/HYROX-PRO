import React, { useEffect } from "react";
import { FiUser, FiUsers } from "react-icons/fi";

// Definimos los props para tipado (opcional pero recomendado)
interface Props {
  formData: any;
  setFormData: React.Dispatch<React.SetStateAction<any>>;
}

const Step2CategorySelection: React.FC<Props> = ({ formData, setFormData }) => {
  const { training } = formData;

  const updateTraining = (field: string, value: string) => {
    setFormData((prev: any) => ({
      ...prev,
      training: {
        ...prev.training,
        [field]: value,
      },
    }));
  };

  // Efecto: Si cambia a individual y estaba en mixed, regresarlo a men (por seguridad)
  useEffect(() => {
    if (training.division === 'individual' && training.gender === 'mixed') {
      updateTraining('gender', 'men');
    }
  }, [training.division]);

  return (
    <div className="space-y-8 animate-fade-in">
      
      {/* 1. SELECCIÓN DE DIVISIÓN */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold text-gray-800 text-center">
          1. Elige tu Modalidad
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Individual */}
          <div
            onClick={() => updateTraining("division", "individual")}
            className={`p-6 border-2 rounded-xl cursor-pointer transition-all flex flex-col items-center gap-3 ${
              training.division === "individual"
                ? "border-blue-600 bg-blue-50 ring-2 ring-blue-100"
                : "border-gray-200 hover:border-blue-300"
            }`}
          >
            <FiUser className={`text-4xl ${training.division === "individual" ? "text-blue-600" : "text-gray-400"}`} />
            <div className="text-center">
              <h3 className="text-lg font-bold text-gray-900">Individual</h3>
              <p className="text-sm text-gray-500">Compite por tu cuenta</p>
            </div>
          </div>

          {/* Dobles */}
          <div
            onClick={() => updateTraining("division", "doubles")}
            className={`p-6 border-2 rounded-xl cursor-pointer transition-all flex flex-col items-center gap-3 ${
              training.division === "doubles"
                ? "border-blue-600 bg-blue-50 ring-2 ring-blue-100"
                : "border-gray-200 hover:border-blue-300"
            }`}
          >
            <FiUsers className={`text-4xl ${training.division === "doubles" ? "text-blue-600" : "text-gray-400"}`} />
            <div className="text-center">
              <h3 className="text-lg font-bold text-gray-900">Dobles (Teams)</h3>
              <p className="text-sm text-gray-500">Compite con un compañero</p>
            </div>
          </div>
        </div>
      </div>

      {/* 2. SELECCIÓN DE CATEGORÍA (GÉNERO) */}
      <div className="space-y-3">
        <h2 className="text-sm font-bold text-gray-700 uppercase tracking-wide">
          2. Categoría {training.division === 'doubles' ? 'del Equipo' : ''}
        </h2>
        
        <div className="flex gap-4">
          {/* Hombres */}
          <button
            type="button"
            onClick={() => updateTraining("gender", "men")}
            className={`flex-1 py-3 px-4 rounded-lg border font-medium transition-colors ${
              training.gender === "men"
                ? "bg-gray-900 text-white border-gray-900 shadow-md"
                : "bg-white text-gray-600 border-gray-300 hover:border-gray-400"
            }`}
          >
            Hombres
          </button>

          {/* Mujeres */}
          <button
            type="button"
            onClick={() => updateTraining("gender", "women")}
            className={`flex-1 py-3 px-4 rounded-lg border font-medium transition-colors ${
              training.gender === "women"
                ? "bg-pink-600 text-white border-pink-600 shadow-md"
                : "bg-white text-gray-600 border-gray-300 hover:border-gray-400"
            }`}
          >
            Mujeres
          </button>

          {/* Mixto (Solo visible en dobles) */}
          {training.division === "doubles" && (
            <button
              type="button"
              onClick={() => updateTraining("gender", "mixed")}
              className={`flex-1 py-3 px-4 rounded-lg border font-medium transition-colors ${
                training.gender === "mixed"
                  ? "bg-purple-600 text-white border-purple-600 shadow-md"
                  : "bg-white text-gray-600 border-gray-300 hover:border-gray-400"
              }`}
            >
              Mixto
            </button>
          )}
        </div>
        
        {/* Mensaje de ayuda visual */}
        <p className="text-xs text-gray-500 mt-1">
            {training.gender === 'mixed' 
                ? "En categoría Mixta, el equipo debe estar formado por un hombre y una mujer."
                : `En categoría ${training.gender === 'men' ? 'Hombres' : 'Mujeres'}, ambos atletas deben ser ${training.gender === 'men' ? 'hombres' : 'mujeres'}.`
            }
        </p>
      </div>

      {/* 3. OPCIONES PARA DOBLES */}
      {training.division === "doubles" && (
        <div className="pt-6 border-t border-gray-100 space-y-4 animate-fade-in-up">
          <h2 className="text-sm font-bold text-gray-700 uppercase tracking-wide">
            3. Registro del compañero
          </h2>
          
          <div className="space-y-3">
            <label
              className={`flex items-start gap-3 p-4 border rounded-lg cursor-pointer transition-all ${
                training.mode === "same-device" ? "border-green-500 bg-green-50" : "border-gray-200"
              }`}
            >
              <input
                type="radio"
                name="duoMode"
                value="same-device"
                checked={training.mode === "same-device"}
                onChange={() => updateTraining("mode", "same-device")}
                className="mt-1 text-green-600 focus:ring-green-500"
              />
              <div>
                <span className="block font-medium text-gray-900">Mismo Dispositivo</span>
                <span className="block text-sm text-gray-500">
                  Rellenaré los datos de mi compañero aquí mismo.
                </span>
              </div>
            </label>

            <label
              className={`flex items-start gap-3 p-4 border rounded-lg cursor-pointer transition-all ${
                training.mode === "invite-partner" ? "border-green-500 bg-green-50" : "border-gray-200"
              }`}
            >
              <input
                type="radio"
                name="duoMode"
                value="invite-partner"
                checked={training.mode === "invite-partner"}
                onChange={() => updateTraining("mode", "invite-partner")}
                className="mt-1 text-green-600 focus:ring-green-500"
              />
              <div>
                <span className="block font-medium text-gray-900">Invitar compañero</span>
                <span className="block text-sm text-gray-500">
                  Generar un enlace para que se una desde su móvil.
                </span>
              </div>
            </label>
          </div>
        </div>
      )}
    </div>
  );
};

export default Step2CategorySelection;