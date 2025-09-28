// app/lib/models.ts
import mongoose, { Document, Schema } from "mongoose";
import { Model } from "mongoose";



// --- NUEVO: Interfaz y Esquema para el Atleta ---
// Cada atleta es un documento separado vinculado a una cuenta de usuario.
export interface IAthlete extends Document {
  userId: mongoose.Schema.Types.ObjectId; // Vínculo al usuario
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

const AthleteSchema: Schema<IAthlete> = new Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  username: { type: String, required: [true, 'El nombre de usuario es obligatorio.'], trim: true },
  age: { type: Number, required: [true, 'La edad es obligatoria.'] },
  weight: { type: Number, required: [true, 'El peso es obligatorio.'] },
  height: { type: Number, required: [true, 'La altura es obligatoria.'] },
  experience: { type: String, required: true },
  goal: { type: String, required: true },
  targetTime: { type: String, default: null },
  strengths: [{ type: String }],
  weaknesses: [{ type: String }],
}, { timestamps: true });

export const Athlete: Model<IAthlete> = mongoose.models.Athlete || mongoose.model<IAthlete>('Athlete', AthleteSchema);


// --- ACTUALIZADO: Interfaz y Esquema para el Usuario (Cuenta) ---
// El usuario ahora almacena credenciales, configuración de la cuenta y el plan generado por IA.
export interface IUser extends Document {
  email: string;
  password?: string; // El password no se debería devolver en las consultas
  category: 'individual' | 'doubles';
  doublesType?: 'men' | 'women' | 'mixed';
  trainingPlan?: string; // El plan generado por la IA
}

const UserSchema: Schema<IUser> = new Schema({
  email: {
    type: String,
    required: [true, "Por favor, introduce un email."],
    unique: true,
    trim: true,
    lowercase: true,
    match: [/.+\@.+\..+/, "Por favor, introduce un email válido."],
  },
  password: {
    type: String,
    required: [true, "Por favor, introduce una contraseña."],
    select: false, // Por defecto, no se devuelve la contraseña en las consultas
  },
  category: { type: String, enum: ['individual', 'doubles'], required: true },
  doublesType: { type: String, enum: ['men', 'women', 'mixed'], default: null },
  trainingPlan: { type: String, default: null },
}, { timestamps: true });

export const User: Model<IUser> = mongoose.models.User || mongoose.model<IUser>('User', UserSchema);


// --- Modelo de Comentarios ---
// Ahora se asocia a un bloque y a una semana dentro de ese bloque.
const CommentSchema = new Schema({
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true }, // AÑADIR ESTA LÍNEA
  blockNumber: { type: Number, required: true },
  weekIndex: { type: Number, required: true }, // 0 para Semana 1, 1 para Semana 2...
  sessionIndex: { type: Number, required: true }, // 0 para Sesión 1...
  comment: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});
export const Comment =
  mongoose.models.Comment || mongoose.model("Comment", CommentSchema);

// --- Estructura de una Sesión y una Semana ---
const SessionSchema = new Schema(
  {
    title: { type: String, required: true },
    focus: { type: String, required: true },
    details: { type: String, required: true },
  },
  { _id: false }
);

const WeekPlanSchema = new Schema(
  {
    weekNumber: { type: Number, required: true },
    sessions: [SessionSchema],
  },
  { _id: false }
);

// --- Modelo Principal: TrainingBlock ---
// Este modelo representa un mesociclo completo de 4 semanas.
const TrainingBlockSchema = new Schema({
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true }, // AÑADIR ESTA LÍNEA
  blockNumber: { type: Number, unique: true, required: true },
  status: { type: String, enum: ["active", "completed"], default: "active" },
  weeks: [WeekPlanSchema], // Contiene las 4 semanas del plan
});

TrainingBlockSchema.index({ userId: 1, blockNumber: 1 }, { unique: true });

export const TrainingBlock =
  mongoose.models.TrainingBlock ||
  mongoose.model("TrainingBlock", TrainingBlockSchema);




// --- Modelo de Estado de Sesión ---
const SessionStatusSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  blockNumber: { type: Number, required: true },
  weekIndex: { type: Number, required: true },
  sessionIndex: { type: Number, required: true },
  completed: { type: Boolean, default: false },
  completedAt: { type: Date },
});

SessionStatusSchema.index(
  { userId: 1, blockNumber: 1, weekIndex: 1, sessionIndex: 1 },
  { unique: true }
);

export const SessionStatus =
  mongoose.models.SessionStatus || mongoose.model('SessionStatus', SessionStatusSchema);