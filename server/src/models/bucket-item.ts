import mongoose, { Schema, type Document, type Model } from 'mongoose';
import type { BucketItem as BucketItemType } from '../types/index.js';

export interface BucketItemDocument extends BucketItemType, Document {}

const BucketItemSchema = new Schema(
  {
    order: { type: Number, required: true, unique: true },
    title: { type: String, required: true },
    completed: { type: Boolean, default: false }
  },
  {
    collection: 'bucketItems',
    timestamps: true
  }
);

const BucketItemModel: Model<BucketItemDocument> =
  mongoose.models.BucketItem || mongoose.model<BucketItemDocument>('BucketItem', BucketItemSchema);

export default BucketItemModel;
