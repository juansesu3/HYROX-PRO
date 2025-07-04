'use client';
import React from 'react';
import ChatConversation from '@/app/components/ConversationChat';
import { useParams, useRouter } from 'next/navigation';

const mockChatsInfo = {
  '1': {
    agentId: '1',
    agentName: 'Coach de Nutrición',
    avatar: 'https://my-page-negiupp.s3.amazonaws.com/1751616049013.png',
  },
  '2': {
    agentId: '2',
    agentName: 'Coach Hyrox',
    avatar: 'https://my-page-negiupp.s3.amazonaws.com/1751616682237.png',
  },
};


export default function Page() {
  const { chatId } = useParams();
  const router = useRouter();

  const chatInfo = chatId && mockChatsInfo[chatId as keyof typeof mockChatsInfo] || null;

  return (
    <ChatConversation
    chatId={Array.isArray(chatId) ? chatId.join(',') : chatId || ''}
    onBack={() => router.push('/chat')}
    agentName={chatInfo?.agentName || 'Asistente de IA'}
    avatar={chatInfo?.avatar || 'https://placehold.co/40x40/0149aa/FFFFFF?text=AI'}
    agentId={chatInfo?.agentId || ''}
  />
  );
}
