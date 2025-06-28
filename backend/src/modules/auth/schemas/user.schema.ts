import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type UserDocument = User & Document;

@Schema({ timestamps: true })
export class User {
  @Prop({ required: true, unique: true })
  userId: string;

  @Prop({ required: true, unique: true })
  username: string;

  @Prop({ required: true, unique: true })
  email: string;

  @Prop({ required: true })
  passwordHash: string;

  @Prop({ type: Object, default: {} })
  profile: {
    displayName?: string;
    avatar?: string;
    bio?: string;
    preferences?: {
      language?: string;
      theme?: string;
      notifications?: boolean;
    };
  };

  @Prop({ type: Object, default: {} })
  gameStats: {
    gamesPlayed: number;
    gamesWon: number;
    totalPlayTime: number;
    achievements: string[];
    favoriteStrategy?: string;
    bestScore?: number;
  };

  @Prop({ type: [String], default: [] })
  activeGames: string[];

  @Prop({ type: Date })
  lastLoginAt?: Date;

  @Prop({ type: String, default: 'active' })
  status: 'active' | 'inactive' | 'banned';

  @Prop({ type: String, default: 'user' })
  role: 'user' | 'admin' | 'moderator';

  @Prop({ type: Date })
  emailVerifiedAt?: Date;

  @Prop({ type: String })
  resetPasswordToken?: string;

  @Prop({ type: Date })
  resetPasswordExpires?: Date;

  @Prop({ type: Object })
  metadata?: {
    registrationIp?: string;
    lastLoginIp?: string;
    userAgent?: string;
    [key: string]: any;
  };
}

export const UserSchema = SchemaFactory.createForClass(User);
