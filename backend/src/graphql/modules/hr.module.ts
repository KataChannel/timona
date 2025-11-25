import { Module } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { HRService } from '../../services/hr.service';
import { UserService } from '../../services/user.service';
import { AuthModule } from '../../auth/auth.module';
import {
  EmployeeProfileResolver,
  OnboardingResolver,
  OffboardingResolver,
  EmploymentHistoryResolver,
  HRStatisticsResolver,
} from '../resolvers/hr';

@Module({
  imports: [AuthModule],
  providers: [
    // Services
    PrismaService,
    HRService,
    UserService, // Required for JwtAuthGuard
    
    // Resolvers
    EmployeeProfileResolver,
    OnboardingResolver,
    OffboardingResolver,
    EmploymentHistoryResolver,
    HRStatisticsResolver,
  ],
  exports: [HRService],
})
export class HRModule {}
