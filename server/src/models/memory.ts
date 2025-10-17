import mongoose, { Schema, type Document, type Model, type Types } from 'mongoose';
import type { Memory as MemoryType } from '../types/index.js';

export interface MemoryDocument extends MemoryType, Document {
  user: Types.ObjectId;
}

const MemorySchema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
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
    timestamps: true,
    toJSON: {
      transform: (_doc, ret) => {
        Reflect.deleteProperty(ret, 'user');
        return ret;
      }
    }
  }
);

const MemoryModel: Model<MemoryDocument> =
  mongoose.models.Memory || mongoose.model<MemoryDocument>('Memory', MemorySchema);

export default MemoryModel;
