import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IComment extends Document {
  userId: mongoose.Types.ObjectId;
  blockNumber: number;
  weekNumber: number;
  sessionIndex: number;
  comment: string;
  rating?: number; // Del 1 al 10 (RPE o satisfacción)
  createdAt: Date;
}

const CommentSchema = new Schema<IComment>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    blockNumber: { type: Number, required: true },
    weekNumber: { type: Number, required: true },
    sessionIndex: { type: Number, required: true },
    comment: { type: String, required: true },
    rating: { type: Number },
  },
  { timestamps: true }
);

export const Comment: Model<IComment> =
  mongoose.models.Comment || mongoose.model<IComment>('Comment', CommentSchema);