import { NextResponse } from "next/server";
import OpenAI from "openai";
import dbConnect from "@/app/lib/dbConnect";
import { Training } from "@/app/lib/models/Training";
import { Athlete } from "@/app/lib/models/Athlete";
import { TrainingBlock } from "@/app/lib/models/TrainingBlock";
import { trainers } from "@/app/lib/coaches/coaches";

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
      return NextResponse.json(
        { error: "Faltan datos requeridos (userId o trainerId)" },
        { status: 400 }
      );
    }

    // 1. Obtener datos del Entrenador seleccionado
    const selectedTrainer = trainers.find((t) => t.id === trainerId);
    if (!selectedTrainer) {
      return NextResponse.json(
        { error: "Entrenador no encontrado" },
        { status: 404 }
      );
    }

    // 2. Obtener la configuración del Training (Division, Mode, Ids de atletas)
    const training = await Training.findOne({
      $or: [{ ownerUserId: userId }, { partnerUserId: userId }],
      status: "active",
    });

    if (!training) {
      return NextResponse.json(
        { error: "No se encontró un plan de entrenamiento activo." },
        { status: 404 }
      );
    }

    // 3. Obtener perfiles de los Atletas
    const athlete1 = await Athlete.findById(training.athlete1Id);
    const athlete2 = training.athlete2Id
      ? await Athlete.findById(training.athlete2Id)
      : null;

    if (!athlete1) {
      return NextResponse.json(
        { error: "No se encontró el perfil del Atleta 1." },
        { status: 404 }
      );
    }

    // 4. Verificar si ya existe el Bloque
    const existingBlock = await TrainingBlock.findOne({
      userId,
      blockNumber: 1,
    });
    if (existingBlock) {
      return NextResponse.json(
        { message: "La semana 1 ya existe.", block: existingBlock },
        { status: 200 }
      );
    }

    // 5. Construir el Prompt para OpenAI con TU EJEMPLO
    const weaknesses1 = athlete1.weaknesses?.length
      ? athlete1.weaknesses.join(", ")
      : "None provided";

    const weaknesses2 = athlete2?.weaknesses?.length
      ? athlete2.weaknesses.join(", ")
      : "None provided";

    const systemInstruction = `
<SYSTEM_ROLE>
You are ${selectedTrainer.name}, a professional HYROX coach specialized in ${
      selectedTrainer.specialty
    }.
Your philosophy: "${selectedTrainer.philosophy}"
Your coaching style: ${selectedTrainer.aiPromptStyle}
</SYSTEM_ROLE>

<TASK>
Create a 1-week training microcycle (Week #1) for HYROX preparation.
Generate exactly 3 sessions.
</TASK>

<PRIORITIES>
1) Coach identity + philosophy + coaching style
2) Athlete profile (experience, goal, weaknesses)
3) Training context (division, mode)
4) Output formatting rules (JSON + HTML)
5) Template structure (formatting only)
</PRIORITIES>

<CONTEXT>
Division: ${training.division} (${training.gender})
Mode: ${training.mode || "N/A"}
</CONTEXT>

<ATHLETE_1>
Name: ${athlete1.username}
Experience: ${athlete1.experience}
Goal: ${athlete1.goal}
Weaknesses: ${weaknesses1}
</ATHLETE_1>

${
  athlete2
    ? `
<ATHLETE_2>
Partner: ${athlete2.username}
Weaknesses: ${weaknesses2}
</ATHLETE_2>
`
    : ""
}

<OUTPUT_FORMAT>
Return ONLY valid JSON (no markdown, no extra text).
JSON root must be an object with the key "weeks".
weeks[0].weekNumber must be 1.
weeks[0].sessions must contain exactly 3 items.

Session fields:
- title: string (must start with an emoji: 🏃 💪 ⚙️ 🧠 🧘 etc.)
- focus: string (short)
- details: string (HTML only)

HTML rules for details:
- Must be wrapped in <ul> ... </ul>
- Use only <li> items inside
- Use <b> for section headers (Warm-up, Main, Cool-down, Notes, etc.)
- Do NOT use markdown (** **), do NOT use plain text lists
</OUTPUT_FORMAT>

<TEMPLATE_STRUCTURE_ONLY>
The following is ONLY a structure reference. Do NOT copy content, exercises, sets/reps, distances, or session patterns.

{
  "weeks":[
    {
      "weekNumber":1,
      "sessions":[
        {
          "title":"🏃 Session 1: ...",
          "focus":"...",
          "details":"<ul><li><b>Warm-up:</b> ...</li><li><b>Main:</b> ...</li><li><b>Cool-down:</b> ...</li></ul>"
        }
      ]
    }
  ]
}
</TEMPLATE_STRUCTURE_ONLY>

<GENERATION_RULES>
- Adapt intensity to athlete experience: ${athlete1.experience}
- Address weaknesses explicitly with targeted work: ${weaknesses1}
- Keep sessions realistic for Week 1 (build base + controlled intensity)
${
  athlete2
    ? `- If mode is Doubles, include partner/synchro guidance in the HTML (still inside <ul><li>...).`
    : ""
}
- Ensure session variety: one run-focused, one strength-focused, one hybrid/HYROX-focused (unless coach style dictates a different split).
</GENERATION_RULES>
`;

    //     const systemInstruction = `
    //       You are ${
    //         selectedTrainer.name
    //       }, a professional Hyrox Coach specializing in ${
    //       selectedTrainer.specialty
    //     }.
    //       Your philosophy is: "${selectedTrainer.philosophy}".
    //       Your coaching style is: ${selectedTrainer.aiPromptStyle}.

    //       TASK: Create a 1-week training microcycle (Week #1) for Hyrox preparation.

    //       CONTEXT:
    //       - Division: ${training.division} (${training.gender})
    //       - Mode: ${training.mode || "N/A"}

    //       ATHLETE PROFILE:
    //       - Name: ${athlete1.username}
    //       - Experience: ${athlete1.experience}
    //       - Goal: ${athlete1.goal}
    //       - Weaknesses: ${athlete1.weaknesses?.join(
    //         ", "
    //       )} (FOCUS ON IMPROVING THESE)

    //       ${
    //         athlete2
    //           ? `- Partner: ${
    //               athlete2.username
    //             } (Weaknesses: ${athlete2.weaknesses?.join(", ")})`
    //           : ""
    //       }

    //       IMPORTANT - FORMATTING RULES:
    //       1. **Titles**: Must start with an emoji relevant to the session type (e.g., 🏃 for Run, 💪 for Strength, ⚙️ for Hybrid/Hyrox).
    //       2. **Details**: Must use HTML tags for formatting. Use <li> for list items and <b> for bold headers. Do NOT use markdown (**bold**) or plain text lists.
    //       3. **Structure**: Follow the exact JSON structure of the example below.

    //       IMPORTANT — TEMPLATE ONLY:
    // - The example is ONLY for JSON keys + HTML formatting.
    // - DO NOT copy any exercises, sets/reps, distances, or session patterns from the example.
    // - Build sessions from the coach philosophy/style + athlete weaknesses.
    //       TEMPLATE_STRUCTURE_ONLY:
    // {
    //   "weeks":[
    //     {
    //       "weekNumber":1,
    //       "sessions":[
    //         {
    //           "title":"🏃 Session 1: ...",
    //           "focus":"...",
    //           "details":"<ul><li><b>Warm-up:</b> ...</li><li><b>Main:</b> ...</li><li><b>Cool-down:</b> ...</li></ul>"
    //         }
    //       ]
    //     }
    //   ]
    // }

    //       INSTRUCTIONS FOR GENERATION:
    //       - Generate 3 sessions for Week 1.
    //       - Adapt intensity to experience level: ${athlete1.experience}.
    //       - Include specific work for weaknesses: ${athlete1.weaknesses?.join(
    //         ", "
    //       )}.
    //       - If Doubles, include synchro/partner details in the HTML.
    //     `;

    // 6. Llamar a OpenAI
    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { role: "system", content: systemInstruction },
        {
          role: "user",
          content:
            "Generate the JSON for Week 1 based on the profile and example provided.",
        },
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
      status: "active",
      weeks: generatedPlan.weeks,
    });

    return NextResponse.json(
      { success: true, block: newBlock },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Error generating block:", error);
    return NextResponse.json(
      { error: error.message || "Error generando el entrenamiento." },
      { status: 500 }
    );
  }
}
