import mongoose, { Schema, type Document, type Model } from 'mongoose';
import type { Memory as MemoryType } from '../types/index.js';

export interface MemoryDocument extends MemoryType, Document {}

const MemorySchema = new Schema(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },
    photoUrl: { type: String, required: true },
    location: {
      lat: { type: Number, required: true },
      lng: { type: Number, required: true },
      placeName: { type: String, required: true }
    },
    happenedOn: { type: Date, required: true }
  },
  {
    collection: 'memories',
    timestamps: true
  }
);

const MemoryModel: Model<MemoryDocument> =
  mongoose.models.Memory || mongoose.model<MemoryDocument>('Memory', MemorySchema);

export default MemoryModel;
