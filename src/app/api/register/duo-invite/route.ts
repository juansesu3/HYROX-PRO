import { NextResponse } from 'next/server';
import crypto from 'crypto';
import mongoose from 'mongoose';
import dbConnect from '@/app/lib/dbConnect';
import { DuoInvite } from '@/app/lib/models/DuoInvite';
import { Training } from '@/app/lib/models/Training';

export async function POST(request: Request) {
  try {
    await dbConnect();

    const body = await request.json();
    const { trainingId } = body;

    // 1. Validaciones iniciales
    if (!trainingId) {
      return NextResponse.json(
        { error: 'trainingId es obligatorio.' },
        { status: 400 }
      );
    }

    if (!mongoose.Types.ObjectId.isValid(trainingId)) {
      return NextResponse.json(
        { error: 'trainingId no es válido.' },
        { status: 400 }
      );
    }

    // 2. Buscar el entrenamiento
    const training = await Training.findById(trainingId);

    if (!training) {
      return NextResponse.json(
        { error: 'Entrenamiento no encontrado.' },
        { status: 404 }
      );
    }

    // 🔍 LOG PARA DEPURACIÓN: Ver qué hay realmente en la BD
    console.log('🔍 Training encontrado:', {
      id: training._id,
      division: training.division,
      mode: training.mode,
      gender: training.gender
    });

    // 3. Validar que sea apto para invitación
    // Si training.division es undefined o 'individual', esto fallará.
    if (
      training.division !== 'doubles' ||
      training.mode !== 'invite-partner'
    ) {
      return NextResponse.json(
        {
          error: `Solo se pueden generar invitaciones para dobles/invite-partner. Encontrado: ${training.division} / ${training.mode || 'sin-modo'}`,
        },
        { status: 400 }
      );
    }

    // 4. Verificar si ya existe una invitación pendiente
    const existingPending = await DuoInvite.findOne({
      trainingId: training._id,
      status: 'pending',
    });

    if (existingPending) {
      // Si ya existe, devolvemos la misma para no generar basura
      const { origin } = new URL(request.url);
      return NextResponse.json(
        {
          inviteUrl: `${origin}/invite/duo/${existingPending.token}`,
          expiresAt: existingPending.expiresAt,
          token: existingPending.token,
          message: 'Recuperada invitación pendiente existente.'
        },
        { status: 200 }
      );
    }

    // 5. Crear nueva invitación
    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24h

    const invite = await DuoInvite.create({
      trainingId: training._id,
      userId: training.ownerUserId,
      token,
      status: 'pending',
      doublesType: training.gender,
      expiresAt,
    });

    const { origin } = new URL(request.url);
    const inviteUrl = `${origin}/invite/duo/${invite.token}`;

    return NextResponse.json(
      {
        inviteUrl,
        expiresAt: invite.expiresAt.toISOString(),
        token: invite.token,
      },
      { status: 201 }
    );

  } catch (error: any) {
    console.error('❌ Duo invite create error:', error);
    return NextResponse.json(
      { error: error.message || 'Error interno del servidor.' },
      { status: 500 }
    );
  }
}