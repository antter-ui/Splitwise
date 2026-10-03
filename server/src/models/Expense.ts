import mongoose, { Document, Model, Schema, Types } from 'mongoose';

export type SplitType = 'equal' | 'exact' | 'percentage' | 'shares';

export interface IParticipant {
  user: Types.ObjectId;
  amount: number;
  share?: number;
  percentage?: number;
}

export interface IExpense extends Document {
  groupId: Types.ObjectId;
  description: string;
  amount: number;
  currency: string;
  paidBy: Types.ObjectId;
  splitType: SplitType;
  participants: IParticipant[];
  category: string;
  notes?: string;
  createdBy: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const participantSchema = new Schema<IParticipant>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    amount: {
      type: Number,
      required: true,
      min: [0, 'Participant amount cannot be negative'],
    },
    share: {
      type: Number,
      default: 1,
    },
    percentage: {
      type: Number,
    },
  },
  { _id: false }
);

const expenseSchema = new Schema<IExpense>(
  {
    groupId: {
      type: Schema.Types.ObjectId,
      ref: 'Group',
      required: true,
      index: true,
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
      trim: true,
      maxlength: [200, 'Description cannot exceed 200 characters'],
    },
    amount: {
      type: Number,
      required: [true, 'Amount is required'],
      min: [0.01, 'Amount must be greater than zero'],
    },
    currency: {
      type: String,
      default: 'INR',
      uppercase: true,
      trim: true,
    },
    paidBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    splitType: {
      type: String,
      enum: ['equal', 'exact', 'percentage', 'shares'],
      default: 'equal',
    },
    participants: {
      type: [participantSchema],
      required: true,
      validate: {
        validator: (v: IParticipant[]) => v.length > 0,
        message: 'Expense must have at least one participant',
      },
    },
    category: {
      type: String,
      default: 'General',
      trim: true,
    },
    notes: {
      type: String,
      default: '',
      trim: true,
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

export const Expense: Model<IExpense> = mongoose.model<IExpense>('Expense', expenseSchema);
