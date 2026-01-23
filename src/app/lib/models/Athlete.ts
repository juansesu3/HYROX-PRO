import mongoose, { Schema, InferSchemaType, HydratedDocument } from 'mongoose';

const AthleteSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    username: { type: String, required: true },

    gender: {
      type: String,
      enum: ['men', 'women'],
      required: true,
    },

    age: { type: Number, required: true },
    weight: { type: Number, required: true },
    height: { type: Number, required: true },
    experience: { type: String, required: true },
    goal: { type: String, required: true },

    targetTime: { type: String },
    strengths: { type: [String], default: [] },
    weaknesses: { type: [String], default: [] },

    trainingId: { type: Schema.Types.ObjectId, ref: 'Training', required: true },
  },
  { timestamps: true }
);

// ✅ Tipos correctos (incluye _id como ObjectId)
export type IAthlete = InferSchemaType<typeof AthleteSchema>;
export type AthleteDoc = HydratedDocument<IAthlete>;

export const Athlete =
  (mongoose.models.Athlete as mongoose.Model<IAthlete>) ||
  mongoose.model<IAthlete>('Athlete', AthleteSchema);
