import {
  CharacterGender,
  CharacterLocation,
  CharacterStatus,
} from '../../types';

export class CharacterDocument {
  static collectionName = 'characters';

  id: number;
  name: string;
  status: CharacterStatus;
  species: string;
  type: string;
  gender: CharacterGender;
  origin: CharacterLocation;
  location: CharacterLocation;
  image: string;
  episode: string[];
  url: string;
  created: Date;

  owner: string;
}
