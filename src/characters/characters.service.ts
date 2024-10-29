import { CollectionReference } from '@google-cloud/firestore';
import { Inject, Injectable, Logger } from '@nestjs/common';
import { RnmClientService } from '../rnm-client/rnm-client.service';
import { RnmPage } from '../types';
import { CharacterDocument } from './documents/character.document';
import { CreateCharacterDto } from './dto/create-character.dto';
import { QueryCharactersDto } from './dto/query-characters.dto';
import { UpdateCharacterDto } from './dto/update-character.dto';

const CHARACTERS_PER_PAGE = 20;
const MAX_RNM_PAGE = 42;
const RNM_COUNT = 826;

@Injectable()
export class CharactersService {
  private readonly logger = new Logger(CharactersService.name);

  public constructor(
    @Inject()
    private readonly rnmClientService: RnmClientService,
    @Inject(CharacterDocument.collectionName)
    private charactersCollection: CollectionReference<CharacterDocument>,
  ) {}

  async create(createCharacterDto: CreateCharacterDto) {
    try {
      const count = await this.charactersCollection.count().get();
      const id = count.data().count + 1000;
      this.logger.log(`Creating character with id: ${id}`);
      const newCharacter = {
        id,
        ...createCharacterDto,
        owner: 'undef', // TODO: get owner from request
      };
      this.logger.log(`New character: ${JSON.stringify(newCharacter)}`);
      await this.charactersCollection.doc(id.toString()).set(newCharacter);
      return newCharacter;
    } catch (e) {
      this.logger.error(`Error creating character: ${JSON.stringify(e)}`);
      throw e;
    }
  }

  findOne(id: number) {
    return this.charactersCollection.doc(id.toString()).get();
  }

  async query(filter: QueryCharactersDto) {
    const localCount = await this.charactersCollection.count().get();
    const localTotalCount = RNM_COUNT + localCount.data().count;
    const localPage: RnmPage = {
      info: {
        count: localTotalCount,
        pages: Math.ceil(localTotalCount / CHARACTERS_PER_PAGE),
        next: '',
        prev: '',
      },
      results: [],
    };
    const { page, ...remFilter } = filter;
    if ((page || 0) < localPage.info.pages) {
      const nextUrl = new URL('/api/characters', process.env.BASE_URL);
      nextUrl.searchParams.append('page', (+(page || 0) + 1).toString());
      Object.entries(remFilter).forEach(([key, value]) => {
        nextUrl.searchParams.append(key, value.toString());
      });
      localPage.info.next = nextUrl.toString();
    }
    if ((page || 0) > 1) {
      const prevUrl = new URL('/api/characters', process.env.BASE_URL);
      prevUrl.searchParams.append('page', (+(page || 0) - 1).toString());
      Object.entries(remFilter).forEach(([key, value]) => {
        prevUrl.searchParams.append(key, value.toString());
      });
      localPage.info.prev = prevUrl.toString();
    }
    if (page > MAX_RNM_PAGE) {
      const offset = CHARACTERS_PER_PAGE * (page - 1) - RNM_COUNT;
      this.logger.log(`Offset: ${offset}`);
      const gapCharacters = await this.charactersCollection
        .offset(offset)
        .limit(CHARACTERS_PER_PAGE)
        .get();
      localPage.results.push(...gapCharacters.docs.map((doc) => doc.data()));
    } else {
      const rnmPage = await this.rnmClientService.queryCharacters(filter);
      localPage.results.push(
        ...rnmPage.results.map((caracter) => ({
          ...caracter,
          owner: 'api',
        })),
      );
      if (rnmPage.info.pages == page) {
        const gap = CHARACTERS_PER_PAGE - rnmPage.results.length;
        const gapCharacters = await this.charactersCollection.limit(gap).get();
        localPage.results.push(...gapCharacters.docs.map((doc) => doc.data()));
      }
    }
    return localPage;
  }

  update(updateCharacterDto: UpdateCharacterDto) {
    if (updateCharacterDto.id < 1000) {
      throw new Error("It's not a custom character");
    }
    return this.charactersCollection
      .doc(updateCharacterDto.id.toString())
      .update({ ...updateCharacterDto });
  }

  remove(id: number) {
    if (id < 1000) {
      throw new Error("It's not a custom character");
    }
    return this.charactersCollection.doc(id.toString()).delete();
  }
}
