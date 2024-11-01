export interface RnmCharacter {
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
}

export interface CharacterLocation {
  name: string;
  url: string;
}

export type CharacterStatus = 'Alive' | 'Dead' | 'unknown';
export const CharacterStatusValues: CharacterStatus[] = [
  'Alive',
  'Dead',
  'unknown',
];

export type CharacterGender = 'Female' | 'Male' | 'Genderless' | 'unknown';
export const CharacterGenderValues: CharacterGender[] = [
  'Female',
  'Male',
  'Genderless',
  'unknown',
];

export interface RnmPage {
  info: RnmPageInfo;
  results: RnmCharacter[];
}

export interface RnmPageInfo {
  count: number;
  pages: number;
  next: string;
  prev: string;
}
