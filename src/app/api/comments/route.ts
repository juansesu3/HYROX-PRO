import { NextResponse } from "next/server";
import dbConnect from "@/app/lib/dbConnect";
import { Comment } from "@/app/lib/models";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/lib/auth/auth-options";
import OpenAI from "openai";

export const runtime = "nodejs"; // ✅ evita edge issues con SDK

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

function stripHtml(html: string) {
  return html?.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
}

async function generateCoachTip(input: {
  sessionTitle?: string;
  sessionFocus?: string;
  sessionDetails?: string;
  comment: string;
}) {
  const model = process.env.OPENAI_TIP_MODEL || "gpt-4o-mini"; // cambia si quieres (ej: gpt-5.2)
  const details = input.sessionDetails ? stripHtml(input.sessionDetails) : "";

  const prompt = `
Entreno:
- Título: ${input.sessionTitle ?? "N/A"}
- Focus: ${input.sessionFocus ?? "N/A"}
- Detalles: ${details || "N/A"}

Comentario del atleta:
"${input.comment}"

Dame un tip breve y accionable (1-2 frases), en español, centrado en técnica, progresión o recuperación.
Evita consejos médicos. Si falta info, haz una micro-suposición razonable sin inventar números.
`.trim();

  const resp = await openai.responses.create({
    model,
    instructions:
      "Eres un entrenador de fuerza y rendimiento. Respondes corto, práctico y específico.",
    input: prompt,
    max_output_tokens: 120,
  });

  return {
    tip: (resp.output_text || "").trim(),
    model,
  };
}

// --- GET: igual que lo tienes (solo asegúrate que el schema use weekIndex) ---
export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ message: "No autenticado" }, { status: 401 });
    }

    await dbConnect();

    const { searchParams } = new URL(request.url);
    const blockNumber = searchParams.get("blockNumber");
    const weekIndex = searchParams.get("weekIndex");
    const sessionIndex = searchParams.get("sessionIndex");

    if (!blockNumber || !weekIndex || !sessionIndex) {
      return NextResponse.json({ message: "Faltan parámetros" }, { status: 400 });
    }

    const comments = await Comment.find({
      userId: session.user.id,
      blockNumber: Number(blockNumber),
      weekIndex: Number(weekIndex),
      sessionIndex: Number(sessionIndex),
    }).sort({ createdAt: -1 });

    return NextResponse.json(comments);
  } catch (error) {
    console.error("Error al obtener comentarios:", error);
    return NextResponse.json({ message: "Error al obtener comentarios" }, { status: 500 });
  }
}

// --- POST: crea comentario + tip IA ---
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ message: "No autenticado" }, { status: 401 });
    }
    const userId = session.user.id;

    await dbConnect();
    const body = await request.json();

    const {
      blockNumber,
      weekIndex,
      sessionIndex,
      comment,
      sessionTitle,
      sessionFocus,
      sessionDetails,
    } = body;

    if (!comment?.trim()) {
      return NextResponse.json({ message: "El comentario no puede estar vacío." }, { status: 400 });
    }
    if (
      blockNumber === undefined ||
      weekIndex === undefined ||
      sessionIndex === undefined
    ) {
      return NextResponse.json({ message: "Faltan parámetros" }, { status: 400 });
    }

    // 1) Generar tip IA (si falla, igualmente guardamos el comentario)
    let coachTip = "";
    let coachTipModel = "";
    try {
      const ai = await generateCoachTip({
        sessionTitle,
        sessionFocus,
        sessionDetails,
        comment: comment.trim(),
      });
      coachTip = ai.tip;
      coachTipModel = ai.model;
    } catch (e) {
      console.error("Tip IA falló (se guardará sin tip):", e);
    }

    // 2) Guardar comentario + tip + snapshot
    const newComment = await Comment.create({
      userId,
      blockNumber: Number(blockNumber),
      weekIndex: Number(weekIndex),
      sessionIndex: Number(sessionIndex),
      comment: comment.trim(),

      coachTip: coachTip || undefined,
      coachTipModel: coachTipModel || undefined,
      coachTipCreatedAt: coachTip ? new Date() : undefined,

      sessionTitle,
      sessionFocus,
      sessionDetails,
    });

    return NextResponse.json(
      {
        message: coachTip ? "Comentario guardado con tip IA" : "Comentario guardado (sin tip IA)",
        data: newComment,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Error al guardar el comentario:", error);
    return NextResponse.json({ message: "Error al guardar", error: error.message }, { status: 500 });
  }
}
