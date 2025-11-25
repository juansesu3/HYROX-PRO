import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/lib/auth/auth-options';
import dbConnect from '@/app/lib/dbConnect';
import { Training } from '@/app/lib/models/Training';

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    await dbConnect();

    // Buscamos un training activo donde el usuario sea owner o partner
    const training = await Training.findOne({
      $or: [{ ownerUserId: session.user.id }, { partnerUserId: session.user.id }],
      status: 'active'
    }).select('division gender mode'); // Solo necesitamos estos campos

    if (!training) {
      return NextResponse.json({ error: 'No se encontró entrenamiento activo' }, { status: 404 });
    }

    return NextResponse.json({
      division: training.division,
      gender: training.gender,
      mode: training.mode
    });

  } catch (error: any) {
    console.error('Error fetching active training:', error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}