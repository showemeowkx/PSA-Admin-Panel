import {
  Controller,
  Get,
  // Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  ParseIntPipe,
  UseGuards,
  Logger,
} from '@nestjs/common';
import { StoreService } from './store.service';
import { CreateStoreDto } from './dto/create-store.dto';
import { UpdateStoreDto } from './dto/update-store.dto';
import { GetStoresFiltersDto } from './dto/get-stores-filters.dto';
import { Store } from './entities/store.entity';
import { AdminGuard } from 'src/auth/guards/admin.guard';
import { CacheTTL } from '@nestjs/cache-manager';

@Controller('store')
export class StoreController {
  private logger = new Logger(StoreController.name);
  constructor(private readonly storeService: StoreService) {}

  // @Post()
  @UseGuards(AdminGuard)
  create(@Body() createStoreDto: CreateStoreDto): Promise<void> {
    this.logger.verbose(
      `Creating a store... {ukrskladId: ${createStoreDto.ukrskladId}}`,
    );
    return this.storeService.create(createStoreDto);
  }

  @Get()
  @CacheTTL(60 * 60 * 1000)
  findAll(@Query() getStoresFiltersDto: GetStoresFiltersDto): Promise<{
    data: Store[];
    metadata: {
      total: number;
      page: number;
      limit: number;
      totalPages: number;
    };
  }> {
    this.logger.verbose('Getting all stores...');
    return this.storeService.findAll(getStoresFiltersDto);
  }

  @Patch(':id')
  @UseGuards(AdminGuard)
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateStoreDto: UpdateStoreDto,
  ): Promise<Store> {
    this.logger.verbose(`Updating a store... {storeId: ${id}}`);
    return this.storeService.update(id, updateStoreDto);
  }

  @Delete(':id')
  @UseGuards(AdminGuard)
  remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
    this.logger.verbose(`Deleting a store... {storeId: ${id}}`);
    return this.storeService.remove(id);
  }
}
