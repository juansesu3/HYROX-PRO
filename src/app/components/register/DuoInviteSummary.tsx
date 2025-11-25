// src/app/components/register/DuoInviteSummary.tsx
'use client';

import React, { useEffect, useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';

interface DuoInviteSummaryProps {
    inviteUrl: string;
    expiresAt: string; // ISO string
    onContinue: () => void;
}

function formatRemaining(ms: number) {
    if (ms <= 0) return '00:00:00';
    const totalSeconds = Math.floor(ms / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    const pad = (n: number) => n.toString().padStart(2, '0');
    return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
}

export const DuoInviteSummary: React.FC<DuoInviteSummaryProps> = ({
    inviteUrl,
    expiresAt,
    onContinue,
}) => {
    const [remaining, setRemaining] = useState<string>(() => {
        const diff = new Date(expiresAt).getTime() - Date.now();
        return formatRemaining(diff);
    });

    useEffect(() => {
        const interval = setInterval(() => {
            const diff = new Date(expiresAt).getTime() - Date.now();
            setRemaining(formatRemaining(diff));
        }, 1000);

        return () => clearInterval(interval);
    }, [expiresAt]);

    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(inviteUrl);
        } catch (err) {
            console.error('Error al copiar enlace:', err);
        }
    };

    return (
        <div className="space-y-6 text-center animate-fade-in">
            <h2 className="text-2xl font-bold text-gray-900">
                ¡Tu enlace de invitación está listo! 🎯
            </h2>
            <p className="text-gray-600 max-w-xl mx-auto">
                Comparte este enlace o el código QR con tu compañero para que complete
                su registro. La invitación estará activa durante las próximas 24 horas.
            </p>

            {/* QR + link */}
            <div className="flex flex-col md:flex-row items-center justify-center gap-6 mt-4">
                <div className="p-4 bg-gray-50 rounded-xl border border-gray-200">
                    <QRCodeSVG value={inviteUrl} size={160} />
                </div>

                <div className="flex-1 space-y-3">
                    <div className="text-left md:text-center">
                        <p className="text-sm font-medium text-gray-700 mb-1">
                            Enlace de invitación
                        </p>
                        <div className="flex items-center gap-2">
                            <code className="flex-1 px-2 py-1 bg-gray-50 border border-gray-200 rounded text-xs overflow-x-auto">
                                {inviteUrl}
                            </code>
                            <button
                                type="button"
                                onClick={handleCopy}
                                className="px-3 py-1 text-xs font-medium text-white bg-blue-600 rounded hover:bg-blue-700"
                            >
                                Copiar
                            </button>
                        </div>
                    </div>

                    <div className="text-sm text-gray-600">
                        <span className="font-medium text-gray-800">
                            Tiempo restante:{' '}
                        </span>
                        <span className="font-mono">{remaining}</span>
                    </div>

                    <p className="text-xs text-gray-500">
                        Consejo: haz una captura de pantalla o guarda este enlace para
                        compartirlo fácilmente.
                    </p>
                </div>
            </div>

            <button
                type="button"
                onClick={onContinue}
                className="mt-6 px-6 py-2 rounded-md bg-blue-600 text-white text-sm font-medium hover:bg-blue-700"
            >
                Ir al inicio
            </button>
        </div>
    );
};
