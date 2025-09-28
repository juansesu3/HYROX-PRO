import authOptions from '@/app/lib/auth/auth-options';
import { trainers } from '@/app/lib/coaches/coaches';
import dbConnect from '@/app/lib/dbConnect';
import { Athlete, TrainingBlock } from '@/app/lib/models'; // 👈 modelo de perfil de atleta
import { getServerSession } from 'next-auth';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions

    );
    if (!session?.user?.id) {
      return NextResponse.json({ message: 'No autenticado. Por favor, inicie sesión.' }, { status: 401 });
    }
    const userId = session.user.id;

    await dbConnect();
    const body = await request.json();
    const { completedBlockNumber, coachId } = body;
    const nextBlockNumber = completedBlockNumber + 1;

    // Verificar coach
    const selectedCoach = trainers.find(c => c.id === coachId);
    if (!selectedCoach) {
      return NextResponse.json({ message: "Coach no encontrado." }, { status: 400 });
    }

    // Verificar si ya existe el siguiente bloque
    const existingBlock = await TrainingBlock.findOne({ userId, blockNumber: nextBlockNumber });
    if (existingBlock) {
      return NextResponse.json({ message: `El Bloque ${nextBlockNumber} ya existe.` }, { status: 409 });
    }

    // Obtener el bloque completado
    const completedBlock = await TrainingBlock.findOne({ userId, blockNumber: completedBlockNumber });
    if (!completedBlock) {
      return NextResponse.json({ message: `No se encontró el bloque ${completedBlockNumber} para este usuario.` }, { status: 404 });
    }

    // Obtener comentarios del atleta
    const comments = await Comment.find({ userId, blockNumber: completedBlockNumber }).sort({ weekIndex: 1, sessionIndex: 1 });
    let formattedComments = 'El atleta no dejó comentarios para este bloque.';
    if (comments.length > 0) {
      formattedComments = comments.map(c => 
        `Semana ${c.weekIndex + 1}, Sesión ${c.sessionIndex + 1}: "${c.comment}"`
      ).join('\n');
    }

    // Obtener perfil del atleta
    const athleteProfile = await Athlete.findOne({ userId });
    if (!athleteProfile) {
      return NextResponse.json({ message: "Perfil de atleta no encontrado." }, { status: 404 });
    }

    const systemPrompt = selectedCoach.prompt; // prompt específico del coach

    const userPrompt = `
      **PERFIL DEL ATLETA:**
      - Nombre: ${athleteProfile.username}
      - Edad: ${athleteProfile.age} años
      - Peso: ${athleteProfile.weight} kg
      - Altura: ${athleteProfile.height} cm
      - Experiencia: ${athleteProfile.experience}
      - Objetivo: ${athleteProfile.goal}
      - Tiempo objetivo: ${athleteProfile.targetTime || "No definido"}
      - Fortalezas: ${athleteProfile.strengths.join(', ')}
      - Debilidades: ${athleteProfile.weaknesses.join(', ')}

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
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt }
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
  } catch (error: any) {
    console.error(error);
    return NextResponse.json({ message: 'Error al generar el bloque', error: error.message }, { status: 500 });
  }
}
