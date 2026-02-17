'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { IoChevronBackOutline, IoSend, IoMicOutline, IoAttachOutline } from 'react-icons/io5';
import Image from 'next/image';
import Link from 'next/link';

interface ChatConversationProps {
    chatId: string;
    onBack: () => void;
    agentName: string;
    avatar: string;
    agentId: string;  // <-- Nuevo!
}


const mockChats: Record<string, { id: string; sender: string; text: string; timestamp: string }[]> = {
    '1': [
        { id: 'm1', sender: 'agent', text: '¡Hola soy tu Coach de Nutrición!', timestamp: '10:30 AM' },
        { id: 'm2', sender: 'user', text: '¿Qué puedo cenar hoy?', timestamp: '10:31 AM' },
        { id: 'm3', sender: 'agent', text: 'Te envié algunas recetas saludables para esta semana.', timestamp: '10:32 AM' },
    ],
    '2': [
        { id: 'm1', sender: 'agent', text: '¡Hola soy tu Coach Hyrox!', timestamp: '10:30 AM' },
        { id: 'm2', sender: 'user', text: '¿Cuál es mi rutina de hoy?', timestamp: '10:31 AM' },
        {
            id: 'm3', sender: 'agent',
            text: `⚙️ Hoy tienes un entrenamiento híbrido enfocado en resistencia a la fatiga.

Principal: 4 rondas por tiempo de:
- 600m carrera (Ritmo B)
- 20 Wall Balls (Hombres: 6kg, Mujeres: 4kg)
Descanso: 90 segundos entre rondas.

Recuerda mantener un ritmo constante y concentrarte en la técnica para evitar lesiones. ¡Vamos con todo, tú puedes! 💪🔥`,
            timestamp: '10:32 AM'
        },
        { id: 'm4', sender: 'agent', text: 'Recuerda hidratarte 💧 bien después de tu rutina.', timestamp: '10:30 AM' },
    ],
};


const messageVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.3 } },
    exit: { opacity: 0, y: -20, transition: { duration: 0.2 } },
};

export default function ChatConversation({ chatId, onBack, agentName, avatar, agentId }: ChatConversationProps) {
    const [messages, setMessages] = useState(mockChats[chatId as keyof typeof mockChats] || []);
    const [inputMessage, setInputMessage] = useState('');
    const messagesEndRef = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const simulateAgentResponse = (userMessage: string) => {
        const lowerCaseMessage = userMessage.toLowerCase();
        let agentResponse = 'Lo siento, no entendí tu pregunta. ¿Podrías reformularla?';

        if (lowerCaseMessage.includes('hola') || lowerCaseMessage.includes('saludos')) {
            agentResponse = '¡Hola! 👋 ¿Cómo puedo ayudarte hoy?';
        } else if (lowerCaseMessage.includes('clima')) {
            agentResponse = 'Para el clima, necesito saber la ciudad y el día. 🌤️ ¿Me puedes dar más detalles?';
        } else if (lowerCaseMessage.includes('gracias')) {
            agentResponse = '¡De nada! 😊 Estoy aquí para ayudarte siempre.';
        } else if (lowerCaseMessage.includes('hora')) {
            const now = new Date();
            agentResponse = `La hora actual es ${now.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}. ⏰`;
        }

        setTimeout(() => {
            setMessages((prev) => [
                ...prev,
                {
                    id: `m${prev.length + 1}`,
                    sender: 'agent',
                    text: agentResponse,
                    timestamp: new Date().toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' }),
                },
            ]);
        }, 1000);
    };

    const handleSendMessage = (e: React.FormEvent) => {
        e.preventDefault();
        if (inputMessage.trim()) {
            const newMessage = {
                id: `m${messages.length + 1}`,
                sender: 'user',
                text: inputMessage.trim(),
                timestamp: new Date().toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' }),
            };
            setMessages((prev) => [...prev, newMessage]);
            simulateAgentResponse(inputMessage.trim());
            setInputMessage('');
        }
    };

    return (
        <div className="flex h-screen w-full flex-col bg-white pb-14">
            {/* Header */}
            <div
                className="flex items-center p-4 text-white shadow-md"
                style={{ backgroundColor: '#0149aa' }}
            >
                <motion.button
                    onClick={onBack}
                    className="mr-3 rounded-full p-2 hover:opacity-80"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    style={{ color: '#99ff07' }}
                >
                    <IoChevronBackOutline size={24} />
                </motion.button>
                <Link href={`/chat/profile-coach/${agentId}`} className="flex items-center">
                    <Image
                        width={100}
                        height={100}
                        src={avatar}
                        alt={`${agentName} avatar`}
                        className="mr-3 h-10 w-10 rounded-full object-cover shadow-sm"
                    />
                    <div className="flex-1">
                        <h2 className="text-xl font-semibold" style={{ color: '#ffffff' }}>
                            {agentName}
                        </h2>
                        <p className="text-sm" style={{ color: '#99ff07' }}>
                            Online
                        </p>
                    </div>
                </Link>
            </div>

            {/* Mensajes */}
            <div className="flex-1 overflow-y-auto p-4 pb-24">
                <AnimatePresence>
                    {messages.map((message) => (
                        <motion.div
                            key={message.id}
                            className={`mb-3 flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                            variants={messageVariants}
                            initial="hidden"
                            animate="visible"
                            exit="exit"
                        >
                            <div
                                className={`max-w-[80%] rounded-xl p-3 shadow-sm`}
                                style={{
                                    backgroundColor: message.sender === 'user' ? '#0149aa' : '#f3f4f6',
                                    color: message.sender === 'user' ? '#ffffff' : '#111828',
                                    borderTopRightRadius: message.sender === 'user' ? '0px' : '12px',
                                    borderTopLeftRadius: message.sender !== 'user' ? '0px' : '12px',
                                }}
                            >
                                <p className="text-sm">{message.text}</p>
                                <span
                                    className="mt-1 block text-right text-xs"
                                    style={{ color: message.sender === 'user' ? '#99ff07' : '#6b7280' }}
                                >
                                    {message.timestamp}
                                </span>
                            </div>
                        </motion.div>
                    ))}
                </AnimatePresence>
                <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <form
                onSubmit={handleSendMessage}
                className="flex items-center space-x-2 border-t border-gray-200 bg-white p-3 mb-4
             sm:space-x-3 sm:p-4"
            >
                <motion.button
                    type="button"
                    className="rounded-full p-1 hover:bg-gray-100
               w-8 h-8 flex items-center justify-center"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    style={{ color: '#0149aa' }}
                    aria-label="Adjuntar archivo"
                >
                    <IoAttachOutline size={18} />
                </motion.button>

                <motion.button
                    type="button"
                    className="rounded-full p-1hover:bg-gray-100
               w-8 h-8 flex items-center justify-center"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    style={{ color: '#0149aa' }}
                    aria-label="Grabar voz"
                >
                    <IoMicOutline size={18} />
                </motion.button>

                <input
                    type="text"
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    placeholder="Escribe un mensaje..."
                    className="flex-grow rounded-full border border-gray-300 px-4 py-2
               text-[#111828]
               focus:border-[#0149aa] focus:ring-1 focus:ring-[#0149aa]
               placeholder:text-gray-400
               max-h-12
               sm:text-base"
                />

                <motion.button
                    type="submit"
                    className="rounded-full  text-white s hover:opacity-90
              flex items-center justify-center"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}

                    aria-label="Enviar mensaje"
                >
                    <IoSend size={20} color='blue' />
                </motion.button>
            </form>
        </div>
    );
}
