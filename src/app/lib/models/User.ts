// src/app/lib/models/User.ts
import mongoose, { Document, Schema, Model } from 'mongoose';

export interface IUser extends Document {
  username: string;
  email: string;
  password?: string;
  category: 'individual' | 'doubles'; // 👈 sin 'pending' a nivel DB
  doublesType?: 'men' | 'women' | 'mixed';
  trainingPlan?: string;
  duoStatus?: 'single' | 'pending_partner' | 'complete';
}

const UserSchema: Schema<IUser> = new Schema(
  {
    username: {
      type: String,
      required: [true, 'Por favor, introduce un nombre de usuario.'],
      unique: true,
      trim: true,
      lowercase: true,
    },
    email: {
      type: String,
      required: [true, 'Por favor, introduce un email.'],
      unique: true,
      trim: true,
      lowercase: true,
      match: [/.+\@.+\..+/, 'Por favor, introduce un email válido.'],
    },
    password: {
      type: String,
      required: [true, 'Por favor, introduce una contraseña.'],
      select: false,
    },
    category: {
      type: String,
      enum: ['individual', 'doubles'],
      default: 'individual', // 👈 valor neutro inicial
    },
    doublesType: {
      type: String,
      enum: ['men', 'women', 'mixed'],
      default: undefined,
    },
    trainingPlan: {
      type: String,
      default: undefined,
    },
    duoStatus: {
      type: String,
      enum: ['single', 'pending_partner', 'complete'],
      default: 'single',
    },
  },
  { timestamps: true }
);

// 🔥 asegura que el modelo se recrea en dev
if (mongoose.models.User) {
  delete mongoose.models.User;
}

export const User: Model<IUser> = mongoose.model<IUser>('User', UserSchema);
