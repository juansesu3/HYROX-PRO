// app/lib/models.ts
import mongoose, { Schema } from "mongoose";

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

const UserSchema = new Schema(
  {
    username: {
      type: String,
      required: [true, "Por favor, introduce un nombre de usuario."],
      unique: true,
      trim: true,
    },
    email: {
      type: String,
      required: [true, "Por favor, introduce un email."],
      unique: true,
      match: [/.+\@.+\..+/, "Por favor, introduce un email válido."],
    },
    password: {
      type: String,
      required: [true, "Por favor, introduce una contraseña."],
      select: false, // Por defecto, no se devuelve la contraseña en las consultas
    },
    age: { type: Number },
    weight: { type: Number }, // en kg
    height: { type: Number }, // en cm
    physicalActivityLevel: {
      type: String,
      enum: ["sedentary", "light", "moderate", "active", "very_active"],
    },
  },
  { timestamps: true }
);

export const User = mongoose.models.User || mongoose.model("User", UserSchema);
