// src/app/lib/models/TrainingBlock.ts
import mongoose, { Document, Schema, Model } from "mongoose";

interface ISession {
  title: string;
  focus: string;
  details: string;
}

interface IWeekPlan {
  weekNumber: number;
  sessions: ISession[];
}

export interface ITrainingBlock extends Document {
  userId: mongoose.Schema.Types.ObjectId;
  blockNumber: number;
  status: "active" | "completed";
  weeks: IWeekPlan[];
}

const SessionSchema = new Schema<ISession>(
  {
    title: { type: String, required: true },
    focus: { type: String, required: true },
    details: { type: String, required: true },
  },
  { _id: false }
);

const WeekPlanSchema = new Schema<IWeekPlan>(
  {
    weekNumber: { type: Number, required: true },
    sessions: [SessionSchema],
  },
  { _id: false }
);

const TrainingBlockSchema: Schema<ITrainingBlock> = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
  blockNumber: { type: Number, required: true },
  status: {
    type: String,
    enum: ["active", "completed"],
    default: "active",
  },
  weeks: [WeekPlanSchema],
});

// Un bloque N por usuario
TrainingBlockSchema.index({ userId: 1, blockNumber: 1 }, { unique: true });

export const TrainingBlock: Model<ITrainingBlock> =
  mongoose.models.TrainingBlock ||
  mongoose.model<ITrainingBlock>("TrainingBlock", TrainingBlockSchema);
