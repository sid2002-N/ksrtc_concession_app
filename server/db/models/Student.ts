import mongoose, { Document, Schema } from 'mongoose';

export interface IStudent extends Document {
  userId: mongoose.Types.ObjectId;
  firstName: string;
  lastName: string;
  collegeIdNumber: string;
  dateOfBirth: Date;
  gender: string;
  altPhone: string | null;
  address: string;
  course: string;
  department: string;
  semester: string;
  collegeId: number;
  photoUrl: string | null;
  idCardUrl: string | null;
  addressProofUrl: string | null;
  documentsVerified: boolean;
  verificationNotes: string | null;
}

const StudentSchema = new Schema<IStudent>({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  collegeIdNumber: { type: String, required: true },
  dateOfBirth: { type: Date, required: true },
  gender: { type: String, required: true },
  altPhone: { type: String, default: null },
  address: { type: String, required: true },
  course: { type: String, required: true },
  department: { type: String, required: true },
  semester: { type: String, required: true },
  collegeId: { type: Number, required: true },
  photoUrl: { type: String, default: null },
  idCardUrl: { type: String, default: null },
  addressProofUrl: { type: String, default: null },
  documentsVerified: { type: Boolean, default: false },
  verificationNotes: { type: String, default: null }
});

export const Student = mongoose.model<IStudent>('Student', StudentSchema);