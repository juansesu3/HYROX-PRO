"use client";

import { useEffect, useMemo, useState } from "react";
import { useSession } from "next-auth/react";
import { signOut } from "next-auth/react";
import DOMPurify from "dompurify";

type ProfilePayload = {
  user: any;
  athletes: any[];
  trainings: any[];
  blocks: any[];
  sessionStatuses: any[];
  comments: any[];
  duoInvites: any[];
};

function keyStatus(b: number, w: number, s: number) {
  return `${b}-${w}-${s}`;
}

export default function UserProfile() {
  const { data: session, status } = useSession();
  const [data, setData] = useState<ProfilePayload | null>(null);
  const [activeTab, setActiveTab] = useState<
    "overview" | "blocks" | "athletes" | "comments" | "invites"
  >("overview");
  const [loading, setLoading] = useState(true);
  const [busyKey, setBusyKey] = useState<string | null>(null);

  // comment form state
  const [commentDraft, setCommentDraft] = useState("");
  const [commentTarget, setCommentTarget] = useState<{
    blockNumber: number;
    weekNumber: number;
    sessionIndex: number;
  } | null>(null);

  async function load() {
    setLoading(true);
    const res = await fetch("/api/profile", { cache: "no-store" });
    if (!res.ok) {
      setLoading(false);
      return;
    }
    const json = await res.json();
    setData(json);
    setLoading(false);
  }

  useEffect(() => {
    if (status === "authenticated") load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status]);

  const statusMap = useMemo(() => {
    const map = new Map<string, any>();
    if (!data?.sessionStatuses) return map;
    for (const st of data.sessionStatuses) {
      map.set(keyStatus(st.blockNumber, st.weekIndex, st.sessionIndex), st);
    }
    return map;
  }, [data]);

  const stats = useMemo(() => {
    const blocks = data?.blocks ?? [];
    let totalSessions = 0;
    let completedSessions = 0;

    for (const b of blocks) {
      (b.weeks ?? []).forEach((w: any, weekIndex: number) => {
        (w.sessions ?? []).forEach((_: any, sessionIndex: number) => {
          totalSessions += 1;
          const st = statusMap.get(keyStatus(b.blockNumber, weekIndex, sessionIndex));
          if (st?.completed) completedSessions += 1;
        });
      });
    }

    const activeBlock = blocks.find((b: any) => b.status === "active") ?? blocks[0];

    return {
      blocksCount: blocks.length,
      trainingsCount: (data?.trainings ?? []).length,
      athletesCount: (data?.athletes ?? []).length,
      commentsCount: (data?.comments ?? []).length,
      invitesCount: (data?.duoInvites ?? []).length,
      totalSessions,
      completedSessions,
      progressPct: totalSessions ? Math.round((completedSessions / totalSessions) * 100) : 0,
      activeBlockNumber: activeBlock?.blockNumber ?? null,
    };
  }, [data, statusMap]);

  async function toggleSession(
    blockNumber: number,
    weekIndex: number,
    sessionIndex: number,
    nextCompleted: boolean
  ) {
    const k = keyStatus(blockNumber, weekIndex, sessionIndex);
    setBusyKey(k);

    const res = await fetch("/api/session-status", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ blockNumber, weekIndex, sessionIndex, completed: nextCompleted }),
    });

    setBusyKey(null);
    if (res.ok) await load();
  }

  async function submitComment() {
    if (!commentTarget) return;

    const payload = { ...commentTarget, comment: commentDraft };

    const res = await fetch("/api/comments", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (res.ok) {
      setCommentDraft("");
      setCommentTarget(null);
      await load();
      setActiveTab("comments");
    }
  }

  // Loading
  if (status === "loading" || loading) {
    return (
      <div className="mx-auto max-w-6xl px-6 py-10 text-slate-900 dark:text-slate-100">
        <div className="h-7 w-56 animate-pulse rounded bg-slate-200 dark:bg-slate-800" />
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-24 animate-pulse rounded-2xl bg-slate-100 dark:bg-slate-900/60" />
          ))}
        </div>
        <div className="mt-6 h-72 animate-pulse rounded-2xl bg-slate-100 dark:bg-slate-900/60" />
      </div>
    );
  }

  if (status === "unauthenticated") {
    return (
      <div className="mx-auto max-w-6xl px-6 py-10 text-slate-900 dark:text-slate-100">
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <p className="text-slate-700 dark:text-slate-300">
            Necesitas iniciar sesión para ver tu perfil.
          </p>
        </div>
      </div>
    );
  }

  const user = data?.user;
  const username = user?.username ?? (session?.user as any)?.username ?? "Usuario";
  const email = user?.email ?? session?.user?.email ?? "";

  return (
    <div className="mx-auto max-w-6xl mb-20 px-6 py-10 text-slate-900 dark:text-slate-100">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <div className="grid h-12 w-12 place-items-center rounded-2xl bg-slate-900 text-white text-lg font-black shadow-sm dark:bg-gradient-to-br dark:from-emerald-300 dark:via-lime-300 dark:to-cyan-300 dark:text-slate-950">
            {(username?.[0] ?? "U").toUpperCase()}
          </div>
          <div>
            <h1 className="text-2xl font-black text-slate-900 dark:text-slate-100">
              {username}
            </h1>
            <p className="text-sm text-slate-600 dark:text-slate-400">{email}</p>
          </div>
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => load()}
            className="
              rounded-xl border px-4 py-2 text-sm font-black shadow-sm transition
              border-slate-200 bg-white text-slate-900 hover:bg-slate-50
              dark:border-slate-800 dark:bg-slate-900 dark:text-slate-100 dark:hover:bg-slate-800/60
            "
          >
            Actualizar
          </button>

          <button
            onClick={() => signOut({ callbackUrl: "/" })}
            className="
              rounded-xl border px-4 py-2 text-sm font-black shadow-sm transition
              border-slate-200 bg-white text-slate-900 hover:bg-slate-50
              dark:border-slate-800 dark:bg-slate-900 dark:text-slate-100 dark:hover:bg-slate-800/60
            "
          >
            Cerrar sesión
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Stat
          title="Bloques"
          value={stats.blocksCount}
          subtitle={stats.activeBlockNumber ? `Activo: ${stats.activeBlockNumber}` : "—"}
        />
        <Stat
          title="Progreso"
          value={`${stats.progressPct}%`}
          subtitle={`${stats.completedSessions}/${stats.totalSessions} sesiones`}
        />
        <Stat title="Entrenos" value={stats.trainingsCount} subtitle="Individual / Doubles" />
        <Stat title="Atletas" value={stats.athletesCount} subtitle="Perfiles físicos" />
      </div>

      {/* Tabs */}
      <div className="mt-8 flex flex-wrap gap-2">
        <TabButton active={activeTab === "overview"} onClick={() => setActiveTab("overview")}>
          Overview
        </TabButton>
        <TabButton active={activeTab === "blocks"} onClick={() => setActiveTab("blocks")}>
          Bloques
        </TabButton>
        <TabButton active={activeTab === "athletes"} onClick={() => setActiveTab("athletes")}>
          Atletas
        </TabButton>
        <TabButton active={activeTab === "comments"} onClick={() => setActiveTab("comments")}>
          Comentarios
        </TabButton>
        <TabButton active={activeTab === "invites"} onClick={() => setActiveTab("invites")}>
          Invites
        </TabButton>
      </div>

      {/* Content */}
      <div
        className="
          mt-4 rounded-2xl border p-4 shadow-sm
          border-slate-200 bg-white
          dark:border-slate-800 dark:bg-slate-900
        "
      >
        {activeTab === "overview" && (
          <div className="grid gap-4 lg:grid-cols-2">
            <Card title="Resumen">
              <ul className="space-y-2 text-sm text-slate-700 dark:text-slate-300">
                <li>
                  • Sesiones completadas: <b className="text-slate-900 dark:text-slate-100">{stats.completedSessions}</b>{" "}
                  / {stats.totalSessions}
                </li>
                <li>
                  • Comentarios: <b className="text-slate-900 dark:text-slate-100">{stats.commentsCount}</b>
                </li>
                <li>
                  • Invites: <b className="text-slate-900 dark:text-slate-100">{stats.invitesCount}</b>
                </li>
              </ul>
            </Card>

            <Card title="Últimos comentarios">
              {(data?.comments ?? []).slice(0, 5).map((c: any) => (
                <div
                  key={c._id}
                  className="
                    mb-3 rounded-xl border p-3
                    border-slate-200 bg-slate-50
                    dark:border-slate-800 dark:bg-slate-950/40
                  "
                >
                  <div className="text-xs text-slate-500 dark:text-slate-400">
                    Bloque {c.blockNumber} · Semana {c.weekNumber} · Sesión {c.sessionIndex + 1}
                  </div>
                  <div className="mt-1 text-sm text-slate-800 dark:text-slate-100">{c.comment}</div>
                </div>
              ))}
              {(data?.comments ?? []).length === 0 && (
                <p className="text-sm text-slate-600 dark:text-slate-400">Aún no hay comentarios.</p>
              )}
            </Card>
          </div>
        )}

        {activeTab === "blocks" && (
          <div className="space-y-4">
            {(data?.blocks ?? []).map((b: any) => (
              <details
                key={b._id}
                className="
                  rounded-2xl border p-4
                  border-slate-200 bg-slate-50
                  dark:border-slate-800 dark:bg-slate-950/40
                "
              >
                <summary className="cursor-pointer list-none">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-base font-black text-slate-900 dark:text-slate-100">
                        Bloque {b.blockNumber}{" "}
                        <span
                          className="
                            ml-2 rounded-full px-2 py-0.5 text-xs font-black
                            bg-slate-900 text-white
                            dark:bg-emerald-300/10 dark:text-emerald-200 dark:border dark:border-emerald-300/20
                          "
                        >
                          {b.status}
                        </span>
                      </div>
                      <div className="text-sm text-slate-600 dark:text-slate-400">
                        {b.weeks?.length ?? 0} semanas
                      </div>
                    </div>
                    <span className="text-sm text-slate-500 dark:text-slate-400">Ver</span>
                  </div>
                </summary>

                <div className="mt-4 space-y-4">
                  {(b.weeks ?? []).map((w: any, weekIndex: number) => (
                    <div
                      key={`${b._id}-w${weekIndex}`}
                      className="
                        rounded-xl border p-3
                        border-slate-200 bg-white
                        dark:border-slate-800 dark:bg-slate-900
                      "
                    >
                      <div className="mb-3 text-sm font-black text-slate-900 dark:text-slate-100">
                        Semana {w.weekNumber}
                      </div>

                      <div className="space-y-2">
                        {(w.sessions ?? []).map((s: any, sessionIndex: number) => {
                          const st = statusMap.get(keyStatus(b.blockNumber, weekIndex, sessionIndex));
                          const completed = !!st?.completed;
                          const isBusy = busyKey === keyStatus(b.blockNumber, weekIndex, sessionIndex);

                          return (
                            <div
                              key={`${b._id}-w${weekIndex}-s${sessionIndex}`}
                              className="
                                rounded-xl border p-3
                                border-slate-200 bg-slate-50
                                dark:border-slate-800 dark:bg-slate-950/40
                              "
                            >
                              <div className="flex items-start justify-between gap-3">
                                <div className="min-w-0">
                                  <div className="text-sm font-black text-slate-900 dark:text-slate-100">
                                    {s.title}
                                  </div>
                                  <div className="text-xs text-slate-600 dark:text-slate-400">{s.focus}</div>
                                  <RichHtml html={s.details} />
                                </div>

                                <div className="flex flex-col items-end gap-2">
                                  <button
                                    disabled={isBusy}
                                    onClick={() =>
                                      toggleSession(b.blockNumber, weekIndex, sessionIndex, !completed)
                                    }
                                    className={`
                                      rounded-xl px-3 py-1.5 text-xs font-black border shadow-sm transition active:scale-[0.98]
                                      ${
                                        completed
                                          ? `
                                            border-slate-900 bg-slate-900 text-white hover:bg-slate-800
                                            dark:border-transparent dark:bg-gradient-to-r dark:from-emerald-400 dark:via-lime-400 dark:to-cyan-300 dark:text-slate-950 dark:hover:opacity-95
                                          `
                                          : `
                                            border-slate-200 bg-white text-slate-900 hover:bg-slate-100
                                            dark:border-slate-800 dark:bg-slate-900 dark:text-slate-100 dark:hover:bg-slate-800/60
                                          `
                                      }
                                    `}
                                  >
                                    {isBusy ? "..." : completed ? "✅ Completada" : "Marcar"}
                                  </button>

                                  <button
                                    onClick={() => {
                                      setCommentTarget({
                                        blockNumber: b.blockNumber,
                                        weekNumber: w.weekNumber,
                                        sessionIndex,
                                      });
                                      setCommentDraft("");
                                    }}
                                    className="
                                      rounded-xl border px-3 py-1.5 text-xs font-black shadow-sm transition active:scale-[0.98]
                                      border-slate-200 bg-white text-slate-900 hover:bg-slate-100
                                      dark:border-slate-800 dark:bg-slate-900 dark:text-slate-100 dark:hover:bg-slate-800/60
                                    "
                                  >
                                    💬 Comentar
                                  </button>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              </details>
            ))}

            {(data?.blocks ?? []).length === 0 && (
              <p className="text-sm text-slate-600 dark:text-slate-400">No tienes bloques aún.</p>
            )}
          </div>
        )}

        {activeTab === "athletes" && (
          <div className="grid gap-4 md:grid-cols-2">
            {(data?.athletes ?? []).map((a: any) => (
              <div
                key={a._id}
                className="
                  rounded-2xl border p-4
                  border-slate-200 bg-slate-50
                  dark:border-slate-800 dark:bg-slate-950/40
                "
              >
                <div className="text-base font-black text-slate-900 dark:text-slate-100">{a.username}</div>
                <div className="mt-2 grid grid-cols-2 gap-2 text-sm text-slate-700 dark:text-slate-300">
                  <div>
                    Género: <b className="text-slate-900 dark:text-slate-100">{a.gender}</b>
                  </div>
                  <div>
                    Edad: <b className="text-slate-900 dark:text-slate-100">{a.age}</b>
                  </div>
                  <div>
                    Peso: <b className="text-slate-900 dark:text-slate-100">{a.weight}</b>
                  </div>
                  <div>
                    Altura: <b className="text-slate-900 dark:text-slate-100">{a.height}</b>
                  </div>
                </div>
                <div className="mt-3 text-sm text-slate-700 dark:text-slate-300">
                  <div>
                    <span className="text-slate-500 dark:text-slate-400">Objetivo:</span> {a.goal}
                  </div>
                  <div className="mt-1">
                    <span className="text-slate-500 dark:text-slate-400">Experiencia:</span> {a.experience}
                  </div>
                </div>
              </div>
            ))}
            {(data?.athletes ?? []).length === 0 && (
              <p className="text-sm text-slate-600 dark:text-slate-400">No hay atletas creados.</p>
            )}
          </div>
        )}

        {activeTab === "comments" && (
          <div className="space-y-3">
            {(data?.comments ?? []).map((c: any) => (
              <div
                key={c._id}
                className="
                  rounded-2xl border p-4
                  border-slate-200 bg-slate-50
                  dark:border-slate-800 dark:bg-slate-950/40
                "
              >
                <div className="text-xs text-slate-500 dark:text-slate-400">
                  Bloque {c.blockNumber} · Semana {c.weekNumber} · Sesión {c.sessionIndex + 1}
                </div>
                <div className="mt-2 text-sm text-slate-800 dark:text-slate-100">{c.comment}</div>
                {typeof c.rating === "number" && (
                  <div className="mt-2 text-xs text-slate-500 dark:text-slate-400">
                    Rating: {c.rating}/10
                  </div>
                )}
              </div>
            ))}
            {(data?.comments ?? []).length === 0 && (
              <p className="text-sm text-slate-600 dark:text-slate-400">Aún no hay comentarios.</p>
            )}
          </div>
        )}

        {activeTab === "invites" && (
          <div className="space-y-3">
            {(data?.duoInvites ?? []).map((i: any) => (
              <div
                key={i._id}
                className="
                  rounded-2xl border p-4
                  border-slate-200 bg-slate-50
                  dark:border-slate-800 dark:bg-slate-950/40
                "
              >
                <div className="text-sm font-black text-slate-900 dark:text-slate-100">Invite</div>
                <div className="mt-2 text-sm text-slate-700 dark:text-slate-300">
                  Status: <b className="text-slate-900 dark:text-slate-100">{i.status}</b>
                </div>
                <div className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                  Expira: {i.expiresAt ? new Date(i.expiresAt).toLocaleString() : "—"}
                </div>
              </div>
            ))}
            {(data?.duoInvites ?? []).length === 0 && (
              <p className="text-sm text-slate-600 dark:text-slate-400">No hay invites.</p>
            )}
          </div>
        )}
      </div>

      {/* Comment modal */}
      {commentTarget && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/50 p-4">
          <div className="w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-4 shadow-lg dark:border-slate-800 dark:bg-slate-900">
            <div className="text-base font-black text-slate-900 dark:text-slate-100">
              Añadir comentario
            </div>
            <div className="mt-1 text-sm text-slate-600 dark:text-slate-400">
              Bloque {commentTarget.blockNumber} · Semana {commentTarget.weekNumber} · Sesión{" "}
              {commentTarget.sessionIndex + 1}
            </div>

            <textarea
              value={commentDraft}
              onChange={(e) => setCommentDraft(e.target.value)}
              rows={5}
              className="
                mt-4 w-full rounded-xl border p-3 text-sm outline-none transition
                border-slate-200 bg-white text-slate-900
                focus:ring-2 focus:ring-slate-300 focus:border-transparent
                dark:border-slate-800 dark:bg-slate-950/40 dark:text-slate-100 dark:focus:ring-2 dark:focus:ring-emerald-300/40
              "
              placeholder="¿Cómo te fue? ¿Qué ajustarías? ¿Qué aprendiste?"
            />

            <div className="mt-4 flex justify-end gap-2">
              <button
                onClick={() => setCommentTarget(null)}
                className="
                  rounded-xl border px-4 py-2 text-sm font-black shadow-sm transition active:scale-[0.98]
                  border-slate-200 bg-white text-slate-900 hover:bg-slate-50
                  dark:border-slate-800 dark:bg-slate-900 dark:text-slate-100 dark:hover:bg-slate-800/60
                "
              >
                Cancelar
              </button>
              <button
                onClick={submitComment}
                disabled={commentDraft.trim().length === 0}
                className="
                  rounded-xl px-4 py-2 text-sm font-black shadow-sm transition active:scale-[0.98] disabled:opacity-50
                  bg-slate-900 text-white hover:bg-slate-800 border border-slate-900
                  dark:border-transparent dark:bg-gradient-to-r dark:from-emerald-400 dark:via-lime-400 dark:to-cyan-300 dark:text-slate-950 dark:hover:opacity-95
                "
              >
                Guardar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function Stat({ title, value, subtitle }: { title: string; value: any; subtitle?: string }) {
  return (
    <div
      className="
        relative overflow-hidden rounded-2xl border p-4 shadow-sm
        border-slate-200 bg-white
        dark:border-slate-800 dark:bg-slate-900
      "
    >
      <div className="pointer-events-none absolute -top-10 -right-10 h-24 w-24 rounded-full bg-blue-500/10 blur-2xl dark:bg-emerald-400/12" />
      <div className="text-sm font-semibold text-slate-600 dark:text-slate-400">{title}</div>
      <div className="mt-1 text-2xl font-black text-slate-900 dark:text-slate-100">{value}</div>
      {subtitle ? <div className="mt-1 text-xs text-slate-500 dark:text-slate-400">{subtitle}</div> : null}
    </div>
  );
}

function TabButton({ active, onClick, children }: any) {
  return (
    <button
      onClick={onClick}
      className={`
        rounded-xl border px-4 py-2 text-sm font-black shadow-sm transition active:scale-[0.98]
        ${active
          ? `
            border-transparent text-white
            bg-blue-600 hover:bg-blue-700
            dark:bg-gradient-to-r dark:from-emerald-400 dark:via-lime-400 dark:to-cyan-300 dark:text-slate-950 dark:hover:opacity-95
          `
          : `
            border-slate-200 bg-white text-slate-700 hover:bg-slate-50
            dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800/60
          `
        }
      `}
    >
      {children}
    </button>
  );
}

function Card({ title, children }: { title: string; children: any }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <div className="text-base font-black text-slate-900 dark:text-slate-100">{title}</div>
      <div className="mt-3 text-slate-700 dark:text-slate-300">{children}</div>
    </div>
  );
}

/* ---------------- RichHtml (sanitized) ---------------- */

function normalizeDetails(html: string) {
  const t = (html ?? "").trim();
  if (/^<li[\s>]/i.test(t) && !/<(ul|ol)[\s>]/i.test(t)) return `<ul>${t}</ul>`;
  return t;
}

export function RichHtml({ html }: { html: string }) {
  const safeHtml = useMemo(() => {
    const normalized = normalizeDetails(html);
    return DOMPurify.sanitize(normalized, { USE_PROFILES: { html: true } });
  }, [html]);

  return (
    <div
      className={[
        "mt-2 text-sm text-slate-700 dark:text-slate-200",
        // estilos para elementos HTML
        "[&_ul]:list-disc [&_ul]:pl-5 [&_ul]:my-2 [&_ul]:space-y-1",
        "[&_ol]:list-decimal [&_ol]:pl-5 [&_ol]:my-2 [&_ol]:space-y-1",
        "[&_li]:leading-relaxed",
        "[&_p]:my-2",
        "[&_strong]:text-slate-900 dark:[&_strong]:text-slate-100",
        "[&_a]:text-blue-700 [&_a]:underline hover:[&_a]:text-blue-800 dark:[&_a]:text-emerald-300 dark:hover:[&_a]:text-emerald-200",
        "[&_code]:px-1 [&_code]:py-0.5 [&_code]:rounded",
        "[&_code]:bg-slate-100 dark:[&_code]:bg-slate-800/60",
        "dark:[&_code]:text-slate-100",
      ].join(" ")}
      dangerouslySetInnerHTML={{ __html: safeHtml }}
    />
  );
}
