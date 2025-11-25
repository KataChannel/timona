import { Module } from '@nestjs/common';
import { CommonServicesModule } from '../common/common-services.module';
import { RealTimeGateway } from './real-time.gateway';
import { PresenceService } from './presence.service';
import { CollaborationService } from './collaboration.service';
import { RealTimeNotificationService } from './real-time-notification.service';

@Module({
  imports: [CommonServicesModule],
  providers: [
    RealTimeGateway,
    PresenceService,
    CollaborationService,
    RealTimeNotificationService,
  ],
  exports: [
    PresenceService,
    CollaborationService,
    RealTimeNotificationService,
  ],
})
export class RealTimeModule {}