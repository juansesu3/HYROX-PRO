// src/app/api/register/duo-invite/[token]/route.ts
import { NextResponse } from 'next/server';
import dbConnect from '@/app/lib/dbConnect';
import { DuoInvite } from '@/app/lib/models/DuoInvite';
import { User } from '@/app/lib/models/User';
import { Athlete } from '@/app/lib/models/Athlete'; // ajusta la ruta

// GET: validar invitación y mostrar info básica
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    await dbConnect();

    const { token } = await params; // 👈 IMPORTANTE

    const invite = await DuoInvite.findOne({ token });

    if (!invite) {
      return NextResponse.json(
        { error: 'Invitación no encontrada.' },
        { status: 404 }
      );
    }

    if (invite.expiresAt < new Date()) {
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

    return NextResponse.json(
      {
        ownerUsername: owner?.username || 'Atleta',
        doublesType: invite.doublesType,
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
  request: Request,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    await dbConnect();

    const { token } = await params; // 👈 IMPORTANTE

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

    const body = await request.json();
    const {
      username,
      age,
      weight,
      height,
      experience,
      goal,
      targetTime,
      strengths,
      weaknesses,
    } = body;

    if (!username || !age || !weight || !height) {
      return NextResponse.json(
        {
          error:
            'Nombre, edad, peso y altura son obligatorios para completar el perfil.',
        },
        { status: 400 }
      );
    }

    await Athlete.create({
      username,
      age,
      weight,
      height,
      experience,
      goal,
      targetTime,
      strengths,
      weaknesses,
      userId: invite.userId,
    });

    invite.status = 'accepted';
    await invite.save();

    return NextResponse.json(
      { success: true, message: 'Perfil completado correctamente.' },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Duo invite POST error:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor al completar el perfil.' },
      { status: 500 }
    );
  }
}
