import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type UserDocument = User & Document;

export enum UserRole {
  admin = 'admin',
}

export enum UserStatus {
  active = 'active',
  invited = 'invited',
  deactivated = 'deactivated',
}

@Schema({ timestamps: true, versionKey: false })
export class User {
  @Prop({ required: true, unique: true, lowercase: true, trim: true })
  email: string;

  @Prop({ required: true })
  password: string;

  @Prop({ required: true, enum: UserRole, default: UserRole.admin })
  role: UserRole;

  @Prop({ required: true, enum: UserStatus, default: UserStatus.active })
  status: UserStatus;

  createdAt: Date;
  updatedAt: Date;
}

export const UserSchema = SchemaFactory.createForClass(User);
