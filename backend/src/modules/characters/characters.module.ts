import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { CharactersController } from './characters.controller';
import { CharactersService } from './characters.service';
import { Neo4jService } from './neo4j.service';

// 导入数据模型
import { Character, CharacterSchema } from './schemas/character.schema';
import { Relationship, RelationshipSchema } from './schemas/relationship.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Character.name, schema: CharacterSchema },
      { name: Relationship.name, schema: RelationshipSchema },
    ]),
  ],
  controllers: [CharactersController],
  providers: [CharactersService, Neo4jService],
  exports: [CharactersService, Neo4jService],
})
export class CharactersModule {}
