import mongoose, { Document, Schema } from 'mongoose';

export interface IDepot extends Document {
  name: string;
  location: string;
  address: string;
  contactPerson: string;
  email: string;
  phone: string;
  userId: mongoose.Types.ObjectId | null;
}

const DepotSchema = new Schema<IDepot>({
  name: { type: String, required: true },
  location: { type: String, required: true },
  address: { type: String, required: true },
  contactPerson: { type: String, required: true },
  email: { type: String, required: true },
  phone: { type: String, required: true },
  userId: { type: Schema.Types.ObjectId, ref: 'User', default: null }
});

export const Depot = mongoose.model<IDepot>('Depot', DepotSchema);