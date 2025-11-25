// src/app/lib/models/Comment.ts
import mongoose, { Document, Schema, Model } from "mongoose";

export interface IComment extends Document {
  userId: mongoose.Schema.Types.ObjectId;
  blockNumber: number;
  weekIndex: number;
  sessionIndex: number;
  comment: string;
  createdAt: Date;
}

const CommentSchema: Schema<IComment> = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
  blockNumber: { type: Number, required: true },
  weekIndex: { type: Number, required: true }, // 0 = Semana 1
  sessionIndex: { type: Number, required: true }, // 0 = Sesión 1
  comment: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

// Índice para buscar rápido comentarios de una sesión concreta
CommentSchema.index(
  { userId: 1, blockNumber: 1, weekIndex: 1, sessionIndex: 1 },
  { unique: false }
);

export const Comment: Model<IComment> =
  mongoose.models.Comment ||
  mongoose.model<IComment>("Comment", CommentSchema);
