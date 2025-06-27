// En app/api/generate-next-block/route.ts
import { NextResponse } from 'next/server';
import OpenAI from 'openai';
import dbConnect from '@/app/lib/dbConnect';
import { TrainingBlock, Comment } from '@/app/lib/models';
import { getServerSession } from "next-auth/next";

import authOptions from '@/app/lib/auth/auth-options';


const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ message: 'No autenticado. Por favor, inicie sesión.' }, { status: 401 });
    }
    const userId = session.user.id;

    await dbConnect();
    const body = await request.json();
    const { completedBlockNumber } = body;
    const nextBlockNumber = completedBlockNumber + 1;

    const existingBlock = await TrainingBlock.findOne({ userId, blockNumber: nextBlockNumber });
    if (existingBlock) {
      return NextResponse.json({ message: `El Bloque ${nextBlockNumber} ya existe.` }, { status: 409 });
    }

    const completedBlock = await TrainingBlock.findOne({ userId, blockNumber: completedBlockNumber });
    if (!completedBlock) {
      return NextResponse.json({ message: `No se encontró el bloque ${completedBlockNumber} para este usuario.` }, { status: 404 });
    }
    const comments = await Comment.find({ userId, blockNumber: completedBlockNumber }).sort({ weekIndex: 1, sessionIndex: 1 });

    let formattedComments = 'El atleta no dejó comentarios para este bloque.';
    if (comments.length > 0) {
      formattedComments = comments.map(c => 
        `Semana ${c.weekIndex + 1}, Sesión ${c.sessionIndex + 1}: "${c.comment}"`
      ).join('\n');
    }

    const systemPrompt = `
      Eres un director de programación de entrenamiento de élite para atletas de Hyrox. Tu tarea es diseñar un mesociclo completo de 4 semanas (Bloque ${nextBlockNumber}) basado en el rendimiento del bloque anterior.

      **FILOSOFÍA DE ENTRENAMIENTO:**
      - **Mesociclos (Bloques):** Cada bloque dura 4 semanas.
      - **Progresión (Semanas 1-3):** El volumen y/o la intensidad deben aumentar gradualmente.
      - **Descarga (Semana 4):** La 4ª semana es SIEMPRE una semana de descarga ("Deload"). Reduce el volumen y la intensidad (aprox. 50-60% de la semana 3).
      - **Nuevos Bloques:** Si la semana a generar es la 1ª de un nuevo bloque (ej. Semana 5), puedes introducir ligeras variaciones en los ejercicios.

      **PRINCIPIO CLAVE: SOBRECARGA PROGRESIVA:**
      - **Fácil:** Si el atleta encontró un ejercicio "fácil", incrementa la dificultad (ej. +5% de peso, +1 repetición, -15s de descanso, +10% de distancia).
      - **Difícil:** Si el atleta encontró un ejercicio "difícil", mantén la misma carga y repeticiones.
      - **Dolor:** Si un ejercicio causó "dolor", reemplázalo por una alternativa segura (ej. "Burpee Broad Jumps" -> "Kettlebell Swings").
      - **Sin comentarios:** Aplica una progresión estándar y muy ligera (ej. +2.5% de peso).

      **TU TAREA (IMPORTANTE):**
      Tu respuesta DEBE SER un objeto JSON válido. El objeto JSON debe contener una clave "weeks" con un array de 4 semanas. Asegúrate de que la salida sea solo el JSON, sin ningún texto adicional.
    `;

    const userPrompt = `
      **CONTEXTO DEL BLOQUE ${completedBlockNumber} COMPLETADO:**
      - Plan del Bloque ${completedBlockNumber}:
      ${JSON.stringify(completedBlock.weeks, null, 2)}

      - Resumen de Comentarios del Atleta para el Bloque ${completedBlockNumber}:
      ${formattedComments}
    `;

    const completion = await openai.chat.completions.create({
        model: "gpt-4o",
        response_format: { type: "json_object" },
        messages: [
            { "role": "system", "content": systemPrompt },
            { "role": "user", "content": userPrompt }
        ]
    });

    const jsonResponse = completion.choices[0]?.message?.content;
    if (!jsonResponse) throw new Error("La respuesta de OpenAI estaba vacía.");

    const newBlockData = JSON.parse(jsonResponse);

    const newBlock = new TrainingBlock({
      userId,
      blockNumber: nextBlockNumber,
      status: 'active',
      weeks: newBlockData.weeks 
    });
    await newBlock.save();

    return NextResponse.json({ message: `Bloque ${nextBlockNumber} generado con éxito`, newBlock });
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    console.error(error);
    return NextResponse.json({ message: 'Error al generar el bloque', error: error.message }, { status: 500 });
  }
}
