/*
================================================================================
|                                                                              |
|               ARCHIVO: components/register/StepIndicator.tsx                 |
|                                                                              |
================================================================================
*/
import React from 'react';
import { FiUser, FiUsers, FiCheckCircle } from 'react-icons/fi';
import { LuTrophy } from "react-icons/lu";

interface StepIndicatorProps {
    currentStep: number;
}

export const StepIndicator = ({ currentStep }: StepIndicatorProps) => {
    const steps = [
        { icon: <FiUser size={24} />, title: 'Cuenta' },
        { icon: <LuTrophy size={24} />, title: 'Categoría' },
        { icon: <FiUsers size={24} />, title: 'Atleta(s)' },
        { icon: <FiCheckCircle size={24} />, title: 'Finalizar' },
    ];

    return (
        <div className="flex items-center justify-center mb-8">
            {steps.map((step, index) => (
                <React.Fragment key={index}>
                    <div className="flex flex-col items-center text-center w-20">
                        <div
                            className={`w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300 ${index + 1 <= currentStep ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-500'}`}
                        >
                            {step.icon}
                        </div>
                        <p className={`mt-2 text-xs font-semibold ${index + 1 <= currentStep ? 'text-blue-600' : 'text-gray-500'}`}>{step.title}</p>
                    </div>
                    {index < steps.length - 1 && (
                        <div className={`flex-1 h-1 mx-2 transition-all duration-300 ${index + 1 < currentStep ? 'bg-blue-600' : 'bg-gray-200'}`}></div>
                    )}
                </React.Fragment>
            ))}
        </div>
    );
};

export default StepIndicator;