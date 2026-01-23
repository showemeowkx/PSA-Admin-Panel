import {
  Controller,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Req,
  UseGuards,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateUserDto } from './dto/create-user.dto';
import { SignInDto } from './dto/sing-in.dto';
import { User } from './entities/user.entity';
import { JwtAuthGuard } from './jwt-auth.guard';
import { UpdateUserDto } from './dto/update-user.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { ConfigService } from '@nestjs/config';
import { CloudinaryService } from 'src/cloudinary/cloudinary.service';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly cloudinaryService: CloudinaryService,
    private readonly configService: ConfigService,
  ) {}

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
  @UseInterceptors(FileInterceptor('pfp'))
  async updateProfile(
    @Req() req: { user: User },
    @Body() updateUserDto: UpdateUserDto,
    @UploadedFile() file: Express.Multer.File,
  ): Promise<User> {
    if (file) {
      const user = await this.authService.findOne(req.user.id);
      const oldPfp = user.imagePath;

      if (oldPfp && oldPfp !== this.configService.get('DEFAULT_USER_PFP')) {
        await this.cloudinaryService.deleteFile(oldPfp);
      }

      const result = await this.cloudinaryService.uploadFile(file);
      updateUserDto.imagePath = result.secure_url as string;
    }

    return this.authService.update(req.user.id, updateUserDto);
  }

  @UseGuards(JwtAuthGuard)
  @Delete()
  async deleteProfile(@Req() req: { user: User }): Promise<void> {
    const user = await this.authService.findOne(req.user.id);
    const pfpPath = user.imagePath;

    await this.authService.remove(req.user.id);

    if (pfpPath && pfpPath !== this.configService.get('DEFAULT_USER_PFP')) {
      await this.cloudinaryService.deleteFile(pfpPath);
    }
  }
}
