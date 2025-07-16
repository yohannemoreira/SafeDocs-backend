import { Module } from '@nestjs/common';
import { S3Service } from './s3.service';

@Module({
  providers: [S3Service],
  exports: [S3Service], // Exporta o serviço para que outros módulos possam usá-lo
})
export class AwsModule {}
