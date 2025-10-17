import mongoose, { Schema, type Document, type Model, type Types } from 'mongoose';
import type { Relationship as RelationshipType } from '../types/index.js';

export interface RelationshipDocument extends RelationshipType, Document {
  user: Types.ObjectId;
}

const MilestoneSchema = new Schema(
  {
    label: { type: String, required: true },
    date: { type: Date, required: true }
  },
  { _id: false }
);

const RelationshipSchema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true, unique: true },
    coupleNames: { type: [String], required: true },
    startedOn: { type: Date, required: true },
    milestones: { type: [MilestoneSchema], default: [] }
  },
  {
    collection: 'relationships',
    timestamps: true,
    toJSON: {
      transform: (_doc, ret) => {
        Reflect.deleteProperty(ret, 'user');
        return ret;
      }
    }
  }
);

const RelationshipModel: Model<RelationshipDocument> =
  mongoose.models.Relationship || mongoose.model<RelationshipDocument>('Relationship', RelationshipSchema);

export default RelationshipModel;
