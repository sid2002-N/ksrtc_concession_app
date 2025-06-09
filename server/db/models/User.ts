import mongoose, { Document, Schema } from 'mongoose';
import { UserType } from '@shared/schema';

export interface IUser extends Document {
  username: string;
  password: string;
  email: string;
  userType: UserType;
  phone: string;
  collegeId: number | null;
  depotId: number | null;
  createdAt: Date;
}

const UserSchema = new Schema<IUser>({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  email: { type: String, required: true },
  userType: { 
    type: String, 
    required: true, 
    enum: [UserType.STUDENT, UserType.COLLEGE, UserType.DEPOT]
  },
  phone: { type: String, required: true },
  collegeId: { type: Number, default: null },
  depotId: { type: Number, default: null },
  createdAt: { type: Date, default: Date.now }
});

export const User = mongoose.model<IUser>('User', UserSchema);