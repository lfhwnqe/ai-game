import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type GameDocument = Game & Document;

@Schema({ timestamps: true })
export class Game {
  @Prop({ required: true, unique: true })
  gameId: string;

  @Prop({ required: true })
  playerId: string;

  @Prop({ required: true, default: 'waiting' })
  status: 'waiting' | 'active' | 'paused' | 'completed' | 'abandoned';

  @Prop({ required: true, default: 1 })
  currentRound: number;

  @Prop({ required: true, default: 200 })
  maxRounds: number;

  @Prop({ required: true, default: 'standard' })
  difficulty: 'easy' | 'standard' | 'hard' | 'expert';

  @Prop({ type: Object, default: {} })
  gameSettings: {
    roundTimeout?: number;
    aiAggressiveness?: number;
    enableEvents?: boolean;
    [key: string]: any;
  };

  @Prop({ type: Object, default: {} })
  playerStats: {
    money: number;
    reputation: number;
    influence: number;
    relationships: { [characterId: string]: number };
    achievements: string[];
  };

  @Prop({ type: [String], default: [] })
  completedActions: string[];

  @Prop({ type: Date })
  lastActionTime: Date;

  @Prop({ type: Date })
  gameStartTime: Date;

  @Prop({ type: Date })
  gameEndTime?: Date;

  @Prop({ type: String })
  winCondition?: 'wealth' | 'influence' | 'innovation' | 'social';

  @Prop({ type: Boolean, default: false })
  isCompleted: boolean;

  @Prop({ type: Object })
  metadata?: {
    version: string;
    seed?: string;
    [key: string]: any;
  };
}

export const GameSchema = SchemaFactory.createForClass(Game);
