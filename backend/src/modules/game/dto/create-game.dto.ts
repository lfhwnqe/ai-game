import { IsString, IsOptional, IsIn } from 'class-validator';

export class CreateGameDto {
  @IsOptional()
  @IsString()
  @IsIn(['easy', 'standard', 'hard', 'expert'])
  difficulty?: string = 'standard';

  @IsOptional()
  @IsString()
  @IsIn(['wealth', 'influence', 'innovation', 'social'])
  winCondition?: string;

  @IsOptional()
  gameSettings?: {
    roundTimeout?: number;
    aiAggressiveness?: number;
    enableEvents?: boolean;
    [key: string]: any;
  };
}
