import mongoose, { Document, Schema } from 'mongoose';
import { ApplicationStatus } from '@shared/schema';

export interface IApplication extends Document {
  studentId: mongoose.Types.ObjectId;
  collegeId: mongoose.Types.ObjectId;
  depotId: mongoose.Types.ObjectId;
  fromLocation: string;
  toLocation: string;
  distance: number;
  routeDetails: string;
  status: ApplicationStatus;
  statusReason: string;
  paymentDetails: {
    transactionId: string;
    transactionDate: Date;
    accountHolder: string;
    amount: number;
    paymentMethod: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

const ApplicationSchema = new Schema<IApplication>({
  studentId: { type: Schema.Types.ObjectId, ref: 'Student', required: true },
  collegeId: { type: Schema.Types.ObjectId, ref: 'College', required: true },
  depotId: { type: Schema.Types.ObjectId, ref: 'Depot', required: true },
  fromLocation: { type: String, required: true },
  toLocation: { type: String, required: true },
  distance: { type: Number, required: true },
  routeDetails: { type: String, required: true },
  status: { 
    type: String, 
    required: true, 
    enum: Object.values(ApplicationStatus),
    default: ApplicationStatus.PENDING
  },
  statusReason: { type: String, default: '' },
  paymentDetails: {
    transactionId: { type: String, default: '' },
    transactionDate: { type: Date },
    accountHolder: { type: String, default: '' },
    amount: { type: Number, default: 0 },
    paymentMethod: { type: String, default: '' }
  },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Update the updatedAt field on save
ApplicationSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

export const Application = mongoose.model<IApplication>('Application', ApplicationSchema);