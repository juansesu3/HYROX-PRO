'use client';

import React, { useState, useEffect } from 'react';
import { Session } from '../lib/definitions';
import Swal from 'sweetalert2';

interface SessionCardProps {
  session: Session;
  blockNumber: number;
  weekIndex: number;
  sessionIndex: number;
}

export default function SessionCard({
  session,
  blockNumber,
  weekIndex,
  sessionIndex,
}: SessionCardProps) {
  const [comment, setComment] = useState('');
  const [savedComment, setSavedComment] = useState('');
  const [status, setStatus] = useState('');
  const [showCommentArea, setShowCommentArea] = useState(false);
  const [isLoadingComment, setIsLoadingComment] = useState(false);

  const [isCompleted, setIsCompleted] = useState(false);
  const [completedAt, setCompletedAt] = useState<Date | null>(null);
  const [isLoadingCompleted, setIsLoadingCompleted] = useState(false);

  // 👉 Traer comentario
  useEffect(() => {
    const fetchComment = async () => {
      if (!showCommentArea) return;
      setIsLoadingComment(true);
      try {
        const response = await fetch(
          `/api/comments?blockNumber=${blockNumber}&weekIndex=${weekIndex}&sessionIndex=${sessionIndex}`
        );
        if (response.ok) {
          const data = await response.json();
          if (data && data.comment) {
            setSavedComment(data.comment);
          } else {
            setSavedComment('');
          }
        }
      } catch (error) {
        console.error('Error fetching comment:', error);
      } finally {
        setIsLoadingComment(false);
      }
    };

    fetchComment();
  }, [showCommentArea, blockNumber, weekIndex, sessionIndex]);

  // 👉 Traer estado de completado y fecha
  useEffect(() => {
    const fetchCompletionStatus = async () => {
      try {
        const response = await fetch(
          `/api/completion?blockNumber=${blockNumber}&weekIndex=${weekIndex}&sessionIndex=${sessionIndex}`
        );
        if (response.ok) {
          const data = await response.json();
          if (data && data.completed) {
            setIsCompleted(true);
            if (data.completedAt) {
              setCompletedAt(new Date(data.completedAt));
            }
          }
        }
      } catch (error) {
        console.error('Error fetching completion status:', error);
      }
    };

    fetchCompletionStatus();
  }, [blockNumber, weekIndex, sessionIndex]);

  const handleSaveComment = async () => {
    if (!comment.trim()) return;

    setStatus('Guardando...');
    try {
      const response = await fetch('/api/comments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          blockNumber,
          weekIndex,
          sessionIndex,
          comment,
        }),
      });

      if (response.ok) {
        setSavedComment(comment); // Mostrar el comentario recién guardado
        setComment(''); // Limpiar input
        setStatus('¡Guardado!');
      } else {
        const errorData = await response.json();
        setStatus(`Error: ${errorData.message}`);
      }
    } catch (error) {
      console.log(error);
      setStatus('Error de conexión.');
    } finally {
      setTimeout(() => setStatus(''), 3000);
    }
  };

  const handleCompleteSession = async () => {
    if (isCompleted) return;

    const result = await Swal.fire({
      title: '¿Completar sesión?',
      html: `
        <p>Esta acción <strong>no se puede deshacer</strong>.</p>
        <p>Una vez completada la sesión, <strong>no podrás agregar ni editar comentarios</strong>.</p>
        <p>¿Estás seguro de que quieres continuar?</p>
      `,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#16a34a',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Sí, completar',
      cancelButtonText: 'Cancelar',
      focusCancel: true,
    });

    if (!result.isConfirmed) {
      return; // El usuario canceló
    }

    setIsLoadingCompleted(true);

    try {
      const response = await fetch('/api/completion', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          blockNumber,
          weekIndex,
          sessionIndex,
          completed: true,
        }),
      });

      if (response.ok) {
        const result = await response.json();
        setIsCompleted(true);
        setStatus('¡Entreno completado!');
        if (result?.status?.completedAt) {
          setCompletedAt(new Date(result.status.completedAt));
        }

        await Swal.fire({
          title: '¡Listo!',
          text: 'La sesión fue marcada como completada y ya no podrás editar los comentarios.',
          icon: 'success',
          confirmButtonColor: '#16a34a',
        });
      } else {
        const errorData = await response.json();
        setStatus(`Error: ${errorData.message}`);
        await Swal.fire('Error', errorData.message || 'No se pudo completar.', 'error');
      }
    } catch (error) {
      console.error(error);
      setStatus('Error de conexión.');
      await Swal.fire('Error', 'Error de conexión.', 'error');
    } finally {
      setIsLoadingCompleted(false);
      setTimeout(() => setStatus(''), 3000);
    }
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-md flex flex-col">
      <h3 className="text-xl font-bold mb-3">{session.title}</h3>
      <p className="text-sm text-gray-500 mb-4">{session.focus}</p>
      <ul
        className="space-y-2 list-disc list-inside mb-4"
        dangerouslySetInnerHTML={{ __html: session.details }}
      />

      <div className="mt-auto pt-4 border-t border-gray-200">
        {/* ✅ Botón de completar entreno */}
        <div className="mb-4">
          {isCompleted ? (
            <div className="text-green-600 font-semibold text-sm">
              ✅ Entreno completado
              {completedAt && (
                <p className="text-gray-600 font-normal mt-1">
                  Completado el:{' '}
                  {completedAt.toLocaleString('es-ES', {
                    day: '2-digit',
                    month: '2-digit',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </p>
              )}
            </div>
          ) : (
            <button
              onClick={handleCompleteSession}
              disabled={isLoadingCompleted}
              className="bg-green-600 text-white text-sm font-bold py-1 px-3 rounded-md hover:bg-green-700 transition-colors disabled:opacity-50"
            >
              {isLoadingCompleted ? 'Guardando...' : 'Marcar como completado'}
            </button>
          )}
        </div>

        {/* Toggle comentarios */}
        <button
          onClick={() => setShowCommentArea(!showCommentArea)}
          className="text-blue-600 hover:text-blue-800 font-semibold text-sm mb-2 w-full text-left"
        >
          {showCommentArea ? 'Ocultar Comentarios' : 'Ver/Añadir Comentarios'}
        </button>

        {showCommentArea && (
          <div className="mt-2 animate-fade-in">
            {isLoadingComment ? (
              <p className="text-gray-500 text-sm">Cargando comentario...</p>
            ) : (
              <>
                {savedComment && (
                  <div className="mb-3 p-3 bg-gray-50 border border-gray-200 rounded-md text-sm text-gray-700 whitespace-pre-wrap">
                    <strong>Comentario guardado:</strong>
                    <p className="mt-1">{savedComment}</p>
                  </div>
                )}

                <label
                  htmlFor={`comment-${blockNumber}-${weekIndex}-${sessionIndex}`}
                  className="text-sm font-semibold text-gray-600 block mb-1"
                >
                  Tus Notas:
                </label>
                <textarea
                  id={`comment-${blockNumber}-${weekIndex}-${sessionIndex}`}
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-md h-24 focus:ring-2 focus:ring-[#007bff] focus:border-transparent"
                  placeholder="¿Cómo te sentiste? ¿Qué pesos usaste?"
                  disabled={isCompleted}
                />
                <div className="flex justify-between items-center mt-2">
                  <button
                    onClick={handleSaveComment}
                    className="bg-[#fd7e14] text-white text-sm font-bold py-1 px-3 rounded-md hover:bg-[#e46f12] transition-colors disabled:opacity-50"
                    disabled={status === 'Guardando...' || isCompleted}
                  >
                    Guardar
                  </button>
                  <span
                    className={`text-sm text-green-600 transition-opacity duration-300 ease-in-out ${
                      status ? 'opacity-100' : 'opacity-0'
                    }`}
                  >
                    {status}
                  </span>
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
