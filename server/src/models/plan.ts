import mongoose, { Schema, type Document, type Model, type Types } from 'mongoose';
import type { Plan as PlanType } from '../types/index.js';

export interface PlanDocument extends PlanType, Document {
  relationship: Types.ObjectId;
}

const PlanSchema = new Schema(
  {
    relationship: {
      type: Schema.Types.ObjectId,
      ref: 'Relationship',
      required: true,
      index: true
    },
    title: { type: String, required: true },
    description: { type: String, required: true },
    scheduledOn: { type: Date, required: true },
    attachments: { type: [String], default: [] },
    status: {
      type: String,
      enum: ['upcoming', 'completed', 'in-progress'],
      default: 'upcoming'
    }
  },
  {
    collection: 'plans',
    timestamps: true,
    toJSON: {
      transform: (_doc, ret) => {
        Reflect.deleteProperty(ret, 'relationship');
        return ret;
      }
    }
  }
);

const PlanModel: Model<PlanDocument> =
  mongoose.models.Plan || mongoose.model<PlanDocument>('Plan', PlanSchema);

export default PlanModel;
