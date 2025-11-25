import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { PrismaModule } from '../prisma/prisma.module';
import { AuthModule } from '../auth/auth.module';
import { CallCenterService } from '../services/callcenter.service';
import { CallCenterResolver } from '../graphql/resolvers/callcenter.resolver';
import { UserService } from '../services/user.service';

@Module({
  imports: [
    PrismaModule,
    // ScheduleModule.forRoot(), // Moved to AppModule
    AuthModule,
  ],
  providers: [CallCenterService, CallCenterResolver, UserService],
  exports: [CallCenterService],
})
export class CallCenterModule {}
