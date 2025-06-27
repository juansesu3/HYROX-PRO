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

    if (blockNumber === null || weekIndex === null || sessionIndex === null) {
      return NextResponse.json({ message: 'Faltan parámetros de búsqueda (blockNumber, weekIndex, sessionIndex)' }, { status: 400 });
    }

    const comment = await Comment.findOne({
      userId, // Filtrar por usuario
      blockNumber: parseInt(blockNumber),
      weekIndex: parseInt(weekIndex),
      sessionIndex: parseInt(sessionIndex)
    });

    return NextResponse.json(comment);
  } catch (error) {
    console.error('Error al obtener el comentario:', error);
    return NextResponse.json({ message: 'Error al obtener el comentario' }, { status: 500 });
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

    if (comment === null || comment === undefined) {
      return NextResponse.json({ message: 'El comentario no puede estar vacío.' }, { status: 400 });
    }

    // Lógica de "upsert": Actualiza si existe, crea si no.
    const updatedComment = await Comment.findOneAndUpdate(
      { userId, blockNumber, weekIndex, sessionIndex }, // Filtro para encontrar el documento
      { userId, comment }, // Datos a actualizar o insertar
      { new: true, upsert: true, runValidators: true, setDefaultsOnInsert: true } // Opciones
    );

    return NextResponse.json({ message: 'Comentario guardado', data: updatedComment }, { status: 200 });
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    console.error('Error al guardar el comentario:', error);
    // Devuelve el mensaje de error de validación de Mongoose si existe
    return NextResponse.json({ message: 'Error al guardar', error: error.message }, { status: 500 });
  }
}
