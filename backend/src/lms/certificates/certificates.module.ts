import { Module } from '@nestjs/common';
import { PrismaModule } from '../../prisma/prisma.module';
import { CertificatesService } from './certificates.service';
import { CertificatesResolver } from './certificates.resolver';
import { AuthModule } from '../../auth/auth.module';
import { UserService } from '../../services/user.service';

@Module({
  imports: [PrismaModule, AuthModule],
  providers: [CertificatesService, CertificatesResolver, UserService],
  exports: [CertificatesService],
})
export class CertificatesModule {}
