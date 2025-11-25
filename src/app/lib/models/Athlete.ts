import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IAthlete extends Document {
  userId: mongoose.Types.ObjectId;
  username: string;
  
  // 👇 AGREGADO: Campo de género obligatorio
  gender: 'men' | 'women';
  
  age: number;
  weight: number;
  height: number;
  experience: string;
  goal: string;
  targetTime?: string;
  strengths?: string[];
  weaknesses?: string[];
  trainingId: mongoose.Types.ObjectId;
}

const AthleteSchema = new Schema<IAthlete>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    username: { type: String, required: true },
    
    // 👇 AGREGADO: Definición en Mongoose
    gender: { 
      type: String, 
      enum: ['men', 'women'], 
      required: true 
    },
    
    age: { type: Number, required: true },
    weight: { type: Number, required: true },
    height: { type: Number, required: true },
    experience: { type: String, required: true },
    goal: { type: String, required: true },
    targetTime: String,
    strengths: [String],
    weaknesses: [String],
    trainingId: { type: Schema.Types.ObjectId, ref: 'Training', required: true },
  },
  { timestamps: true }
);

export const Athlete: Model<IAthlete> =
  mongoose.models.Athlete ||
  mongoose.model<IAthlete>('Athlete', AthleteSchema);