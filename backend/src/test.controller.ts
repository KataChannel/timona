import { Controller, Get } from '@nestjs/common';

@Controller('test')
export class TestController {
  @Get('ping')
  ping() {
    return { message: 'pong', timestamp: new Date().toISOString() };
  }
}