import { Controller, Get } from '@nestjs/common';
import { HealthService } from './health.service';

@Controller('health')
export class HealthController {
  constructor(private readonly healthService: HealthService) {}

  @Get()
  async getHealth() {
    return this.healthService.getOverallHealth();
  }

  @Get('db')
  async getDatabaseHealth() {
    return this.healthService.getDatabaseHealth();
  }

  @Get('s3')
  async getS3Health() {
    return this.healthService.getS3Health();
  }

  @Get('api')
  async getApiHealth() {
    return this.healthService.getApiHealth();
  }
}