import { CollectionReference } from '@google-cloud/firestore';
import { Inject, Injectable, Logger } from '@nestjs/common';
import { RnmClientService } from '../rnm-client/rnm-client.service';
import { RnmPage } from '../types';
import { CharacterDocument } from './documents/character.document';
import { CreateCharacterDto } from './dto/create-character.dto';
import { QueryCharactersDto } from './dto/query-characters.dto';
import { UpdateCharacterDto } from './dto/update-character.dto';

const CHARACTERS_PER_PAGE = 20;

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
    const query = this.buildQuery(filter);
    const localCount = (await query.count().get()).data().count;
    const rnmFirstPage = await this.rnmClientService.queryCharacters({
      ...filter,
      page: 1,
    });
    const rnmCount = rnmFirstPage.info.count;
    const totalCount = localCount + rnmCount;
    const maxPage = Math.ceil(totalCount / CHARACTERS_PER_PAGE);
    const maxLocalPage = Math.ceil(localCount / CHARACTERS_PER_PAGE);
    const localPage: RnmPage = {
      info: {
        count: totalCount,
        pages: Math.ceil(totalCount / CHARACTERS_PER_PAGE),
        next: '',
        prev: '',
      },
      results: [],
    };
    if (filter.page > maxPage) {
      return localPage;
    }
    this.buildPrevNextLinks(filter, localPage);
    if (filter.page > maxLocalPage) {
      const drift = localCount - (maxLocalPage - 1) * CHARACTERS_PER_PAGE;
      if (drift === CHARACTERS_PER_PAGE) {
        const rnmPage = await this.rnmClientService.queryCharacters({
          ...filter,
          page: filter.page - maxLocalPage,
        });
        localPage.results.push(
          ...rnmPage.results.map((character) => ({
            ...character,
            owner: 'api',
          })),
        );
      } else {
        const rnmPageValue = filter.page - maxLocalPage;
        const rnmPage1 = await this.rnmClientService.queryCharacters({
          ...filter,
          page: rnmPageValue,
        });
        const rnmPage2 = await this.rnmClientService.queryCharacters({
          ...filter,
          page: rnmPageValue + 1,
        });
        localPage.results.push(
          ...rnmPage1.results
            .slice(drift, CHARACTERS_PER_PAGE)
            .map((character) => ({
              ...character,
              owner: 'api',
            })),
        );
        localPage.results.push(
          ...rnmPage2.results.slice(0, drift).map((character) => ({
            ...character,
            owner: 'api',
          })),
        );
      }
    } else {
      const localCharacters = await this.charactersCollection
        .offset((filter.page - 1) * CHARACTERS_PER_PAGE)
        .limit(CHARACTERS_PER_PAGE)
        .get();
      localPage.results.push(...localCharacters.docs.map((doc) => doc.data()));
      const drift = localCount - (maxLocalPage - 1) * CHARACTERS_PER_PAGE;
      if (filter.page == maxLocalPage && drift !== CHARACTERS_PER_PAGE) {
        const rnmPage = await this.rnmClientService.queryCharacters({
          ...filter,
          page: 1,
        });
        localPage.results.push(
          ...rnmPage.results.slice(0, drift).map((character) => ({
            ...character,
            owner: 'api',
          })),
        );
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

  private buildQuery(filter: QueryCharactersDto) {
    let query = this.charactersCollection.orderBy('id');
    if (filter.name) {
      query = query.where('name', '==', filter.name);
    }
    if (filter.status) {
      query = query.where('status', '==', filter.status);
    }
    if (filter.species) {
      query = query.where('species', '==', filter.species);
    }
    if (filter.type) {
      query = query.where('type', '==', filter.type);
    }
    return query;
  }

  private buildPrevNextLinks(filter: QueryCharactersDto, localPage: RnmPage) {
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
  }
}
