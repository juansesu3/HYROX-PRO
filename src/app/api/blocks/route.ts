// app/api/blocks/route.ts
import { NextResponse } from "next/server";
import dbConnect from "@/app/lib/dbConnect";
import { TrainingBlock } from "@/app/lib/models";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/lib/auth/auth-options";
import mongoose from "mongoose";

export const dynamic = "force-dynamic"; // evita caching raro en rutas con sesión

async function requireUserId() {
  const session = await getServerSession(authOptions);

  const userId = session?.user?.id;
  if (!userId) return null;

  // Mongoose castea strings, pero lo dejamos explícito:
  return new mongoose.Types.ObjectId(userId);
}

export async function GET() {
  try {
    const userObjectId = await requireUserId();
    if (!userObjectId) {
      return NextResponse.json({ message: "No autorizado" }, { status: 401 });
    }

    await dbConnect();

    const blocks = await TrainingBlock.find({ userId: userObjectId })
      .sort({ blockNumber: 1 })
      .lean();

    return NextResponse.json(blocks);
  } catch (error) {
    console.error("Error al obtener los bloques:", error);
    return NextResponse.json(
      { message: "Error al obtener los bloques de entrenamiento" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    // ✅ 0) Usuario logueado
    const session = await getServerSession(authOptions);
    const userId = session?.user?.id;

    if (!userId) {
      return NextResponse.json({ message: "No autorizado" }, { status: 401 });
    }

    const userObjectId = new mongoose.Types.ObjectId(userId);

    // ✅ 1) Conectar DB
    await dbConnect();

    // ✅ 2) Body (array)
    const blocksToInsert = await request.json();

    if (!Array.isArray(blocksToInsert) || blocksToInsert.length === 0) {
      return NextResponse.json(
        { message: "El cuerpo debe ser un array de bloques no vacío." },
        { status: 400 }
      );
    }

    // ✅ 3) BORRAR SOLO los bloques de este usuario
    await TrainingBlock.deleteMany({ userId: userObjectId });

    // ✅ 4) FORZAR userId desde la sesión (no confiar en el body)
    const docs = blocksToInsert.map((b: any) => {
      const { userId: _ignoreUserId, _id, ...rest } = b; // ignorar userId/_id del cliente
      return { ...rest, userId: userObjectId };
    });

    // ✅ 5) Insertar
    const newBlocks = await TrainingBlock.insertMany(docs);

    return NextResponse.json(
      { message: "Bloques guardados con éxito", data: newBlocks },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error al insertar los bloques:", error);
    return NextResponse.json(
      { message: "Error al insertar los bloques de entrenamiento" },
      { status: 500 }
    );
  }
}
