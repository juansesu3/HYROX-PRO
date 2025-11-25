import { NextResponse } from 'next/server';
import OpenAI from 'openai';
import dbConnect from '@/app/lib/dbConnect';
import { Training } from '@/app/lib/models/Training';
import { Athlete } from '@/app/lib/models/Athlete';
import { TrainingBlock } from '@/app/lib/models/TrainingBlock';
import { trainers } from '@/app/lib/coaches/coaches';

// Inicializar OpenAI
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: Request) {
  try {
    await dbConnect();
    const body = await request.json();
    const { userId, trainerId } = body;

    if (!userId || !trainerId) {
      return NextResponse.json({ error: 'Faltan datos requeridos (userId o trainerId)' }, { status: 400 });
    }

    // 1. Obtener datos del Entrenador seleccionado
    const selectedTrainer = trainers.find(t => t.id === trainerId);
    if (!selectedTrainer) {
      return NextResponse.json({ error: 'Entrenador no encontrado' }, { status: 404 });
    }

    // 2. Obtener la configuración del Training (Division, Mode, Ids de atletas)
    const training = await Training.findOne({
      $or: [{ ownerUserId: userId }, { partnerUserId: userId }],
      status: 'active'
    });

    if (!training) {
      return NextResponse.json({ error: 'No se encontró un plan de entrenamiento activo.' }, { status: 404 });
    }

    // 3. Obtener perfiles de los Atletas
    const athlete1 = await Athlete.findById(training.athlete1Id);
    const athlete2 = training.athlete2Id ? await Athlete.findById(training.athlete2Id) : null;

    if (!athlete1) {
      return NextResponse.json({ error: 'No se encontró el perfil del Atleta 1.' }, { status: 404 });
    }

    // 4. Verificar si ya existe el Bloque
    const existingBlock = await TrainingBlock.findOne({ userId, blockNumber: 1 });
    if (existingBlock) {
      return NextResponse.json({ message: 'La semana 1 ya existe.', block: existingBlock }, { status: 200 });
    }

    // 5. Construir el Prompt para OpenAI con TU EJEMPLO
    const systemInstruction = `
      You are ${selectedTrainer.name}, a professional Hyrox Coach specializing in ${selectedTrainer.specialty}.
      Your philosophy is: "${selectedTrainer.philosophy}".
      Your coaching style is: ${selectedTrainer.aiPromptStyle}.
      
      TASK: Create a 1-week training microcycle (Week #1) for Hyrox preparation.
      
      CONTEXT:
      - Division: ${training.division} (${training.gender})
      - Mode: ${training.mode || 'N/A'}
      
      ATHLETE PROFILE:
      - Name: ${athlete1.username}
      - Experience: ${athlete1.experience}
      - Goal: ${athlete1.goal}
      - Weaknesses: ${athlete1.weaknesses?.join(', ')} (FOCUS ON IMPROVING THESE)
      
      ${athlete2 ? `- Partner: ${athlete2.username} (Weaknesses: ${athlete2.weaknesses?.join(', ')})` : ''}

      IMPORTANT - FORMATTING RULES:
      1. **Titles**: Must start with an emoji relevant to the session type (e.g., 🏃 for Run, 💪 for Strength, ⚙️ for Hybrid/Hyrox).
      2. **Details**: Must use HTML tags for formatting. Use <li> for list items and <b> for bold headers. Do NOT use markdown (**bold**) or plain text lists.
      3. **Structure**: Follow the exact JSON structure of the example below.

      EXAMPLE OUTPUT (Follow this style strictly):
      {
        "weeks": [
          {
            "weekNumber": 1,
            "sessions": [
              { 
                "title": "🏃 Sesión 1: Carrera", 
                "focus": "Adaptación a intervalos.", 
                "details": "<li><b>Calentamiento:</b> 10 min trote suave (Ritmo C) + movilidad.</li><li><b>Principal:</b> 5 x 800m (Ritmo A). Descanso: 2'30\" trote suave.</li><li><b>Calma:</b> 10 min trote suave." 
              },
              { 
                "title": "💪 Sesión 2: Fuerza", 
                "focus": "Construcción de base.", 
                "details": "<li><b>A) Goblet Squat:</b> 4x10</li><li><b>B) Press Banca:</b> 4x10</li><li><b>C) Plancha:</b> 3x45s</li>" 
              },
              { 
                "title": "⚙️ Sesión 3: Híbrido", 
                "focus": "Resistencia a la fatiga.", 
                "details": "<li><b>Principal:</b> 4 Rondas por tiempo de:</li><li class=\"ml-4\">600m carrera</li><li class=\"ml-4\">20 Wall Balls</li><li>Descanso: 90s.</li>" 
              }
            ]
          }
        ]
      }

      INSTRUCTIONS FOR GENERATION:
      - Generate 3 sessions for Week 1.
      - Adapt intensity to experience level: ${athlete1.experience}.
      - Include specific work for weaknesses: ${athlete1.weaknesses?.join(', ')}.
      - If Doubles, include synchro/partner details in the HTML.
    `;

    // 6. Llamar a OpenAI
    const completion = await openai.chat.completions.create({
      model: "gpt-4o", 
      messages: [
        { role: "system", content: systemInstruction },
        { role: "user", content: "Generate the JSON for Week 1 based on the profile and example provided." }
      ],
      response_format: { type: "json_object" },
    });

    const responseText = completion.choices[0].message.content;
    if (!responseText) {
      throw new Error("No se recibió respuesta de OpenAI");
    }
    
    const generatedPlan = JSON.parse(responseText);

    // 7. Guardar en MongoDB
    const newBlock = await TrainingBlock.create({
      userId,
      blockNumber: 1,
      status: 'active',
      weeks: generatedPlan.weeks
    });

    return NextResponse.json({ success: true, block: newBlock }, { status: 201 });

  } catch (error: any) {
    console.error('Error generating block:', error);
    return NextResponse.json({ error: error.message || 'Error generando el entrenamiento.' }, { status: 500 });
  }
}