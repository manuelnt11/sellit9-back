import { ApiProperty } from '@nestjs/swagger';
import {
  CharacterGender,
  CharacterGenderValues,
  CharacterStatus,
  CharacterStatusValues,
} from '../../types';

export class CharacterLocationDto {
  @ApiProperty()
  name: string;

  @ApiProperty()
  url: string;
}

export class CreateCharacterDto {
  @ApiProperty()
  name: string;

  @ApiProperty({ enum: CharacterStatusValues })
  status: CharacterStatus;

  @ApiProperty()
  species: string;

  @ApiProperty()
  type: string;

  @ApiProperty({ enum: CharacterGenderValues })
  gender: CharacterGender;

  @ApiProperty()
  origin: CharacterLocationDto;

  @ApiProperty()
  location: CharacterLocationDto;

  @ApiProperty({ format: 'uri' })
  image: string;

  @ApiProperty()
  episode: string[];

  @ApiProperty()
  url: string;
}
