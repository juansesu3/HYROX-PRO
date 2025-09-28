'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Step1AccountInfo } from '../components/register/Step1AccountInfo';
import { Step2CategorySelection } from '../components/register/Step2CategorySelection';
import { Step3AthleteProfile } from '../components/register/Step3AthleteProfile';
import { Step4ReviewAndSubmit } from '../components/register/Step4ReviewAndSubmit';
import StepIndicator from '../components/register/StepIndicator';
import { NavigationButtons } from '../components/register/NavigationButtons';

// Importa los componentes refactorizados

// Define el tipo para los datos del atleta
export interface AthleteData {
    username: string;
    age: string;
    weight: string;
    height: string;
    experience: 'beginner' | 'intermediate' | 'advanced' | 'pro';
    goal: 'finish' | 'time_goal' | 'competitive' | 'podium';
    targetTime: string;
    strengths: string[];
    weaknesses: string[];
}

// Define el tipo para el formulario completo
export interface FormData {
    email: string;
    password: string;
    confirmPassword: string;
    category: 'individual' | 'doubles';
    doublesType: 'men' | 'women' | 'mixed';
    athlete1: AthleteData;
    athlete2: AthleteData;
}


// --- MAIN PAGE COMPONENT ---
export default function RegisterPage() {
    const [currentStep, setCurrentStep] = useState(1);
    const [formData, setFormData] = useState<FormData>({
        email: '',
        password: '',
        confirmPassword: '',
        category: 'individual',
        doublesType: 'mixed',
        athlete1: { username: '', age: '', weight: '', height: '', experience: 'beginner', goal: 'finish', targetTime: '', strengths: [], weaknesses: [] },
        athlete2: { username: '', age: '', weight: '', height: '', experience: 'beginner', goal: 'finish', targetTime: '', strengths: [], weaknesses: [] },
    });
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();
    const totalSteps = 4;

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const setAthleteData = (athleteKey: 'athlete1' | 'athlete2', data: Partial<AthleteData>) => {
        setFormData(prev => ({
            ...prev,
            [athleteKey]: { ...prev[athleteKey], ...data }
        }));
    };

    const nextStep = () => {
        setError(null); // Reset error on each step attempt
        // Step 1 validation
        if (currentStep === 1) {
            if (!formData.email || !formData.password || !formData.confirmPassword) {
                setError('Por favor, completa todos los campos de la cuenta.');
                return;
            }
            if (formData.password !== formData.confirmPassword) {
                setError('Las contraseñas no coinciden.');
                return;
            }
        }
        // Step 3 validation
        if (currentStep === 3) {
            const { athlete1, athlete2, category } = formData;
            if (!athlete1.username || !athlete1.age || !athlete1.weight || !athlete1.height) {
                setError('Por favor, completa toda la información para el Atleta 1.');
                return;
            }
            if (category === 'doubles' && (!athlete2.username || !athlete2.age || !athlete2.weight || !athlete2.height)) {
                setError('Por favor, completa toda la información para el Atleta 2.');
                return;
            }
        }
        setCurrentStep(prev => Math.min(prev + 1, totalSteps));
    };

    const prevStep = () => {
        setCurrentStep(prev => Math.max(prev - 1, 1));
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (currentStep !== totalSteps) return;
    
        setIsLoading(true);
        setError(null);
        try {
            console.log('Final form data:', formData);
            const response = await fetch('/api/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });
            if (!response.ok) throw new Error('Failed to register.');
    
            await new Promise(resolve => setTimeout(resolve, 1500));
            router.push('/login');
        } catch (err: any) {
            setError(err.message || 'Ocurrió un error durante el registro.');
        } finally {
            setIsLoading(false);
        }
    };
    

    const renderStep = () => {
        switch (currentStep) {
            case 1:
                return <Step1AccountInfo formData={formData} handleChange={handleChange} />;
            case 2:
                return <Step2CategorySelection formData={formData} setFormData={setFormData} handleChange={handleChange} />;
            case 3:
                return <Step3AthleteProfile formData={formData} setAthleteData={setAthleteData} />;
            case 4:
                return <Step4ReviewAndSubmit formData={formData} isLoading={isLoading} />;
            default:
                return <Step1AccountInfo formData={formData} handleChange={handleChange} />;
        }
    }

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-100 font-sans">
            <div className="w-full max-w-3xl p-8 space-y-8 bg-white rounded-2xl shadow-lg my-10">
                <h1 className="text-4xl font-bold text-center text-gray-900">Registro de Atleta Hyrox</h1>
                <p className="text-center text-gray-600">Completa los siguientes pasos para crear tu perfil y plan de entrenamiento.</p>

                <StepIndicator currentStep={currentStep} />

                <form onSubmit={handleSubmit} className="space-y-6">
                    {error && <p className="text-sm text-red-600 text-center bg-red-50 p-3 rounded-md">{error}</p>}
                    {renderStep()}
                    <NavigationButtons currentStep={currentStep} totalSteps={totalSteps} prevStep={prevStep} nextStep={nextStep} />
                </form>

                <p className="text-sm text-center text-gray-600">
                    ¿Ya tienes una cuenta? <Link href="/login" className="font-medium text-blue-600 hover:underline">Inicia Sesión</Link>
                </p>
            </div>
        </div>
    );
}
