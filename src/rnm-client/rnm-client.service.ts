import { Injectable, Logger } from '@nestjs/common';
import { RnmCharacter, RnmPage } from '../types';
import { QueryCharactersDto } from '../characters/dto/query-characters.dto';

@Injectable()
export class RnmClientService {
  private readonly logger = new Logger(RnmClientService.name);
  private readonly baseUrl = 'https://rickandmortyapi.com/api';

  async getCharacter(id: number): Promise<RnmCharacter> {
    try {
      const response = await fetch(`${this.baseUrl}/character/${id}`);
      if (!response.ok) {
        this.logger.error(`Failed to fetch character with id ${id}`);
        throw new Error('Failed to fetch character');
      } else {
        return response.json();
      }
    } catch (e) {
      this.logger.error(e);
      throw new Error('Failed to fetch character');
    }
  }

  async queryCharacters(filter: QueryCharactersDto): Promise<RnmPage> {
    try {
      const url = new URL(`${this.baseUrl}/character`);
      if (filter) {
        Object.entries(filter).forEach(([key, value]) => {
          url.searchParams.append(key, value.toString());
        });
      }
      const response = await fetch(url.toString());
      if (!response.ok) {
        this.logger.error('Failed to fetch characters', await response.text());
        throw new Error('Failed to fetch characters');
      } else {
        return await response.json();
      }
    } catch (e) {
      this.logger.error(e);
      throw new Error('Failed to fetch characters');
    }
  }
}
