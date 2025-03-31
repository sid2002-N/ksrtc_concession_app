import mongoose, { Document, Schema } from 'mongoose';

export interface IDepot extends Document {
  name: string;
  code: string;
  address: string;
  district: string;
  contactPerson: string;
  contactEmail: string;
  contactPhone: string;
}

const DepotSchema = new Schema<IDepot>({
  name: { type: String, required: true },
  code: { type: String, required: true, unique: true },
  address: { type: String, required: true },
  district: { type: String, required: true },
  contactPerson: { type: String, required: true },
  contactEmail: { type: String, required: true },
  contactPhone: { type: String, required: true }
});

export const Depot = mongoose.model<IDepot>('Depot', DepotSchema);