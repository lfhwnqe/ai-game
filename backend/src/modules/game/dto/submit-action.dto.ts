import { IsString, IsObject, IsOptional, IsIn } from 'class-validator';

export class SubmitActionDto {
  @IsString()
  actionId: string;

  @IsString()
  @IsIn(['business', 'social', 'political', 'personal'])
  actionType: string;

  @IsString()
  actionName: string;

  @IsObject()
  actionData: {
    targetCharacterId?: string;
    targetBusinessId?: string;
    targetLocationId?: string;
    parameters: { [key: string]: any };
    reasoning?: string;
  };

  @IsOptional()
  @IsObject()
  costs?: {
    money?: number;
    actionPoints?: number;
    reputation?: number;
    resources?: { [resource: string]: number };
  };
}
