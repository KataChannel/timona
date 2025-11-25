import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { GrokService } from './grok.service';

@Module({
  imports: [ConfigModule],
  providers: [GrokService],
  exports: [GrokService],
})
export class GrokModule {}
