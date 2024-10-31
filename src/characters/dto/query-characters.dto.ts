import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  CharacterGender,
  CharacterGenderValues,
  CharacterStatus,
  CharacterStatusValues,
} from '../../types';

export class QueryCharactersDto {
  @ApiPropertyOptional()
  name?: string;

  @ApiPropertyOptional({ enum: CharacterStatusValues })
  status?: CharacterStatus;

  @ApiPropertyOptional()
  species?: string;

  @ApiPropertyOptional()
  type?: string;

  @ApiPropertyOptional({ enum: CharacterGenderValues })
  gender?: CharacterGender;

  @ApiPropertyOptional()
  page = 1;
}
