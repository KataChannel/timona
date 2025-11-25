import { Module } from '@nestjs/common';
import { InvoiceExportController } from './invoice-export.controller';
import { InvoiceExportService } from './invoice-export.service';
import { ProductNormalizationService } from './product-normalization.service';
import { ProductNormalizationResolver } from './product-normalization.resolver';
import { PrismaModule } from '../prisma/prisma.module';
import { AuthModule } from '../auth/auth.module';
import { UserService } from '../services/user.service';

@Module({
  imports: [PrismaModule, AuthModule],
  controllers: [InvoiceExportController],
  providers: [
    InvoiceExportService,
    ProductNormalizationService,
    ProductNormalizationResolver,
    UserService, // Required for JwtAuthGuard
  ],
  exports: [InvoiceExportService, ProductNormalizationService],
})
export class KetoAnModule {}