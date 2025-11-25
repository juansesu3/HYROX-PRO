import React from 'react';
import { Trainer } from '@/app/lib/coaches/coaches';
// 👇 CAMBIO: Usamos react-icons/fi en lugar de lucide-react
import { FiUser, FiUsers, FiZap } from 'react-icons/fi';

interface Props {
  trainer: Trainer;
  onSelect: (trainer: Trainer) => void;
  isSelected?: boolean;
}

const TrainerCard: React.FC<Props> = ({ trainer, onSelect, isSelected }) => {
  return (
    <div 
      onClick={() => onSelect(trainer)}
      className={`
        relative group cursor-pointer overflow-hidden rounded-2xl border-2 transition-all duration-300
        hover:shadow-2xl hover:-translate-y-1
        ${isSelected 
          ? 'border-blue-600 bg-white ring-4 ring-blue-100 shadow-xl scale-[1.02]' 
          : 'border-transparent bg-white shadow-md hover:border-blue-300'
        }
      `}
    >
      {/* Header / Banner de Color según especialidad */}
      <div className={`h-24 w-full flex items-center justify-center ${
        trainer.specialty === 'individual' ? 'bg-gradient-to-r from-blue-600 to-blue-400' :
        trainer.specialty === 'doubles' ? 'bg-gradient-to-r from-purple-600 to-indigo-500' :
        'bg-gradient-to-r from-emerald-500 to-teal-400'
      }`}>
        <div className="bg-white/20 backdrop-blur-md p-3 rounded-full shadow-lg mt-8">
           {/* Icono central actualizado a React Icons */}
           {trainer.specialty === 'individual' && <FiUser className="text-white w-8 h-8" />}
           {trainer.specialty === 'doubles' && <FiUsers className="text-white w-8 h-8" />}
           {trainer.specialty === 'hybrid' && <FiZap className="text-white w-8 h-8" />}
        </div>
      </div>

      <div className="pt-10 p-6 text-center space-y-4">
        {/* Nombre y Rol */}
        <div>
            <h3 className="text-xl font-bold text-gray-900 group-hover:text-blue-600 transition-colors">
            {trainer.name}
            </h3>
            <p className="text-sm font-medium text-gray-500 uppercase tracking-wide">
            {trainer.role}
            </p>
        </div>

        {/* Filosofía (Quote) */}
        <div className="relative p-4 bg-gray-50 rounded-xl italic text-gray-600 text-sm">
            <span className="absolute top-2 left-2 text-2xl text-gray-300 font-serif">"</span>
            {trainer.philosophy}
        </div>

        {/* Descripción corta */}
        <p className="text-gray-600 text-sm leading-relaxed">
            {trainer.description}
        </p>

        {/* Tags */}
        <div className="flex flex-wrap gap-2 justify-center pt-2">
            {trainer.tags.map(tag => (
                <span key={tag} className="px-2 py-1 bg-gray-100 text-gray-600 text-xs font-semibold rounded-md border border-gray-200">
                    #{tag}
                </span>
            ))}
        </div>

        {/* Botón de acción (Solo visual, la tarjeta es clickeable) */}
        <div className={`
            mt-4 w-full py-2 rounded-lg font-bold text-sm transition-colors
            ${isSelected ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-400 group-hover:bg-blue-50 group-hover:text-blue-600'}
        `}>
            {isSelected ? 'Seleccionado' : 'Elegir Entrenador'}
        </div>
      </div>
    </div>
  );
};

export default TrainerCard;