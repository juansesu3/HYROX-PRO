// src/app/api/onboarding/complete/route.ts
import { NextResponse } from 'next/server';
import mongoose from 'mongoose';

import dbConnect from '@/app/lib/dbConnect';
import { User } from '@/app/lib/models/User';
import { Athlete } from '@/app/lib/models/Athlete'; // 👈 ajusta la ruta si es distinta

interface AthletePayload {
  username: string;
  age: number | string;
  weight: number | string;
  height: number | string;
  experience: string;
  goal: string;
  targetTime?: string;
  strengths?: string[];
  weaknesses?: string[];
}

interface OnboardingPayload {
  userId: string;
  category: 'individual' | 'doubles';
  mode: 'same-device' | 'invite-partner';
  doublesType?: 'men' | 'women' | 'mixed';
  athlete1: AthletePayload;
  athlete2?: AthletePayload | null;
}

export async function POST(request: Request) {
  try {
    await dbConnect();

    const body = (await request.json()) as OnboardingPayload;
    const { userId, category, mode, doublesType, athlete1, athlete2 } = body;

    // --- Validaciones básicas ---

    if (!userId) {
      return NextResponse.json(
        { error: 'userId es obligatorio.' },
        { status: 400 }
      );
    }

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return NextResponse.json(
        { error: 'userId no es un ObjectId válido.' },
        { status: 400 }
      );
    }

    if (!category || !['individual', 'doubles'].includes(category)) {
      return NextResponse.json(
        { error: 'Categoría inválida.' },
        { status: 400 }
      );
    }

    if (!['same-device', 'invite-partner'].includes(mode)) {
      return NextResponse.json(
        { error: 'Modo inválido. Usa "same-device" o "invite-partner".' },
        { status: 400 }
      );
    }

    // Validar atleta1 (mínimo + campos required del schema)
    if (
      !athlete1?.username ||
      !athlete1.age ||
      !athlete1.weight ||
      !athlete1.height
    ) {
      return NextResponse.json(
        {
          error:
            'Atleta 1 debe tener al menos nombre, edad, peso y altura.',
        },
        { status: 400 }
      );
    }

    if (!athlete1.experience || !athlete1.goal) {
      return NextResponse.json(
        {
          error:
            'Atleta 1 debe incluir experiencia y objetivo.',
        },
        { status: 400 }
      );
    }

    // Validar atleta2 solo si es dobles + same-device
    if (category === 'doubles' && mode === 'same-device') {
      if (
        !athlete2 ||
        !athlete2.username ||
        !athlete2.age ||
        !athlete2.weight ||
        !athlete2.height
      ) {
        return NextResponse.json(
          {
            error:
              'Atleta 2 debe tener al menos nombre, edad, peso y altura.',
          },
          { status: 400 }
        );
      }

      if (!athlete2.experience || !athlete2.goal) {
        return NextResponse.json(
          {
            error:
              'Atleta 2 debe incluir experiencia y objetivo.',
          },
          { status: 400 }
        );
      }
    }

    // --- Verificar que el usuario existe ---

    const user = await User.findById(userId);
    if (!user) {
      return NextResponse.json(
        { error: 'Usuario no encontrado.' },
        { status: 404 }
      );
    }

    // --- Crear Atleta 1 ---

    await Athlete.create({
      ...athlete1,
      userId: user._id,
    });

    // --- Crear Atleta 2 si aplica (dobles + same-device) ---

    if (category === 'doubles' && mode === 'same-device' && athlete2) {
      await Athlete.create({
        ...athlete2,
        userId: user._id,
      });
    }

    // --- Actualizar User con categoría / tipo / estado del dúo ---

    user.category = category;

    if (category === 'doubles') {
      user.doublesType = doublesType || 'mixed';
      user.duoStatus =
        mode === 'same-device' ? 'complete' : 'pending_partner';
    } else {
      user.doublesType = undefined;
      user.duoStatus = 'single';
    }

    await user.save();

    return NextResponse.json(
      { success: true, message: 'Onboarding completado.' },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Onboarding complete error:', error);

    if (error?.errors) {
      Object.values(error.errors).forEach((err: any) =>
        console.error('Validation:', err.message)
      );
    }

    return NextResponse.json(
      { error: 'Error interno del servidor al completar el onboarding.' },
      { status: 500 }
    );
  }
}
