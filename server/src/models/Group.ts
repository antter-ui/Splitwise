import mongoose, { Document, Model, Schema, Types } from 'mongoose';

export interface IGroup extends Document {
  name: string;
  description?: string;
  image?: string;
  createdBy: Types.ObjectId;
  members: Types.ObjectId[];
  currency: string;
  createdAt: Date;
  updatedAt: Date;
}

const groupSchema = new Schema<IGroup>(
  {
    name: {
      type: String,
      required: [true, 'Group name is required'],
      trim: true,
      minlength: [2, 'Group name must be at least 2 characters'],
      maxlength: [100, 'Group name cannot exceed 100 characters'],
    },
    description: {
      type: String,
      trim: true,
      default: '',
    },
    image: {
      type: String,
      default: '',
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    members: [
      {
        type: Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    currency: {
      type: String,
      default: 'INR',
      uppercase: true,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

export const Group: Model<IGroup> = mongoose.model<IGroup>('Group', groupSchema);
