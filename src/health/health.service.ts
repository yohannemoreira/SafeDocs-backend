import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { S3Client, HeadBucketCommand } from '@aws-sdk/client-s3';

@Injectable()
export class HealthService {
  private s3Client: S3Client;

  constructor(
    @InjectDataSource()
    private dataSource: DataSource,
  ) {
    const accessKeyId = process.env.AWS_ACCESS_KEY_ID;
    const secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY;
    const s3Config: any = {
      region: process.env.AWS_REGION || 'us-east-1',
    };
    if (accessKeyId && secretAccessKey) {
      s3Config.credentials = {
        accessKeyId,
        secretAccessKey,
      };
    }
    this.s3Client = new S3Client(s3Config);
  }

  async getOverallHealth() {
    const [dbHealth, s3Health, apiHealth] = await Promise.all([
      this.getDatabaseHealth(),
      this.getS3Health(),
      this.getApiHealth(),
    ]);

    const isHealthy = dbHealth.status === 'healthy' && 
                     s3Health.status === 'healthy' && 
                     apiHealth.status === 'healthy';

    return {
      status: isHealthy ? 'healthy' : 'unhealthy',
      timestamp: new Date().toISOString(),
      services: {
        database: dbHealth,
        s3: s3Health,
        api: apiHealth,
      },
    };
  }

  async getDatabaseHealth() {
    try {
      await this.dataSource.query('SELECT 1');
      return {
        status: 'healthy',
        message: 'Database connection successful',
        database: this.dataSource.options.database,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      return {
        status: 'unhealthy',
        message: 'Database connection failed',
        error: error.message,
        timestamp: new Date().toISOString(),
      };
    }
  }

  async getS3Health() {
    try {
      const bucketName = process.env.S3_BUCKET_NAME;
      if (!bucketName) {
        throw new Error('S3_BUCKET_NAME not configured');
      }

      await this.s3Client.send(new HeadBucketCommand({ Bucket: bucketName }));
      
      return {
        status: 'healthy',
        message: 'S3 connection successful',
        bucket: bucketName,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      return {
        status: 'unhealthy',
        message: 'S3 connection failed',
        error: error.message,
        timestamp: new Date().toISOString(),
      };
    }
  }

  async getApiHealth() {
    return {
      status: 'healthy',
      message: 'API is running',
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      nodeVersion: process.version,
      timestamp: new Date().toISOString(),
    };
  }
}