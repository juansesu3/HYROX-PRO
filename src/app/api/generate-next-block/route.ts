import { NextResponse } from 'next/server';
import OpenAI from 'openai';
import dbConnect from '@/app/lib/dbConnect';
import { Training } from '@/app/lib/models/Training';
import { Athlete } from '@/app/lib/models/Athlete';
import { TrainingBlock } from '@/app/lib/models/TrainingBlock';
import { Comment } from '@/app/lib/models/Comment';
import { trainers } from '@/app/lib/coaches/coaches';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: Request) {
  try {
    await dbConnect();
    const body = await request.json();
    const { userId, trainerId, completedBlockNumber } = body;

    if (!userId || !trainerId || completedBlockNumber === undefined) {
      return NextResponse.json({ error: 'Faltan datos requeridos.' }, { status: 400 });
    }

    const nextBlockNumber = completedBlockNumber + 1;

    // 1. Verificar entrenador
    const selectedTrainer = trainers.find(t => t.id === trainerId);
    if (!selectedTrainer) {
      return NextResponse.json({ error: 'Entrenador no encontrado.' }, { status: 404 });
    }

    // 2. Verificar si ya existe el siguiente bloque
    const existingBlock = await TrainingBlock.findOne({ userId, blockNumber: nextBlockNumber });
    if (existingBlock) {
      return NextResponse.json({ message: `La Semana ${nextBlockNumber} ya existe.`, block: existingBlock }, { status: 200 });
    }

    // 3. Obtener Configuración del Training (para saber atletas y modalidad)
    const training = await Training.findOne({
      $or: [{ ownerUserId: userId }, { partnerUserId: userId }],
      status: 'active'
    });

    if (!training) {
      return NextResponse.json({ error: 'Plan de entrenamiento no activo.' }, { status: 404 });
    }

    // 4. Obtener Perfiles de Atletas
    const athlete1 = await Athlete.findById(training.athlete1Id);
    const athlete2 = training.athlete2Id ? await Athlete.findById(training.athlete2Id) : null;

    // 5. Obtener Bloque Anterior (Contexto de lo que se hizo)
    const completedBlock = await TrainingBlock.findOne({ userId, blockNumber: completedBlockNumber });
    
    // 6. Obtener Comentarios del usuario sobre el bloque anterior
    // Buscamos comentarios asociados a este bloque
    const userComments = await Comment.find({ userId, blockNumber: completedBlockNumber });
    
    let feedbackSummary = "No feedback provided for the previous week.";
    if (userComments.length > 0) {
      feedbackSummary = userComments.map(c => 
        `Session ${c.sessionIndex + 1}: "${c.comment}" (Rating: ${c.rating || 'N/A'})`
      ).join('; ');
    }

    // 7. Construir el Prompt para OpenAI
    const systemInstruction = `
      You are ${selectedTrainer.name}, a professional Hyrox Coach (${selectedTrainer.specialty}).
      Your philosophy: "${selectedTrainer.philosophy}".
      Style: ${selectedTrainer.aiPromptStyle}.

      TASK: Create Week ${nextBlockNumber} (Microcycle) for Hyrox preparation.
      
      CONTEXT:
      - Division: ${training.division} (${training.gender})
      - Previous Week (${completedBlockNumber}) Content: ${JSON.stringify(completedBlock?.weeks[0]?.sessions.map((s:any) => s.title) || 'Unknown')}
      - USER FEEDBACK FROM PREVIOUS WEEK: "${feedbackSummary}"
      
      ATHLETE 1: ${athlete1?.username} (${athlete1?.experience}, Goal: ${athlete1?.goal}, Weakness: ${athlete1?.weaknesses?.join(', ')})
      ${athlete2 ? `ATHLETE 2: ${athlete2.username} (Weakness: ${athlete2.weaknesses?.join(', ')})` : ''}

      INSTRUCTIONS:
      1. Analyze the feedback. If they said it was "too hard", reduce intensity/volume. If "too easy", increase it.
      2. Design 3 sessions for Week ${nextBlockNumber}.
      3. Keep focusing on weaknesses but vary the stimulus from last week.
      4. IMPORTANT: Use the exact same JSON format, emojis in titles, and HTML tags in details (<li>, <b>) as before.
      
      OUTPUT JSON SCHEMA:
      {
        "weeks": [
          {
            "weekNumber": ${nextBlockNumber},
            "sessions": [
              { "title": "...", "focus": "...", "details": "..." }
            ]
          }
        ]
      }
    `;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { role: "system", content: systemInstruction },
        { role: "user", content: `Generate Week ${nextBlockNumber} based on feedback.` }
      ],
      response_format: { type: "json_object" },
    });

    const responseText = completion.choices[0].message.content;
    if (!responseText) throw new Error("No response from AI");
    
    const generatedPlan = JSON.parse(responseText);

    // 8. Guardar
    const newBlock = await TrainingBlock.create({
      userId,
      blockNumber: nextBlockNumber,
      status: 'active',
      weeks: generatedPlan.weeks
    });

    return NextResponse.json({ success: true, block: newBlock }, { status: 201 });

  } catch (error: any) {
    console.error('Error generating next block:', error);
    return NextResponse.json({ error: error.message || 'Error interno.' }, { status: 500 });
  }
}