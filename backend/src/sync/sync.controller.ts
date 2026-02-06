import { Body, Controller, Get, Logger, Post, UseGuards } from '@nestjs/common';
import { SyncService } from './sync.service';
import { AdminGuard } from 'src/auth/guards/admin.guard';
import { CronTime } from 'cron';

@Controller('sync')
@UseGuards(AdminGuard)
export class SyncController {
  private logger = new Logger(SyncController.name);
  constructor(private readonly syncService: SyncService) {}

  @Post()
  syncAll(): Promise<{ status: string }> {
    return this.syncService.syncAll();
  }

  @Post('/store')
  syncStores(): Promise<{ status: string; errors: string[] }> {
    this.logger.verbose('Syncing stores manually...');
    return this.syncService.syncStores();
  }

  @Post('/categories')
  syncCategories(): Promise<{ status: string; errors: string[] }> {
    this.logger.verbose('Syncing categories manually...');
    return this.syncService.syncCategories();
  }

  @Post('/products')
  syncProducts(): Promise<{ status: string; errors: string[] }> {
    this.logger.verbose('Syncing products manually...');
    return this.syncService.syncProducts();
  }

  @Get('/config')
  getSyncStatus(): {
    running: boolean;
    nextRun: Date | null;
    lastRun: Date | null;
    period: CronTime | null;
  } {
    this.logger.verbose('Getting sync config status...');
    return this.syncService.getSyncStatus();
  }

  @Post('/config')
  updateConfig(@Body() body: { cronExpression: string }): {
    status: string;
    message: string;
  } {
    this.logger.verbose(
      `Updating schedule period... {cron: ${body.cronExpression}}`,
    );
    this.syncService.addCronJob(body.cronExpression);
    return {
      status: 'success',
      message: `Schedule updated to ${body.cronExpression}`,
    };
  }

  @Post('/toggle')
  toggleAutoSync(@Body() body: { enabled: boolean }): Promise<void> {
    this.logger.verbose(`Toggling auto sync... {enabled: ${body.enabled}}`);
    return this.syncService.setSyncState(body.enabled);
  }
}
