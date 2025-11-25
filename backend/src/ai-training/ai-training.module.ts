import { Module } from '@nestjs/common';
import { AiTrainingService } from './ai-training.service';
import { AiTrainingController } from './ai-training.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { AuthModule } from '../auth/auth.module';
import { GraphQLResolversModule } from '../graphql/graphql.module';

@Module({
  imports: [PrismaModule, AuthModule, GraphQLResolversModule],
  controllers: [AiTrainingController],
  providers: [AiTrainingService],
  exports: [AiTrainingService],
})
export class AiTrainingModule {}
