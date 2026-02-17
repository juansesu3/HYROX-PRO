import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IComment extends Document {
  userId: mongoose.Types.ObjectId;
  blockNumber: number;
  weekIndex: number;
  sessionIndex: number;
  comment: string;

  // ✅ nuevo
  coachTip?: string;
  coachTipModel?: string;
  coachTipCreatedAt?: Date;

  // opcional: snapshot del entreno
  sessionTitle?: string;
  sessionFocus?: string;
  sessionDetails?: string;

  rating?: number;
  createdAt: Date;
}

const CommentSchema = new Schema<IComment>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    blockNumber: { type: Number, required: true },
    weekIndex: { type: Number, required: true },
    sessionIndex: { type: Number, required: true },
    comment: { type: String, required: true },

    // ✅ nuevo
    coachTip: { type: String },
    coachTipModel: { type: String },
    coachTipCreatedAt: { type: Date },

    // opcional snapshot
    sessionTitle: { type: String },
    sessionFocus: { type: String },
    sessionDetails: { type: String },

    rating: { type: Number },
  },
  { timestamps: true }
);



export const Comment: Model<IComment> =
  mongoose.models.Comment || mongoose.model<IComment>('Comment', CommentSchema);