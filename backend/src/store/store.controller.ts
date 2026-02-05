import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  ParseIntPipe,
  UseGuards,
} from '@nestjs/common';
import { StoreService } from './store.service';
import { CreateStoreDto } from './dto/create-store.dto';
import { UpdateStoreDto } from './dto/update-store.dto';
import { GetStoresFiltersDto } from './dto/get-stores-filters.dto';
import { Store } from './entities/store.entity';
import { AdminGuard } from 'src/auth/guards/admin.guard';

@Controller('store')
export class StoreController {
  constructor(private readonly storeService: StoreService) {}

  @Post()
  @UseGuards(AdminGuard)
  create(@Body() createStoreDto: CreateStoreDto): Promise<void> {
    return this.storeService.create(createStoreDto);
  }

  @Get()
  findAll(
    @Query() getStoresFiltersDto: GetStoresFiltersDto,
  ): Promise<{ data: Store[]; metadata: { total: number } }> {
    return this.storeService.findAll(getStoresFiltersDto);
  }

  @Patch(':id')
  @UseGuards(AdminGuard)
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateStoreDto: UpdateStoreDto,
  ): Promise<Store> {
    return this.storeService.update(id, updateStoreDto);
  }

  @Delete(':id')
  @UseGuards(AdminGuard)
  remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return this.storeService.remove(id);
  }
}
