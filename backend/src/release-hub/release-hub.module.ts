import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from '../auth/auth.module';
import { PrismaModule } from '../prisma/prisma.module';
import { EcommerceModule } from '../ecommerce/ecommerce.module';
import { UserModule } from '../user/user.module';
import { SystemReleaseService } from './services/system-release.service';
import { TechnicalSupportService } from './services/technical-support.service';
import { SystemGuideService } from './services/system-guide.service';
import { SystemReleaseResolver } from './resolvers/system-release.resolver';
import { TechnicalSupportResolver } from './resolvers/technical-support.resolver';
import { SystemGuideResolver } from './resolvers/system-guide.resolver';

@Module({
  imports: [
    ConfigModule,
    PrismaModule,
    EcommerceModule,
    UserModule,
    AuthModule,
  ],
  providers: [
    SystemReleaseService,
    TechnicalSupportService,
    SystemGuideService,
    SystemReleaseResolver,
    TechnicalSupportResolver,
    SystemGuideResolver,
  ],
  exports: [SystemReleaseService, TechnicalSupportService, SystemGuideService],
})
export class ReleaseHubModule {}
