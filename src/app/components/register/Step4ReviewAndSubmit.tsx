
/*
================================================================================
|                                                                              |
|            ARCHIVO: components/register/Step4ReviewAndSubmit.tsx             |
|                                                                              |
================================================================================
*/
import React from 'react';

interface Step4ReviewAndSubmitProps {
    formData: any; // Replace with FormData
    isLoading: boolean;
}

export const Step4ReviewAndSubmit = ({ formData, isLoading, handleSubmit }: Step4ReviewAndSubmitProps) => (
    <div className="space-y-6 animate-fade-in">
        <h2 className="text-2xl font-semibold text-gray-800 text-center">Revisar y Finalizar</h2>
        <div className="p-6 bg-gray-50 rounded-lg space-y-4">
            <div><strong className="text-gray-800">Email:</strong> <span className="text-gray-600">{formData.email}</span></div>
            <div><strong className="text-gray-800">Categoría:</strong> <span className="text-gray-600 capitalize">{formData.category}{formData.category === 'doubles' ? ` (${formData.doublesType})` : ''}</span></div>
            <div className="border-t pt-4 mt-4">
                <h4 className="font-bold text-lg mb-2">Atleta 1: {formData.athlete1.username}</h4>
                <p className="text-sm text-gray-600"><strong>Edad:</strong> {formData.athlete1.age}, <strong>Peso:</strong> {formData.athlete1.weight}kg, <strong>Altura:</strong> {formData.athlete1.height}cm</p>
            </div>
            {formData.category === 'doubles' && formData.athlete2.username && (
                <div className="border-t pt-4 mt-4">
                    <h4 className="font-bold text-lg mb-2">Atleta 2: {formData.athlete2.username}</h4>
                    <p className="text-sm text-gray-600"><strong>Edad:</strong> {formData.athlete2.age}, <strong>Peso:</strong> {formData.athlete2.weight}kg, <strong>Altura:</strong> {formData.athlete2.height}cm</p>
                </div>
            )}
        </div>


        <button type="submit" disabled={isLoading} onClick={handleSubmit} className="w-full flex justify-center items-center px-4 py-3 font-bold text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-gray-400 transition-all duration-300 mt-6">
            {isLoading ? 'Registrando...' : 'Finalizar Registro'}
        </button>
    </div>
);

// export default Step4ReviewAndSubmit; // Already exported above
