import mongoose, { Document, Schema } from 'mongoose';
import { UserType } from '@shared/schema';

export interface IUser extends Document {
  username: string;
  password: string;
  email: string;
  userType: UserType;
  phone: string;
  collegeId: mongoose.Types.ObjectId | null;
  depotId: mongoose.Types.ObjectId | null;
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
  collegeId: { type: Schema.Types.ObjectId, ref: 'College', default: null },
  depotId: { type: Schema.Types.ObjectId, ref: 'Depot', default: null },
  createdAt: { type: Date, default: Date.now }
});

export const User = mongoose.model<IUser>('User', UserSchema);