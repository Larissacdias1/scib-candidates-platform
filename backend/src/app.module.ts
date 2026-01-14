import { Module, Logger } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CandidatesModule } from './candidates/candidates.module';

const dbPath = process.env.DB_PATH || 'data/candidates.sqlite';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'sqlite',
      database: dbPath,
      autoLoadEntities: true,
      synchronize: true,
    }),
    CandidatesModule,
  ],
})
export class AppModule {
  private readonly logger = new Logger(AppModule.name);

  constructor() {
    this.logger.log(`Database path: ${dbPath}`);
  }
}
