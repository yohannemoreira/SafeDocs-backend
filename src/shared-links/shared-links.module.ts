import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SharedLink } from './entities/shared-link.entity';
import { SharedLinksService } from './shared-links.service';
import { SharedLinksController } from './shared-links.controller';
import { DocumentsModule } from '../documents/document.module'; // 1. Importe o DocumentsModule
import { AwsModule } from '../common/aws/aws.module'; // 2. Importe o AwsModule

@Module({
  imports: [
    TypeOrmModule.forFeature([SharedLink]),
    DocumentsModule, // 3. Adicione aos imports para usar o DocumentsService
    AwsModule, // 4. Adicione para usar o S3Service
  ],
  providers: [SharedLinksService],
  controllers: [SharedLinksController],
})
export class SharedLinksModule {}
