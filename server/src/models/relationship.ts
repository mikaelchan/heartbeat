import mongoose, { Schema, type Document, type Model, type Types } from 'mongoose';
import type { Relationship as RelationshipType } from '../types/index.js';

export interface RelationshipDocument extends RelationshipType, Document {
  userOne: Types.ObjectId;
  userTwo?: Types.ObjectId | null;
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
    userOne: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    userTwo: { type: Schema.Types.ObjectId, ref: 'User', default: null },
    coupleNames: { type: [String], required: true },
    startedOn: { type: Date, required: true },
    milestones: { type: [MilestoneSchema], default: [] }
  },
  {
    collection: 'relationships',
    timestamps: true,
    toJSON: {
      transform: (_doc, ret) => {
        Reflect.deleteProperty(ret, 'userOne');
        Reflect.deleteProperty(ret, 'userTwo');
        return ret;
      }
    }
  }
);

RelationshipSchema.index({ userOne: 1 });
RelationshipSchema.index({ userTwo: 1 });

const RelationshipModel: Model<RelationshipDocument> =
  mongoose.models.Relationship || mongoose.model<RelationshipDocument>('Relationship', RelationshipSchema);

export default RelationshipModel;
