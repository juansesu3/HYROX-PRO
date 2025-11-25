// src/app/lib/models/SessionStatus.ts
import mongoose, { Document, Schema, Model } from "mongoose";

export interface ISessionStatus extends Document {
  userId: mongoose.Schema.Types.ObjectId;
  blockNumber: number;
  weekIndex: number;
  sessionIndex: number;
  completed: boolean;
  completedAt?: Date;
}

const SessionStatusSchema: Schema<ISessionStatus> = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
  blockNumber: { type: Number, required: true },
  weekIndex: { type: Number, required: true },
  sessionIndex: { type: Number, required: true },
  completed: { type: Boolean, default: false },
  completedAt: { type: Date },
});

// Un estado por sesión de entrenamiento
SessionStatusSchema.index(
  { userId: 1, blockNumber: 1, weekIndex: 1, sessionIndex: 1 },
  { unique: true }
);

export const SessionStatus: Model<ISessionStatus> =
  mongoose.models.SessionStatus ||
  mongoose.model<ISessionStatus>("SessionStatus", SessionStatusSchema);
