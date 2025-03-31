import mongoose, { Document, Schema } from 'mongoose';

export interface ICollege extends Document {
  name: string;
  address: string;
  district: string;
  contactPerson: string;
  email: string;
  phone: string;
  userId: mongoose.Types.ObjectId | null;
}

const CollegeSchema = new Schema<ICollege>({
  name: { type: String, required: true },
  address: { type: String, required: true },
  district: { type: String, required: true },
  contactPerson: { type: String, required: true },
  email: { type: String, required: true },
  phone: { type: String, required: true },
  userId: { type: Schema.Types.ObjectId, ref: 'User', default: null }
});

export const College = mongoose.model<ICollege>('College', CollegeSchema);