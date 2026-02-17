'use client';

import { useState, useEffect } from 'react';
import { Session } from '../lib/definitions';
import Swal from 'sweetalert2';
import { FcIdea } from 'react-icons/fc';
import { FiCheckCircle, FiMessageSquare } from 'react-icons/fi';

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
  type CommentItem = { comment: string; coachTip?: string };

  const [comments, setComments] = useState<CommentItem[]>([]);
  const [comment, setComment] = useState('');

  const [status, setStatus] = useState('');
  const [showCommentArea, setShowCommentArea] = useState(false);
  const [isLoadingComment, setIsLoadingComment] = useState(false);

  const [isCompleted, setIsCompleted] = useState(false);
  const [completedAt, setCompletedAt] = useState<Date | null>(null);
  const [isLoadingCompleted, setIsLoadingCompleted] = useState(false);

  // 👉 Traer todos los comentarios de la sesión
  useEffect(() => {
    const fetchComments = async () => {
      if (!showCommentArea) return;
      setIsLoadingComment(true);
      try {
        const response = await fetch(
          `/api/comments?blockNumber=${blockNumber}&weekIndex=${weekIndex}&sessionIndex=${sessionIndex}`
        );
        if (response.ok) {
          const data = await response.json();
          if (Array.isArray(data)) {
            setComments(data.map((c) => ({ comment: c.comment, coachTip: c.coachTip })));
          } else {
            setComments([]);
          }
        }
      } catch (error) {
        console.error('Error fetching comments:', error);
      } finally {
        setIsLoadingComment(false);
      }
    };

    fetchComments();
  }, [showCommentArea, blockNumber, weekIndex, sessionIndex]);

  // 👉 Traer estado de completado
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
            if (data.completedAt) setCompletedAt(new Date(data.completedAt));
          }
        }
      } catch (error) {
        console.error('Error fetching completion status:', error);
      }
    };

    fetchCompletionStatus();
  }, [blockNumber, weekIndex, sessionIndex]);

  // 👉 Guardar nuevo comentario
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

          // ✅ contexto para el tip
          sessionTitle: session.title,
          sessionFocus: session.focus,
          sessionDetails: session.details,
        }),
      });

      if (response.ok) {
        setComment('');
        setStatus('¡Guardado!');
        const data = await response.json();
        setComments((prev) => [
          { comment: data.data.comment, coachTip: data.data.coachTip },
          ...prev,
        ]);
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

  // 👉 Marcar sesión como completada
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

    if (!result.isConfirmed) return;

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
        if (result?.status?.completedAt) setCompletedAt(new Date(result.status.completedAt));

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
    <div
      className="
        relative overflow-hidden rounded-2xl border shadow-sm flex flex-col
        bg-white border-slate-200
        dark:bg-slate-900 dark:border-slate-800
      "
    >
      {/* sporty glow */}
      <div className="pointer-events-none absolute -top-16 -right-16 h-40 w-40 rounded-full bg-blue-500/10 blur-3xl dark:bg-blue-500/20" />
      <div className="pointer-events-none absolute -bottom-20 -left-16 h-48 w-48 rounded-full bg-emerald-400/10 blur-3xl dark:bg-emerald-400/20" />

      <div className="relative p-6 flex flex-col h-full">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h3 className="text-xl font-black text-slate-900 dark:text-slate-100 mb-1 line-clamp-2">
              {session.title}
            </h3>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              {session.focus}
            </p>
          </div>

          {isCompleted && (
            <span
              className="
                inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-black
                bg-emerald-50 text-emerald-700 border border-emerald-100
                dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-900/50
              "
            >
              <FiCheckCircle className="h-4 w-4" />
              Done
            </span>
          )}
        </div>

        {/* Details HTML */}
        <div
          className="
            mt-4 text-sm
            text-slate-700 dark:text-slate-200
            [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:space-y-2
            [&_li]:leading-relaxed
            [&_strong]:text-slate-900 dark:[&_strong]:text-slate-100
            [&_em]:text-slate-600 dark:[&_em]:text-slate-300
          "
          dangerouslySetInnerHTML={{ __html: session.details }}
        />

        <div className="mt-auto pt-5 border-t border-slate-200 dark:border-slate-800">
          {/* ✅ Botón completar sesión */}
          <div className="mb-4">
            {isCompleted ? (
              <div className="text-emerald-700 dark:text-emerald-300 font-semibold text-sm">
                ✅ Entreno completado
                {completedAt && (
                  <p className="text-slate-600 dark:text-slate-400 font-normal mt-1">
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
                className="
                  inline-flex items-center justify-center gap-2 rounded-xl px-3 py-2 text-sm font-black
                  border shadow-sm transition active:scale-[0.98] disabled:opacity-50
                  bg-emerald-600 text-white border-emerald-600 hover:bg-emerald-700
                  dark:bg-gradient-to-r dark:from-emerald-400 dark:via-lime-400 dark:to-cyan-300
                  dark:text-slate-950 dark:border-transparent dark:hover:opacity-95
                "
              >
                {isLoadingCompleted ? 'Guardando...' : 'Marcar como completado'}
              </button>
            )}
          </div>

          {/* Toggle comentarios */}
          <button
            onClick={() => setShowCommentArea(!showCommentArea)}
            className="
              w-full text-left text-sm font-black inline-flex items-center gap-2
              text-blue-700 hover:text-blue-800
              dark:text-emerald-300 dark:hover:text-emerald-200
              transition
            "
          >
            <FiMessageSquare className="h-4 w-4" />
            {showCommentArea ? 'Ocultar Comentarios' : 'Ver/Añadir Comentarios'}
          </button>

          {showCommentArea && (
            <div className="mt-3 animate-fade-in">
              {isLoadingComment ? (
                <p className="text-slate-600 dark:text-slate-400 text-sm">
                  Cargando comentarios...
                </p>
              ) : (
                <>
                  {comments.length > 0 && (
                    <ul className="mt-3 space-y-2">
                      {comments.map((c, i) => (
                        <li
                          key={i}
                          className="
                            rounded-xl border p-3 text-sm whitespace-pre-wrap
                            bg-slate-50 border-slate-200 text-slate-800
                            dark:bg-slate-950/40 dark:border-slate-800 dark:text-slate-100
                          "
                        >
                          <div>{c.comment}</div>

                          {c.coachTip && (
                            <div
                              className="
                                mt-3 rounded-xl border p-3 text-xs
                                bg-white border-slate-200 text-slate-700
                                dark:bg-slate-900 dark:border-slate-800 dark:text-slate-200
                              "
                            >
                              <div className="flex items-start gap-2">
                                <div className="mt-0.5">
                                  <FcIdea />
                                </div>
                                <div className="leading-relaxed">
                                  <strong className="text-slate-900 dark:text-slate-100">
                                    Tip Coach:
                                  </strong>{' '}
                                  {c.coachTip}
                                </div>
                              </div>
                            </div>
                          )}
                        </li>
                      ))}
                    </ul>
                  )}

                  {/* Form */}
                  <label
                    htmlFor={`comment-${blockNumber}-${weekIndex}-${sessionIndex}`}
                    className="mt-4 text-sm font-black text-slate-700 dark:text-slate-300 block mb-1"
                  >
                    Tus Notas:
                  </label>

                  <textarea
                    id={`comment-${blockNumber}-${weekIndex}-${sessionIndex}`}
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    className="
                      w-full rounded-xl border p-3 h-24 text-sm outline-none transition
                      bg-white border-slate-200 text-slate-900
                      focus:ring-2 focus:ring-blue-400/60 focus:border-transparent
                      dark:bg-slate-900 dark:border-slate-800 dark:text-slate-100
                      dark:focus:ring-2 dark:focus:ring-emerald-300/40
                      disabled:opacity-60
                    "
                    placeholder="¿Cómo te sentiste? ¿Qué pesos usaste?"
                    disabled={isCompleted}
                  />

                  <div className="flex justify-between items-center mt-3">
                    <button
                      onClick={handleSaveComment}
                      disabled={status === 'Guardando...' || isCompleted}
                      className="
                        inline-flex items-center justify-center rounded-xl px-4 py-2 text-sm font-black
                        border shadow-sm transition active:scale-[0.98] disabled:opacity-50
                        bg-orange-500 text-white border-orange-500 hover:bg-orange-600
                        dark:bg-gradient-to-r dark:from-orange-400 dark:via-amber-300 dark:to-yellow-300
                        dark:text-slate-950 dark:border-transparent dark:hover:opacity-95
                      "
                    >
                      Guardar
                    </button>

                    <span
                      className={`text-sm font-semibold transition-opacity duration-300 ease-in-out ${
                        status ? 'opacity-100' : 'opacity-0'
                      } text-emerald-700 dark:text-emerald-300`}
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
    </div>
  );
}
