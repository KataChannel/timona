import { Module } from '@nestjs/common';
import { SearchService } from './search.service';
import { SearchController } from './search.controller';
import { OramaService } from './orama.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  providers: [SearchService, OramaService],
  controllers: [SearchController],
  exports: [SearchService, OramaService],
})
export class SearchModule {}