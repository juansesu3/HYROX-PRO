// src/app/lib/models/DuoInvite.ts
import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IDuoInvite extends Document {
  userId: mongoose.Types.ObjectId;
  token: string;
  category: 'doubles';
  doublesType: 'men' | 'women' | 'mixed';
  status: 'pending' | 'accepted' | 'expired';
  expiresAt: Date;
}

const DuoInviteSchema = new Schema<IDuoInvite>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    token: { type: String, required: true, unique: true },
    category: { type: String, enum: ['doubles'], required: true },
    doublesType: {
      type: String,
      enum: ['men', 'women', 'mixed'],
      default: 'mixed',
    },
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
