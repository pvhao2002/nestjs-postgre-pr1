import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Req,
  UnauthorizedException,
} from '@nestjs/common';
import { ProfileService } from './profile.service';
import { CreateProfileDto } from './dto/create-profile.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { UsersService } from '../user/user.service';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { Role } from 'src/auth/guards/role.enum';
import { Roles } from 'src/auth/guards/roles.decorator';

@Controller('profile')
export class ProfileController {
  constructor(
    private readonly profileService: ProfileService,
    private readonly usersService: UsersService,
  ) {}

  @Post('create')
  create(@Body() createProfileDto: CreateProfileDto) {
    return this.profileService.create(createProfileDto);
  }

  @Get('search')
  async search(
    @Body('search') search: string,
  ) {
    return await this.profileService.search(search);
  }

  @Get()
  @UseGuards(RolesGuard)
  @Roles(Role.Admin, Role.User)
  async getProfile(@Req() request: Request) {
    // Access the user payload from the request object
    const userTmp = request['user'];

    // Find the user in the database
    const user = await this.usersService.findOneById(userTmp.userId);
    // If the user is not found, throw an unauthorized exception
    if (!user) {
      throw new UnauthorizedException('Invalid token');
    }
    if (!user.profile) {
      return {
        message: 'User has not profile yet',
      };
    }
    return user.profile;
  }

  @Patch('edit')
  @Roles(Role.Admin, Role.User)
  @UseGuards(RolesGuard)
  async update(
    @Req() request: Request,
    @Body() updateProfileDto: UpdateProfileDto,
  ) {
    // Access the user payload from the request object
    const userTmp = request['user'];
    // Find the user in the database
    const user = await this.usersService.findOneById(userTmp.userId);
    return {
      mess: this.profileService.update(
        user.id,
        user.profile?.id,
        updateProfileDto,
      ),
    };
  }
}
