import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type GameStateDocument = GameState & Document;

@Schema({ timestamps: true })
export class GameState {
  @Prop({ required: true })
  gameId: string;

  @Prop({ required: true })
  round: number;

  @Prop({ type: Object, required: true })
  playerState: {
    money: number;
    reputation: number;
    influence: number;
    actionPoints: number;
    resources: { [key: string]: number };
    properties: string[];
    businesses: string[];
    relationships: { [characterId: string]: number };
  };

  @Prop({ type: Object, required: true })
  marketState: {
    stockPrices: { [symbol: string]: number };
    commodityPrices: { [commodity: string]: number };
    realEstatePrices: { [location: string]: number };
    interestRates: number;
    inflationRate: number;
    economicIndicators: { [indicator: string]: number };
  };

  @Prop({ type: [Object], default: [] })
  activeEvents: Array<{
    eventId: string;
    type: 'policy' | 'market' | 'social' | 'international';
    title: string;
    description: string;
    effects: { [key: string]: any };
    duration: number;
    remainingRounds: number;
  }>;

  @Prop({ type: [Object], default: [] })
  availableActions: Array<{
    actionId: string;
    type: 'business' | 'social' | 'political' | 'personal';
    name: string;
    description: string;
    requirements: { [key: string]: any };
    costs: { [resource: string]: number };
    risks: { [risk: string]: number };
    potentialRewards: { [reward: string]: any };
  }>;

  @Prop({ type: [Object], default: [] })
  recentNews: Array<{
    newsId: string;
    headline: string;
    content: string;
    impact: 'positive' | 'negative' | 'neutral';
    relevantCharacters: string[];
    timestamp: Date;
  }>;

  @Prop({ type: Object, default: {} })
  aiCharacterStates: {
    [characterId: string]: {
      money: number;
      reputation: number;
      influence: number;
      currentGoals: string[];
      recentActions: string[];
      mood: 'aggressive' | 'cooperative' | 'defensive' | 'opportunistic';
    };
  };

  @Prop({ type: Date, default: Date.now })
  timestamp: Date;

  @Prop({ type: Object })
  metadata?: {
    processingTime: number;
    aiDecisionCount: number;
    [key: string]: any;
  };
}

export const GameStateSchema = SchemaFactory.createForClass(GameState);
