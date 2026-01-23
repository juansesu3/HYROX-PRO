import { NextRequest, NextResponse } from 'next/server';
import mongoose from 'mongoose';
import dbConnect from '@/app/lib/dbConnect';
import { DuoInvite } from '@/app/lib/models/DuoInvite';
import { User } from '@/app/lib/models/User';
import { Athlete } from '@/app/lib/models/Athlete';
import { Training } from '@/app/lib/models/Training';

type Params = { token: string };

// GET: validar invitación y mostrar info básica
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<Params> }
) {
  try {
    await dbConnect();

    const { token } = await params;

    const invite = await DuoInvite.findOne({ token });

    if (!invite) {
      return NextResponse.json(
        { error: 'Invitación no encontrada.' },
        { status: 404 }
      );
    }

    if (invite.expiresAt && invite.expiresAt < new Date()) {
      invite.status = 'expired';
      await invite.save();
      return NextResponse.json(
        { error: 'Esta invitación ha expirado.' },
        { status: 400 }
      );
    }

    if (invite.status === 'accepted') {
      return NextResponse.json(
        { error: 'Esta invitación ya fue aceptada.' },
        { status: 400 }
      );
    }

    const owner = await User.findById(invite.userId);
    const training = await Training.findById(invite.trainingId);

    return NextResponse.json(
      {
        ownerUsername: owner?.username || 'Atleta',
        doublesType: invite.doublesType || training?.gender,
        status: invite.status,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Duo invite GET error:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor.' },
      { status: 500 }
    );
  }
}

// POST: aceptar invitación y guardar perfil del Atleta 2
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<Params> }
) {
  try {
    await dbConnect();

    const { token } = await params;

    const invite = await DuoInvite.findOne({ token });

    if (!invite) {
      return NextResponse.json(
        { error: 'Invitación no encontrada.' },
        { status: 404 }
      );
    }

    if (invite.status !== 'pending') {
      return NextResponse.json(
        { error: 'La invitación ya fue utilizada o está expirada.' },
        { status: 400 }
      );
    }

    if (invite.expiresAt && invite.expiresAt < new Date()) {
      invite.status = 'expired';
      await invite.save();
      return NextResponse.json(
        { error: 'Esta invitación ha expirado.' },
        { status: 400 }
      );
    }

    const body = await request.json();
    const { userId, athlete } = body || {};

    // Validaciones básicas
    if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
      return NextResponse.json({ error: 'userId inválido.' }, { status: 400 });
    }

    if (!athlete) {
      return NextResponse.json({ error: 'Faltan datos del atleta.' }, { status: 400 });
    }

    const { username, age, weight, height, experience, goal, gender } = athlete;

    // Validación de campos obligatorios del formulario
    if (!username || !age || !weight || !height || !experience || !goal) {
      return NextResponse.json(
        { error: 'Faltan campos obligatorios en el perfil.' },
        { status: 400 }
      );
    }

    const training = await Training.findById(invite.trainingId);
    if (!training) {
      return NextResponse.json(
        { error: 'Entrenamiento asociado no encontrado.' },
        { status: 404 }
      );
    }

    // --- CORRECCIÓN PRINCIPAL AQUÍ ---
    // Usamos findOneAndUpdate (Upsert) y pasamos el trainingId
    const newAthlete = await Athlete.findOneAndUpdate(
      { userId: userId, username: username }, // Busca si ya existe para no duplicar
      {
        username,
        age: Number(age),
        weight: Number(weight),
        height: Number(height),
        experience,
        goal,
        targetTime: athlete.targetTime,
        strengths: athlete.strengths || [],
        weaknesses: athlete.weaknesses || [],
        gender: gender || training.gender,
        userId, 
        trainingId: training._id // 👈 ESTO FALTABA Y CAUSABA EL ERROR
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    const ownerUserId = invite.userId;
    const invitedUserId = userId;

    // Marcar invitación como aceptada y guardar partner
    invite.partnerUserId = invitedUserId;
    invite.status = 'accepted';
    await invite.save();

    // Actualizar Training con partner + atleta2
    training.partnerUserId = invitedUserId;
    training.athlete2Id = newAthlete._id;
    // No cambiamos status a active porque ya debería estarlo, pero por seguridad:
    training.status = 'active'; 
    await training.save();

    // Actualizar Users
    await User.findByIdAndUpdate(ownerUserId, {
      $set: {
        duoStatus: 'complete',
        duoPartnerId: invitedUserId,
        category: 'doubles',
      },
    });

    await User.findByIdAndUpdate(invitedUserId, {
      $set: {
        duoStatus: 'complete',
        duoPartnerId: ownerUserId,
        category: 'doubles',
      },
    });

    return NextResponse.json(
      {
        success: true,
        message: 'Perfil completado correctamente.',
        athleteId: newAthlete._id.toString(),
        ownerUserId,
        invitedUserId,
        trainingId: training._id.toString(),
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Duo invite POST error:', error);
    
    // Mostramos el error real en la respuesta para facilitar depuración
    return NextResponse.json(
      { error: error.message || 'Error interno del servidor al completar el perfil.' },
      { status: 500 }
    );
  }
}