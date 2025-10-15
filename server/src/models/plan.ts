import mongoose, { Schema, type Document, type Model } from 'mongoose';
import type { Plan as PlanType } from '../types/index.js';

export interface PlanDocument extends PlanType, Document {}

const PlanSchema = new Schema(
  {
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
    timestamps: true
  }
);

const PlanModel: Model<PlanDocument> =
  mongoose.models.Plan || mongoose.model<PlanDocument>('Plan', PlanSchema);

export default PlanModel;
