import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';
import { DataSource } from 'typeorm';

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private readonly dataSource: DataSource,
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
}