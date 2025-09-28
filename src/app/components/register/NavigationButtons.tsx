
/* ================================================================================
|                                                                              |
|             ARCHIVO: components/register/NavigationButtons.tsx               |
|                                                                              |
================================================================================
*/
import { FiChevronLeft, FiChevronRight } from 'react-icons/fi';

interface NavigationButtonsProps {
    currentStep: number;
    totalSteps: number;
    prevStep: () => void;
    nextStep: () => void;
}

export const NavigationButtons = ({ currentStep, totalSteps, prevStep, nextStep }: NavigationButtonsProps) => (
    <div className="flex justify-between pt-4">
        {currentStep > 1 ? (
            <button type="button" onClick={prevStep} className="flex items-center px-4 py-2 font-semibold text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 focus:outline-none">
                <FiChevronLeft size={20} className="mr-1" />
                Atrás
            </button>
        ) : (
            <div /> // Placeholder to keep "Siguiente" on the right
        )}
        {currentStep < totalSteps && (
            <button type="button" onClick={nextStep} className="flex items-center ml-auto px-4 py-2 font-bold text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none">
                Siguiente
                <FiChevronRight size={20} className="ml-1" />
            </button>
        )}
    </div>
);