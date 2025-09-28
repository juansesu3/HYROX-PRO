
/*
================================================================================
|                                                                              |
|            ARCHIVO: components/register/Step2CategorySelection.tsx           |
|                                                                              |
================================================================================
*/
import { FiUser, FiUsers } from 'react-icons/fi';
// import { FormData } from '@/app/register/page';

interface Step2CategorySelectionProps {
    formData: any; // Replace with Pick<FormData, 'category' | 'doublesType'>
    setFormData: (data: any) => void; // Replace with (data: Partial<FormData>) => void
    handleChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
}

export const Step2CategorySelection = ({ formData, setFormData, handleChange }: Step2CategorySelectionProps) => (
    <div className="space-y-6 animate-fade-in">
        <h2 className="text-2xl font-semibold text-gray-800 text-center">Elige tu Categoría</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div onClick={() => setFormData({ ...formData, category: 'individual' })} className={`p-6 border-2 rounded-lg cursor-pointer transition-all ${formData.category === 'individual' ? 'border-blue-600 bg-blue-50' : 'border-gray-300'}`}>
                <FiUser className="mx-auto mb-2 text-blue-600" size={32} />
                <h3 className="text-lg font-bold text-center">Individual</h3>
                <p className="text-sm text-center text-gray-600">Compite por tu cuenta.</p>
            </div>
            <div onClick={() => setFormData({ ...formData, category: 'doubles' })} className={`p-6 border-2 rounded-lg cursor-pointer transition-all ${formData.category === 'doubles' ? 'border-blue-600 bg-blue-50' : 'border-gray-300'}`}>
                <FiUsers className="mx-auto mb-2 text-blue-600" size={32} />
                <h3 className="text-lg font-bold text-center">Dobles</h3>
                <p className="text-sm text-center text-gray-600">Compite con un compañero.</p>
            </div>
        </div>
        {formData.category === 'doubles' && (
            <div className="pt-4 animate-fade-in">
                <label className="block text-sm font-medium text-gray-700 text-center mb-2">Tipo de Dobles</label>
                <select name="doublesType" value={formData.doublesType} onChange={handleChange} className="w-full max-w-xs mx-auto block px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500">
                    <option value="men">Hombre</option>
                    <option value="women">Mujer</option>
                    <option value="mixed">Mixto</option>
                </select>
            </div>
        )}
    </div>
);

// export default Step2CategorySelection; // Already exported above