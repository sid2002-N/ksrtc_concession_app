import mongoose, { Document, Schema } from 'mongoose';

export interface IStudent extends Document {
  userId: mongoose.Types.ObjectId;
  fullName: string;
  dateOfBirth: Date;
  gender: string;
  address: string;
  collegeId: mongoose.Types.ObjectId;
  course: string;
  startYear: number;
  endYear: number;
  idCard: string;
  photo: string;
  collegeIdCard: string;
  documentsVerified: boolean;
  verificationNotes: string;
}

const StudentSchema = new Schema<IStudent>({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  fullName: { type: String, required: true },
  dateOfBirth: { type: Date, required: true },
  gender: { type: String, required: true },
  address: { type: String, required: true },
  collegeId: { type: Schema.Types.ObjectId, ref: 'College', required: true },
  course: { type: String, required: true },
  startYear: { type: Number, required: true },
  endYear: { type: Number, required: true },
  idCard: { type: String, default: '' },
  photo: { type: String, default: '' },
  collegeIdCard: { type: String, default: '' },
  documentsVerified: { type: Boolean, default: false },
  verificationNotes: { type: String, default: '' }
});

export const Student = mongoose.model<IStudent>('Student', StudentSchema);