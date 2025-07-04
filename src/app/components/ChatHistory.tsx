'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
    FiChevronDown,
    FiSearch,
} from 'react-icons/fi';
import Link from 'next/link';
import Image from 'next/image';

// Mock data for chat history
const mockChats = [
    {
        id: '1',
        agentName: 'Coach de Nutrición',

        lastMessage: 'Te envié algunas recetas saludables para esta semana.',
        timestamp: 'Ayer',
        unreadCount: 0,
        avatar: 'https://my-page-negiupp.s3.amazonaws.com/1751616049013.png',
    },
    {
        id: '2',
        agentName: 'Coach Hyrox',
        lastMessage: 'Recuerda hidratarte bien después de tu rutina.',
        timestamp: '25/06/2025',
        unreadCount: 1,
        avatar: 'https://my-page-negiupp.s3.amazonaws.com/1751616682237.png',
    },
];

// Animation variants for list items


export default function ChatHistory() {
    const [isOpen, setIsOpen] = useState(true);
    return (
        <div className="flex h-screen w-full flex-col bg-white">
            {/* Header */}
            <div
                className="sticky top-0 z-10 flex items-center justify-between p-4 shadow-md"
                style={{ backgroundColor: '#0149aa' }}
            >
                <h1 className="text-2xl font-bold" style={{ color: '#ffffff' }}>
                    Chats
                </h1>
                <div className="flex items-center space-x-4">
                    <div className="relative">
                        <input
                            type="text"
                            placeholder="Buscar chats..."
                            className="w-full rounded-full border border-blue-300 bg-blue-400 bg-opacity-50 py-2 pl-10 pr-4 text-white placeholder-blue-100 focus:border-white focus:outline-none focus:ring-1 focus:ring-white"
                        />
                        <FiSearch
                            className="absolute left-3 top-1/2 -translate-y-1/2"
                            size={20}
                            style={{ color: '#99ff07' }}
                        />
                    </div>
                </div>
            </div>

            {/* Banner desplegable */}
            <div className="bg-blue-50 border-b border-blue-100 text-blue-900">
                {/* Mensaje */}
                {isOpen && (
                    <div className="px-4 pt-3 pb-2 text-center text-sm">
                        Aquí encontrarás coaches profesionales listos para ayudarte a alcanzar tus metas de entrenamiento.
                    </div>
                )}

                {/* Flecha */}
                <div className="flex justify-center items-center p-1">
                    <button
                        onClick={() => setIsOpen(!isOpen)}
                        className="focus:outline-none"
                    >
                        <FiChevronDown
                            className={`h-5 w-5 transform transition-transform ${isOpen ? 'rotate-180' : ''}`}
                        />
                    </button>
                </div>
            </div>


            {/* Chat List */}
            <div className="flex-1 overflow-y-auto p-4">
                {mockChats.length === 0 ? (
                    <div className="flex h-full items-center justify-center text-gray-500">
                        <p>No hay chats aún. ¡Inicia una nueva conversación!</p>
                    </div>
                ) : (
                    <motion.div
                        initial="hidden"
                        animate="visible"
                        variants={{
                            visible: { transition: { staggerChildren: 0.1 } },
                        }}
                        className="space-y-3"
                    >
                        {mockChats.map((chat) => (
                            <Link
                                key={chat.id}
                                href={`/chat/${chat.id}`}
                                className="flex cursor-pointer items-center space-x-4 rounded-xl p-3 transition-colors duration-200 hover:bg-gray-100"
                            >
                                <Image
                                    width={200}
                                    height={200}
                                    src={chat.avatar}
                                    alt={`${chat.agentName} avatar`}
                                    className="h-12 w-12 rounded-full object-cover shadow-md"
                                />
                                <div className="flex-1 overflow-hidden">
                                    <div className="flex items-center justify-between">
                                        <h3
                                            className="truncate text-lg font-semibold"
                                            style={{ color: '#111828' }}
                                        >
                                            {chat.agentName}
                                        </h3>
                                        <span
                                            className="text-sm"
                                            style={{ color: '#6b7280' }}
                                        >
                                            {chat.timestamp}
                                        </span>
                                    </div>
                                    <p
                                        className="truncate text-sm"
                                        style={{ color: '#6b7280' }}
                                    >
                                        {chat.lastMessage}
                                    </p>
                                </div>
                                {chat.unreadCount > 0 && (
                                    <span
                                        className="flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold text-white"
                                        style={{ backgroundColor: '#99ff07', color: '#111828' }}
                                    >
                                        {chat.unreadCount}
                                    </span>
                                )}
                            </Link>
                        ))}
                    </motion.div>
                )}
            </div>
        </div>
    );
}
