import React from 'react';
import { Trainer } from '@/app/lib/coaches/coaches';
import { FiUser, FiUsers, FiZap, FiCheckCircle } from 'react-icons/fi';

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
        h-full flex flex-col /* 👈 Garantiza altura completa y distribución vertical */
        active:scale-[0.98] md:hover:-translate-y-1 md:hover:shadow-xl
        ${isSelected 
          ? 'border-blue-600 bg-white ring-2 ring-blue-100 shadow-xl z-10' // z-10 para que resalte
          : 'border-transparent bg-white shadow-sm hover:border-blue-300'
        }
      `}
    >
      {/* Header / Banner */}
      <div className={`h-24 w-full flex items-center justify-center shrink-0 ${
        trainer.specialty === 'individual' ? 'bg-gradient-to-r from-blue-600 to-blue-400' :
        trainer.specialty === 'doubles' ? 'bg-gradient-to-r from-purple-600 to-indigo-500' :
        'bg-gradient-to-r from-emerald-500 to-teal-400'
      }`}>
        <div className="bg-white/30 p-3 rounded-full shadow-sm mt-8 backdrop-blur-sm">
           {trainer.specialty === 'individual' && <FiUser className="text-white w-8 h-8" />}
           {trainer.specialty === 'doubles' && <FiUsers className="text-white w-8 h-8" />}
           {trainer.specialty === 'hybrid' && <FiZap className="text-white w-8 h-8" />}
        </div>
      </div>

      {/* Cuerpo */}
      <div className="pt-10 p-6 text-center flex flex-col flex-grow space-y-4">
        {/* Info Básica */}
        <div>
            <h3 className="text-xl font-bold text-gray-900 group-hover:text-blue-600 transition-colors line-clamp-1">
                {trainer.name}
            </h3>
            <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mt-1 line-clamp-1">
                {trainer.role}
            </p>
        </div>

        {/* Filosofía */}
        <div className="relative p-4 bg-gray-50 rounded-xl italic text-gray-600 text-sm border border-gray-100 min-h-[80px] flex items-center justify-center">
            <span className="text-blue-200 text-2xl absolute top-1 left-2 leading-none">❝</span>
            <p className="line-clamp-3">{trainer.philosophy}</p>
        </div>

        {/* Tags */}
        <div className="flex flex-wrap gap-2 justify-center pt-1">
            {trainer.tags.map(tag => (
                <span key={tag} className="px-2 py-1 bg-gray-100 text-gray-500 text-[10px] font-bold uppercase rounded-md border border-gray-200">
                    {tag}
                </span>
            ))}
        </div>

        {/* Espaciador para empujar el botón al final */}
        <div className="flex-grow"></div>

        {/* Botón de Acción Integrado */}
        <button className={`
            w-full py-3.5 rounded-xl font-bold text-sm transition-all mt-4 flex items-center justify-center gap-2
            ${isSelected 
                ? 'bg-green-600 text-white shadow-lg scale-[1.02] hover:bg-green-700 animate-pulse-once' 
                : 'bg-gray-100 text-gray-500 group-hover:bg-blue-50 group-hover:text-blue-600'}
        `}>
            {isSelected ? (
                <>
                    <span>Confirmar y Generar</span>
                    <FiCheckCircle className="w-4 h-4" />
                </>
            ) : (
                'Elegir Entrenador'
            )}
        </button>
      </div>
    </div>
  );
};

export default TrainerCard;