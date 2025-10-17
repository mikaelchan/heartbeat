import mongoose, { Schema, type Document, type Model, type Types } from 'mongoose';

export type UserGender = 'male' | 'female' | 'other';

export interface UserDocument extends Document {
  username: string;
  passwordHash: string;
  gender: UserGender;
  createdAt: Date;
  updatedAt: Date;
  _id: Types.ObjectId;
}

const UserSchema = new Schema<UserDocument>(
  {
    username: { type: String, required: true, unique: true, trim: true, minlength: 2, maxlength: 32 },
    passwordHash: { type: String, required: true },
    gender: { type: String, enum: ['male', 'female', 'other'], default: 'other' }
  },
  {
    collection: 'users',
    timestamps: true,
    toJSON: {
      transform: (_doc, ret) => {
        Reflect.deleteProperty(ret, 'passwordHash');
        return ret;
      }
    }
  }
);

const UserModel: Model<UserDocument> = mongoose.models.User || mongoose.model<UserDocument>('User', UserSchema);

export default UserModel;
