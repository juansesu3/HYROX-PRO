import { NextResponse } from 'next/server';
import dbConnect from '@/app/lib/dbConnect';
import { SessionStatus } from '@/app/lib/models';
import { getServerSession } from 'next-auth/next';
import authOptions from '@/app/lib/auth/auth-options';

// ---------------------------
// GET: Obtener estado completado
// ---------------------------
export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ message: 'No autenticado' }, { status: 401 });
    }
    const userId = session.user.id;

    const { searchParams } = new URL(request.url);
    const blockNumber = searchParams.get('blockNumber');
    const weekIndex = searchParams.get('weekIndex');
    const sessionIndex = searchParams.get('sessionIndex');

    if (blockNumber === null || weekIndex === null || sessionIndex === null) {
      return NextResponse.json({ message: 'Faltan parámetros' }, { status: 400 });
    }

    await dbConnect();

    const status = await SessionStatus.findOne({
      userId,
      blockNumber: parseInt(blockNumber),
      weekIndex: parseInt(weekIndex),
      sessionIndex: parseInt(sessionIndex),
    });

    return NextResponse.json({
      completed: status?.completed || false,
      completedAt: status?.completedAt || null, // ✅ Aquí se devuelve la fecha
    });
  } catch (error) {
    console.error('Error al obtener el estado:', error);
    return NextResponse.json({ message: 'Error al obtener estado' }, { status: 500 });
  }
}

// ---------------------------
// POST: Marcar sesión como completada
// ---------------------------
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ message: 'No autenticado' }, { status: 401 });
    }
    const userId = session.user.id;

    const { blockNumber, weekIndex, sessionIndex, completed } = await request.json();

    if (completed !== true) {
      return NextResponse.json({ message: 'Solo se permite marcar como completado' }, { status: 400 });
    }

    await dbConnect();

    const status = await SessionStatus.findOneAndUpdate(
      { userId, blockNumber, weekIndex, sessionIndex },
      {
        userId,
        blockNumber,
        weekIndex,
        sessionIndex,
        completed: true,
        completedAt: new Date(),
      },
      { new: true, upsert: true, runValidators: true, setDefaultsOnInsert: true }
    );

    return NextResponse.json({ message: 'Sesión marcada como completada', status });
  } catch (error) {
    console.error('Error al guardar el estado:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ message: 'Error al guardar', error: errorMessage }, { status: 500 });
  }
}
