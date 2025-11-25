import mongoose, { Schema, Document } from 'mongoose';

export interface ITraining extends Document {
  ownerUserId: mongoose.Types.ObjectId; // 👈 Asegúrate de que se llame así
  partnerUserId?: mongoose.Types.ObjectId;
  athlete1Id?: mongoose.Types.ObjectId;
  athlete2Id?: mongoose.Types.ObjectId;
  division: 'individual' | 'doubles';
  mode?: 'same-device' | 'invite-partner';
  gender: 'men' | 'women' | 'mixed';
  status: 'active' | 'completed' | 'pending';
}

const TrainingSchema = new Schema<ITraining>(
  {
    // 👇 Debe coincidir con lo que envías en el create
    ownerUserId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    
    partnerUserId: { type: Schema.Types.ObjectId, ref: 'User' },
    athlete1Id: { type: Schema.Types.ObjectId, ref: 'Athlete' },
    athlete2Id: { type: Schema.Types.ObjectId, ref: 'Athlete' },
    
    division: { 
      type: String, 
      enum: ['individual', 'doubles'], 
      default: 'individual',
      required: true 
    },
    mode: { 
      type: String, 
      enum: ['same-device', 'invite-partner']
    },
    gender: { 
      type: String, 
      enum: ['men', 'women', 'mixed'], 
      required: true 
    },
    status: { type: String, default: 'active' },
  },
  { timestamps: true }
);

export const Training = mongoose.models.Training || mongoose.model<ITraining>('Training', TrainingSchema);