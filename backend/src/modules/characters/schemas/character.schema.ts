import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type CharacterDocument = Character & Document;

@Schema({ timestamps: true })
export class Character {
  @Prop({ required: true, unique: true })
  characterId: string;

  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  age: number;

  @Prop({ required: true })
  profession: string;

  @Prop({ required: true })
  type: 'government' | 'businessman' | 'foreigner' | 'intellectual' | 'social';

  @Prop({ type: Object, required: true })
  personality: {
    openness: number;        // 开放性 (0-1)
    conscientiousness: number; // 尽责性 (0-1)
    extraversion: number;    // 外向性 (0-1)
    agreeableness: number;   // 宜人性 (0-1)
    neuroticism: number;     // 神经质 (0-1)
    ambition: number;        // 野心 (0-1)
    riskTolerance: number;   // 风险承受能力 (0-1)
    cooperativeness: number; // 合作性 (0-1)
  };

  @Prop({ required: true })
  background: string;

  @Prop({ type: [String], required: true })
  goals: string[];

  @Prop({ type: Object, required: true })
  resources: {
    money: number;
    influence: number;
    connections: number;
    knowledge: number;
    reputation: number;
  };

  @Prop({ type: Object, required: true })
  skills: {
    business: number;     // 商业技能 (0-100)
    negotiation: number;  // 谈判技能 (0-100)
    leadership: number;   // 领导力 (0-100)
    technical: number;    // 技术能力 (0-100)
    social: number;       // 社交能力 (0-100)
    political: number;    // 政治敏感度 (0-100)
  };

  @Prop({ type: [String], default: [] })
  interests: string[];

  @Prop({ type: [String], default: [] })
  dislikes: string[];

  @Prop({ type: Object, default: {} })
  currentStatus: {
    mood: 'happy' | 'neutral' | 'angry' | 'excited' | 'worried';
    energy: number; // 0-100
    stress: number; // 0-100
    satisfaction: number; // 0-100
    currentGoals: string[];
    recentActions: string[];
  };

  @Prop({ type: Object, default: {} })
  gameState: {
    businesses: string[];
    properties: string[];
    investments: { [key: string]: number };
    debts: { [key: string]: number };
    achievements: string[];
  };

  @Prop({ type: Object, default: {} })
  aiSettings: {
    aggressiveness: number; // 0-1
    cooperativeness: number; // 0-1
    riskTaking: number; // 0-1
    loyalty: number; // 0-1
    adaptability: number; // 0-1
  };

  @Prop({ type: String })
  avatar?: string;

  @Prop({ type: Boolean, default: true })
  isActive: boolean;

  @Prop({ type: Object })
  metadata?: {
    version: string;
    lastUpdated: Date;
    [key: string]: any;
  };
}

export const CharacterSchema = SchemaFactory.createForClass(Character);
