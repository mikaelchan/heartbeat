import mongoose, { Schema, type Document, type Model, type Types } from 'mongoose';
import type { BucketItem as BucketItemType } from '../types/index.js';

export interface BucketItemDocument extends BucketItemType, Document {
  relationship: Types.ObjectId;
}

const BucketItemSchema = new Schema(
  {
    relationship: {
      type: Schema.Types.ObjectId,
      ref: 'Relationship',
      required: true,
      index: true
    },
    order: { type: Number, required: true },
    title: { type: String, required: true },
    completed: { type: Boolean, default: false }
  },
  {
    collection: 'bucketItems',
    timestamps: true,
    toJSON: {
      transform: (_doc, ret) => {
        Reflect.deleteProperty(ret, 'relationship');
        return ret;
      }
    }
  }
);

BucketItemSchema.index({ relationship: 1, order: 1 }, { unique: true });

const BucketItemModel: Model<BucketItemDocument> =
  mongoose.models.BucketItem || mongoose.model<BucketItemDocument>('BucketItem', BucketItemSchema);

export default BucketItemModel;
