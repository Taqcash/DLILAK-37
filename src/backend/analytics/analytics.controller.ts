import { Controller, Get, Post, Body } from '@nestjs/common';
import { AnalyticsService } from './analytics.service';

@Controller('analytics')
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Get('health')
  getHealth() {
    return this.analyticsService.getHealthStatus();
  }

  @Post('deep-insights')
  async getDeepInsights(@Body() data: any) {
    return await this.analyticsService.getDeepInsights(data);
  }
}
