import { Controller, Post, UseGuards } from '@nestjs/common';
import { SyncService } from './sync.service';
import { AdminGuard } from 'src/auth/guards/admin.guard';

@Controller('sync')
@UseGuards(AdminGuard)
export class SyncController {
  constructor(private readonly syncService: SyncService) {}

  @Post()
  syncAll(): Promise<{ status: string }> {
    return this.syncService.syncAll();
  }

  @Post('/store')
  syncStores(): Promise<void> {
    return this.syncService.syncStores();
  }

  @Post('/categories')
  syncCategories(): Promise<void> {
    return this.syncService.syncCategories();
  }

  @Post('/products')
  syncProducts(): Promise<void> {
    return this.syncService.syncProducts();
  }
}
