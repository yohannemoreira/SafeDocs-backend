import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';
import { DataSource } from 'typeorm';
import { S3Service } from '../common/aws/s3.service';

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private readonly dataSource: DataSource,
    private readonly s3Service: S3Service,
  ) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Get('health/db')
  async checkDatabase() {
    try {
      const isConnected = this.dataSource.isInitialized;
      return {
        status: 'connected',
        database: this.dataSource.options.database,
        isInitialized: isConnected,
      };
    } catch (error) {
      return {
        status: 'error',
        message: error.message,
      };
    }
  }

  @Get('health/s3')
  async checkS3Connection() {
    try {
      // Gera uma URL pré-assinada para testar a conexão
      const result = await this.s3Service.generatePresignedUploadUrl('test.txt', 'text/plain');
      
      return {
        status: 'success',
        message: 'S3 connection is working',
        bucket: result.signedUrl.includes('safedocs-storage-bucket') ? 'safedocs-storage-bucket' : 'unknown',
        hasValidUrl: result.signedUrl.startsWith('https://'),
      };
    } catch (error) {
      return {
        status: 'error',
        message: error.message,
        details: 'Failed to connect to S3. Check your AWS credentials and bucket configuration.',
      };
    }
  }
}