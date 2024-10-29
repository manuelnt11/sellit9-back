import { Module } from '@nestjs/common';
import { CharactersService } from './characters.service';
import { CharactersController } from './characters.controller';
import { RnmClientService } from '../rnm-client/rnm-client.service';

@Module({
  controllers: [CharactersController],
  providers: [CharactersService, RnmClientService],
})
export class CharactersModule {}
