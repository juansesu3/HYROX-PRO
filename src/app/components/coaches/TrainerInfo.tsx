import { Trainer } from "@/app/lib/coaches/coaches";

interface TrainerInfoProps {
  trainer: Trainer;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function TrainerInfo({ trainer, onConfirm, onCancel }: TrainerInfoProps) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl p-6 max-w-lg w-full">
        <h2 className="text-2xl font-bold mb-4">{trainer.name}</h2>
        <p className="text-gray-700 mb-4">{trainer.description}</p>
        <div className="mb-4">
          <h3 className="font-semibold text-lg">Método de Entrenamiento:</h3>
          <p className="text-gray-600">{trainer.methodology}</p>
        </div>
        <div className="flex justify-end gap-4">
          <button
            onClick={onCancel}
            className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
          >
            Cancelar
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Confirmar y Generar Plan
          </button>
        </div>
      </div>
    </div>
  );
}
