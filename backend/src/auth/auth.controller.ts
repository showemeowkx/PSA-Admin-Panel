import {
  Controller,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Req,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateUserDto } from './dto/create-user.dto';
import { SignInDto } from './dto/sing-in.dto';
import { User } from './entities/user.entity';
import { JwtAuthGuard } from './jwt-auth.guard';
import { UpdateUserDto } from './dto/update-user.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('/register')
  register(@Body() createUserDto: CreateUserDto): Promise<void> {
    return this.authService.register(createUserDto);
  }

  @Post('/signin')
  signIn(@Body() signInDto: SignInDto): Promise<{ accessToken }> {
    return this.authService.signIn(signInDto);
  }

  @UseGuards(JwtAuthGuard)
  @Post('/store/:storeId')
  chooseStore(
    @Req() req: { user: User },
    @Param('storeId') storeId: number,
  ): Promise<void> {
    return this.authService.chooseStore(req.user, storeId);
  }

  @UseGuards(JwtAuthGuard)
  @Patch()
  updateProfile(
    @Req() req: { user: User },
    @Body() updateUserDto: UpdateUserDto,
  ): Promise<User> {
    return this.authService.update(req.user.id, updateUserDto);
  }

  @UseGuards(JwtAuthGuard)
  @Delete()
  deleteProfile(@Req() req: { user: User }): Promise<void> {
    return this.authService.remove(req.user.id);
  }
}
