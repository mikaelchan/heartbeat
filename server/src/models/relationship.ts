import mongoose, { Schema, type Document, type Model } from 'mongoose';
import type { Relationship as RelationshipType } from '../types/index.js';

export interface RelationshipDocument extends RelationshipType, Document {}

const MilestoneSchema = new Schema(
  {
    label: { type: String, required: true },
    date: { type: Date, required: true }
  },
  { _id: false }
);

const RelationshipSchema = new Schema(
  {
    coupleNames: { type: [String], required: true },
    startedOn: { type: Date, required: true },
    milestones: { type: [MilestoneSchema], default: [] }
  },
  {
    collection: 'relationships',
    timestamps: true
  }
);

const RelationshipModel: Model<RelationshipDocument> =
  mongoose.models.Relationship || mongoose.model<RelationshipDocument>('Relationship', RelationshipSchema);

export default RelationshipModel;
