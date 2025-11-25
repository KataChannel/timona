import { Module } from '@nestjs/common';
import { PrismaModule } from '../../prisma/prisma.module';
import { AuthModule } from '../../auth/auth.module';
import { ProductService } from '../../services/product.service';
import { CategoryService } from '../../services/category.service';
import { UserService } from '../../services/user.service';
import { ProductResolver } from '../resolvers/product.resolver';
import { CategoryResolver } from '../resolvers/category.resolver';

@Module({
  imports: [PrismaModule, AuthModule],
  providers: [
    ProductService, 
    CategoryService, 
    UserService, // Required for JwtAuthGuard
    ProductResolver, 
    CategoryResolver
  ],
  exports: [ProductService, CategoryService],
})
export class ProductModule {}
