// src/app/lib/models/DuoInvite.ts
import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IDuoInvite extends Document {
  trainingId: mongoose.Types.ObjectId; // 👈 en vez de userId
  token: string;
  status: 'pending' | 'accepted' | 'expired';
  expiresAt: Date;
}

const DuoInviteSchema = new Schema<IDuoInvite>(
  {
    trainingId: {
      type: Schema.Types.ObjectId,
      ref: 'Training',
      required: true,
    },
    token: { type: String, required: true, unique: true },
    status: {
      type: String,
      enum: ['pending', 'accepted', 'expired'],
      default: 'pending',
    },
    expiresAt: { type: Date, required: true },
  },
  { timestamps: true }
);

export const DuoInvite: Model<IDuoInvite> =
  mongoose.models.DuoInvite ||
  mongoose.model<IDuoInvite>('DuoInvite', DuoInviteSchema);
