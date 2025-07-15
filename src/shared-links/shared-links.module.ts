import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SharedLink } from './entities/shared-link.entity';
import { SharedLinksService } from './shared-links.service';
import { SharedLinksController } from './shared-links.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([SharedLink]),
  ],
  providers: [SharedLinksService],
  controllers: [SharedLinksController],
})
export class SharedLinksModule {}