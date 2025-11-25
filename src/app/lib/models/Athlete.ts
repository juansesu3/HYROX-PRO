// src/app/lib/models/Athlete.ts
import mongoose, { Document, Schema, Model } from "mongoose";

export interface IAthlete extends Document {
  userId: mongoose.Schema.Types.ObjectId;
  username: string;
  age: number;
  weight: number;
  height: number;
  experience: string;
  goal: string;
  targetTime?: string;
  strengths: string[];
  weaknesses: string[];
}

const AthleteSchema: Schema<IAthlete> = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    username: {
      type: String,
      required: [true, "El nombre de usuario es obligatorio."],
      trim: true,
    },
    age: { type: Number, required: [true, "La edad es obligatoria."] },
    weight: { type: Number, required: [true, "El peso es obligatorio."] },
    height: { type: Number, required: [true, "La altura es obligatoria."] },
    experience: { type: String, required: true },
    goal: { type: String, required: true },
    targetTime: { type: String, default: null },
    strengths: [{ type: String }],
    weaknesses: [{ type: String }],
  },
  { timestamps: true }
);

// Un mismo usuario no puede tener dos atletas con el mismo username
AthleteSchema.index({ userId: 1, username: 1 }, { unique: true });

export const Athlete: Model<IAthlete> =
  mongoose.models.Athlete ||
  mongoose.model<IAthlete>("Athlete", AthleteSchema);
