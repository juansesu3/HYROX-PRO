import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IComment extends Document {
  userId: mongoose.Types.ObjectId;
  blockNumber: number;
  weekIndex: number;        // ✅
  sessionIndex: number;
  comment: string;
  rating?: number;
  createdAt: Date;
}

const CommentSchema = new Schema<IComment>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    blockNumber: { type: Number, required: true },
    weekIndex: { type: Number, required: true },   // ✅ antes weekNumber
    sessionIndex: { type: Number, required: true },
    comment: { type: String, required: true },
    rating: { type: Number },
  },
  { timestamps: true }
);


export const Comment: Model<IComment> =
  mongoose.models.Comment || mongoose.model<IComment>('Comment', CommentSchema);