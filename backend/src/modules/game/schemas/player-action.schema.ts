import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type PlayerActionDocument = PlayerAction & Document;

@Schema({ timestamps: true })
export class PlayerAction {
  @Prop({ required: true })
  gameId: string;

  @Prop({ required: true })
  playerId: string;

  @Prop({ required: true })
  round: number;

  @Prop({ required: true })
  actionId: string;

  @Prop({ required: true })
  actionType: 'business' | 'social' | 'political' | 'personal';

  @Prop({ required: true })
  actionName: string;

  @Prop({ type: Object, required: true })
  actionData: {
    targetCharacterId?: string;
    targetBusinessId?: string;
    targetLocationId?: string;
    parameters: { [key: string]: any };
    reasoning?: string;
  };

  @Prop({ type: Object })
  costs: {
    money?: number;
    actionPoints?: number;
    reputation?: number;
    resources?: { [resource: string]: number };
  };

  @Prop({ type: Object })
  results?: {
    success: boolean;
    effects: { [key: string]: any };
    relationshipChanges: { [characterId: string]: number };
    resourceChanges: { [resource: string]: number };
    newOpportunities: string[];
    consequences: string[];
  };

  @Prop({ type: String, default: 'pending' })
  status: 'pending' | 'processing' | 'completed' | 'failed';

  @Prop({ type: Date, default: Date.now })
  submittedAt: Date;

  @Prop({ type: Date })
  processedAt?: Date;

  @Prop({ type: String })
  errorMessage?: string;

  @Prop({ type: Object })
  metadata?: {
    processingTime?: number;
    aiInvolvement?: boolean;
    [key: string]: any;
  };
}

export const PlayerActionSchema = SchemaFactory.createForClass(PlayerAction);
