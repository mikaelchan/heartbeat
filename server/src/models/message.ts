import mongoose, { Schema, type Document, type Model } from 'mongoose';
import type { Message as MessageType } from '../types/index.js';

export interface MessageDocument extends MessageType, Document {}

const MessageSchema = new Schema(
  {
    author: { type: String, enum: ['me', 'partner'], required: true },
    content: { type: String, required: true }
  },
  {
    collection: 'messages',
    timestamps: { createdAt: true, updatedAt: false }
  }
);

const MessageModel: Model<MessageDocument> =
  mongoose.models.Message || mongoose.model<MessageDocument>('Message', MessageSchema);

export default MessageModel;
