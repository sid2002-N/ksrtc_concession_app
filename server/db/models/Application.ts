import mongoose, { Document, Schema } from 'mongoose';
import { ApplicationStatus } from '@shared/schema';

export interface IApplication extends Document {
  studentId: mongoose.Types.ObjectId;
  collegeId: mongoose.Types.ObjectId;
  depotId: mongoose.Types.ObjectId;
  startPoint: string;
  endPoint: string;
  status: ApplicationStatus;
  rejectionReason: string | null;
  applicationDate: Date;
  collegeVerifiedAt: Date | null;
  depotApprovedAt: Date | null;
  paymentVerifiedAt: Date | null;
  issuedAt: Date | null;
  paymentDetails: {
    transactionId: string;
    transactionDate: Date;
    accountHolder: string;
    amount: number;
    paymentMethod: string;
  } | null;
  isRenewal: boolean;
}

const ApplicationSchema = new Schema<IApplication>({
  studentId: { type: Schema.Types.ObjectId, ref: 'Student', required: true },
  collegeId: { type: Schema.Types.ObjectId, ref: 'College', required: true },
  depotId: { type: Schema.Types.ObjectId, ref: 'Depot', required: true },
  startPoint: { type: String, required: true },
  endPoint: { type: String, required: true },
  status: { 
    type: String, 
    required: true, 
    enum: Object.values(ApplicationStatus),
    default: ApplicationStatus.PENDING 
  },
  rejectionReason: { type: String, default: null },
  applicationDate: { type: Date, default: Date.now },
  collegeVerifiedAt: { type: Date, default: null },
  depotApprovedAt: { type: Date, default: null },
  paymentVerifiedAt: { type: Date, default: null },
  issuedAt: { type: Date, default: null },
  paymentDetails: {
    type: {
      transactionId: String,
      transactionDate: Date,
      accountHolder: String,
      amount: Number,
      paymentMethod: String
    },
    default: null
  },
  isRenewal: { type: Boolean, default: false }
});

export const Application = mongoose.model<IApplication>('Application', ApplicationSchema);