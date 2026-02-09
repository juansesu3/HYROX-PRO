import { NextResponse } from "next/server";
import dbConnect from "@/app/lib/dbConnect";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/lib/auth/auth-options";
import mongoose from "mongoose";
import { SessionStatus } from "@/app/lib/models/SessionStatus";

export const dynamic = "force-dynamic";

export async function PATCH(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    const userId = session?.user?.id;
    if (!userId) return NextResponse.json({ message: "No autorizado" }, { status: 401 });

    const userObjectId = new mongoose.Types.ObjectId(userId);
    await dbConnect();

    const body = await request.json();
    const { blockNumber, weekIndex, sessionIndex, completed } = body ?? {};

    if (
      typeof blockNumber !== "number" ||
      typeof weekIndex !== "number" ||
      typeof sessionIndex !== "number" ||
      typeof completed !== "boolean"
    ) {
      return NextResponse.json({ message: "Payload inválido" }, { status: 400 });
    }

    const doc = await SessionStatus.findOneAndUpdate(
      { userId: userObjectId, blockNumber, weekIndex, sessionIndex },
      {
        $set: {
          completed,
          completedAt: completed ? new Date() : undefined,
        },
      },
      { upsert: true, new: true }
    ).lean();

    return NextResponse.json({ ok: true, data: doc });
  } catch (error) {
    console.error("Error /api/session-status:", error);
    return NextResponse.json({ message: "Error actualizando sesión" }, { status: 500 });
  }
}
