import mongoose, { Schema, type Document, type Model, type Types } from 'mongoose';
import type { Message as MessageType } from '../types/index.js';

export interface MessageDocument extends MessageType, Document {
  relationship: Types.ObjectId;
}

const MessageSchema = new Schema(
  {
    relationship: {
      type: Schema.Types.ObjectId,
      ref: 'Relationship',
      required: true,
      index: true
    },
    author: { type: String, enum: ['me', 'partner'], required: true },
    content: { type: String, required: true }
  },
  {
    collection: 'messages',
    timestamps: { createdAt: true, updatedAt: false },
    toJSON: {
      transform: (_doc, ret) => {
        Reflect.deleteProperty(ret, 'relationship');
        return ret;
      }
    }
  }
);

const MessageModel: Model<MessageDocument> =
  mongoose.models.Message || mongoose.model<MessageDocument>('Message', MessageSchema);

export default MessageModel;
