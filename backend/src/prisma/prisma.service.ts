import { Injectable, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit {
  constructor(private configService: ConfigService) {
    super({
      datasources: {
        db: {
          url: process.env.DATABASE_URL || 'postgresql://user:password@localhost:5432/db',
        },
      },
    });
  }

  async onModuleInit() {
    await this.$connect();
    console.log('✅ Connected to database');
    const dbUrl = this.configService?.get('DATABASE_URL') || process.env.DATABASE_URL;
    if (dbUrl) {
      console.log(`📊 Database URL: ${dbUrl.replace(/:[^:@]*@/, ':***@')}`);
    }
  }

  async enableShutdownHooks(app: any) {
    // For Prisma 5.0+, use process events instead of $on
    process.on('beforeExit', async () => {
      await app.close();
    });
  }
}
