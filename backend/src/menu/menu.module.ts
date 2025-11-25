import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { MenuService } from './menu.service';
import { MenuResolver } from './menu.resolver';
import { MenuRepository } from './repositories/menu.repository';

@Module({
  imports: [PrismaModule],
  providers: [
    MenuService,
    MenuResolver,
    MenuRepository,
  ],
  exports: [MenuService, MenuResolver, MenuRepository],
})
export class MenuModule {}
