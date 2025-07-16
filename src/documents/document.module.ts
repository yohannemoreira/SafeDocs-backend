import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Document } from './entities/document.entity';
import { DocumentsService } from './document.service';
import { DocumentsController } from './document.controller';
import { AwsModule } from '../common/aws/aws.module'; // 1. Importe o AwsModule

@Module({
  imports: [TypeOrmModule.forFeature([Document]), AwsModule],
  providers: [DocumentsService],
  controllers: [DocumentsController],
  exports: [DocumentsService],
})
export class DocumentsModule {}
