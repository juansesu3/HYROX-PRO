// src/app/lib/models/DuoInvite.ts
import mongoose, { Schema, Document, Model, Types } from 'mongoose';

export interface IDuoInvite extends Document {
  // 👈 en vez de userId
  userId: Types.ObjectId;
  trainingId: Types.ObjectId;
  partnerUserId?: Types.ObjectId;
  doublesType?: string;
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
