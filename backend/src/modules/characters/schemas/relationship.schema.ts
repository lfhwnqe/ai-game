import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type RelationshipDocument = Relationship & Document;

@Schema({ timestamps: true })
export class Relationship {
  @Prop({ required: true })
  fromCharacterId: string;

  @Prop({ required: true })
  toCharacterId: string;

  @Prop({ required: true })
  relationshipType: 'friend' | 'enemy' | 'business_partner' | 'competitor' | 'family' | 'mentor' | 'neutral';

  @Prop({ required: true, min: -100, max: 100 })
  strength: number; // 关系强度，-100到100

  @Prop({ required: true, min: 0, max: 100 })
  trust: number; // 信任度，0到100

  @Prop({ required: true, min: 0, max: 100 })
  respect: number; // 尊重度，0到100

  @Prop({ type: Object, default: {} })
  attributes: {
    intimacy?: number; // 亲密度
    power?: number; // 权力关系
    commitment?: number; // 承诺度
    [key: string]: any;
  };

  @Prop({ type: [Object], default: [] })
  history: Array<{
    event: string;
    impact: number; // 对关系的影响
    timestamp: Date;
    description?: string;
  }>;

  @Prop({ type: Object, default: {} })
  sharedInterests: {
    business?: string[];
    personal?: string[];
    political?: string[];
  };

  @Prop({ type: Object, default: {} })
  conflicts: {
    business?: string[];
    personal?: string[];
    ideological?: string[];
  };

  @Prop({ type: Date })
  lastInteraction?: Date;

  @Prop({ type: String })
  lastInteractionType?: 'positive' | 'negative' | 'neutral';

  @Prop({ type: Number, default: 0 })
  interactionFrequency: number; // 互动频率

  @Prop({ type: Boolean, default: true })
  isActive: boolean;

  @Prop({ type: Object })
  metadata?: {
    gameId?: string;
    round?: number;
    [key: string]: any;
  };
}

export const RelationshipSchema = SchemaFactory.createForClass(Relationship);

// 创建复合索引
RelationshipSchema.index({ fromCharacterId: 1, toCharacterId: 1 }, { unique: true });
