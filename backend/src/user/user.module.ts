import { Module, forwardRef } from '@nestjs/common';
import { UserService } from '../services/user.service';
import { PrismaModule } from '../prisma/prisma.module';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [
    PrismaModule,
    forwardRef(() => AuthModule), // Avoid circular dependency
  ],
  providers: [UserService],
  exports: [UserService],
})
export class UserModule {}
