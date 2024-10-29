import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AppService } from './app.service';
import { CharactersModule } from './characters/characters.module';
import { FirestoreModule } from './firestore/firestore.module';
import { RnmClientService } from './rnm-client/rnm-client.service';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    FirestoreModule.forRoot({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => {
        console.log('SA_KEY', configService.get<string>('SA_KEY'));
        return {
          projectId: configService.get<string>('PROJECT_ID'),
          keyFilename: configService.get<string>('SA_KEY'),
        };
      },
      inject: [ConfigService],
    }),
    CharactersModule,
  ],
  providers: [AppService, RnmClientService],
})
export class AppModule {}
