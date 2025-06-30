// =========================================================================
// API DE COMENTARIOS CORREGIDA (CON AUTENTICACIÓN Y LÓGICA UPSERT)
// Ruta: app/api/comments/route.ts
// =========================================================================

import { NextResponse } from 'next/server';
import dbConnect from '@/app/lib/dbConnect';
import { Comment } from '@/app/lib/models';
import { getServerSession } from "next-auth/next";

import authOptions from '@/app/lib/auth/auth-options';

// Extend the DefaultSession type to include the 'id' property

// --- FUNCIÓN GET: Para leer un comentario específico del usuario logueado ---
export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ message: 'No autenticado' }, { status: 401 });
    }
    const userId = session.user.id;

    await dbConnect();

    const { searchParams } = new URL(request.url);
    const blockNumber = searchParams.get('blockNumber');
    const weekIndex = searchParams.get('weekIndex');
    const sessionIndex = searchParams.get('sessionIndex');

    if (!blockNumber || !weekIndex || !sessionIndex) {
      return NextResponse.json({ message: 'Faltan parámetros' }, { status: 400 });
    }

    const comments = await Comment.find({
      userId,
      blockNumber: parseInt(blockNumber),
      weekIndex: parseInt(weekIndex),
      sessionIndex: parseInt(sessionIndex),
    }).sort({ createdAt: -1 }); // Más recientes primero

    return NextResponse.json(comments);

  } catch (error) {
    console.error('Error al obtener comentarios:', error);
    return NextResponse.json({ message: 'Error al obtener comentarios' }, { status: 500 });
  }
}



// --- FUNCIÓN POST: Para guardar o actualizar un comentario del usuario logueado ---
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ message: 'No autenticado' }, { status: 401 });
    }
    const userId = session.user.id;

    await dbConnect();
    const body = await request.json();
    const { blockNumber, weekIndex, sessionIndex, comment } = body;

    if (!comment?.trim()) {
      return NextResponse.json({ message: 'El comentario no puede estar vacío.' }, { status: 400 });
    }

    const newComment = await Comment.create({
      userId,
      blockNumber,
      weekIndex,
      sessionIndex,
      comment,
    });

    return NextResponse.json({ message: 'Comentario guardado', data: newComment }, { status: 200 });
// eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    console.error('Error al guardar el comentario:', error);
    return NextResponse.json({ message: 'Error al guardar', error: error.message }, { status: 500 });
  }
}
