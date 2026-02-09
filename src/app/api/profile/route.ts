import { NextResponse } from "next/server";
import dbConnect from "@/app/lib/dbConnect";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/lib/auth/auth-options";
import mongoose from "mongoose";

// Ajusta imports si tu proyecto usa un index en /models
import { User } from "@/app/lib/models/User";
import { TrainingBlock } from "@/app/lib/models/TrainingBlock";
import { Training } from "@/app/lib/models/Training";
import { SessionStatus } from "@/app/lib/models/SessionStatus";
import { Comment } from "@/app/lib/models/Comment";
import { Athlete } from "@/app/lib/models/Athlete";
import { DuoInvite } from "@/app/lib/models/DuoInvite";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    const userId = session?.user?.id;

    if (!userId) {
      return NextResponse.json({ message: "No autorizado" }, { status: 401 });
    }

    const userObjectId = new mongoose.Types.ObjectId(userId);

    await dbConnect();

    const user = await User.findById(userObjectId).lean();

    const athletes = await Athlete.find({ userId: userObjectId }).lean();

    // Trainings donde soy owner o partner
    const trainings = await Training.find({
      $or: [{ ownerUserId: userObjectId }, { partnerUserId: userObjectId }],
    })
      .sort({ createdAt: -1 })
      .lean();

    const trainingIds = trainings.map((t: any) => t._id);

    const blocks = await TrainingBlock.find({ userId: userObjectId })
      .sort({ blockNumber: 1 })
      .lean();

    const sessionStatuses = await SessionStatus.find({ userId: userObjectId }).lean();

    const comments = await Comment.find({ userId: userObjectId })
      .sort({ createdAt: -1 })
      .lean();

    // DuoInvites: como tu schema actual no tiene userId en la colección,
    // los filtramos por trainings del usuario.
    const duoInvites = trainingIds.length
      ? await DuoInvite.find({ trainingId: { $in: trainingIds } })
          .sort({ createdAt: -1 })
          .lean()
      : [];

    return NextResponse.json({
      user,
      athletes,
      trainings,
      blocks,
      sessionStatuses,
      comments,
      duoInvites,
    });
  } catch (error) {
    console.error("Error /api/profile:", error);
    return NextResponse.json(
      { message: "Error al obtener el perfil" },
      { status: 500 }
    );
  }
}
