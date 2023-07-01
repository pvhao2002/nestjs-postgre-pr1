import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  SetMetadata,
  ValidationPipe,
} from '@nestjs/common';
import { UsersService } from './user.service';
import { LoginUserInput, SignupUserInput } from 'src/auth/dto/auth.input';
import { Roles } from 'src/auth/guards/roles.decorator';
import { Role } from 'src/auth/guards/role.enum';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { Location } from './dto/location.dto';
import { Geometry, Point } from 'geojson';
const NOMINATIM_URL = 'https://nominatim.openstreetmap.org/';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UsersService) {}

  @Get('search')
  async search(@Body() searchInput: Location) {
    const url = `${NOMINATIM_URL}/reverse?format=jsonv2&lat=${searchInput.lat}&lon=${searchInput.long}`;
    const response = await fetch(url);
    const json = await response.json();
    return json;
  }

  @Post('send-email')
  async sendEmail(@Body('email') email: string) {
    return await this.userService.sendEmail(email);
  }

  @Post('signup')
  create(@Body(new ValidationPipe()) signupUserInput: SignupUserInput) {
    return this.userService.create(signupUserInput);
  }

  @Post('login')
  login(@Body(new ValidationPipe()) LoginUserInput: LoginUserInput) {
    const pointObject: Point = {
      type: 'Point',
      coordinates: [LoginUserInput.long, LoginUserInput.lat],
    };

    return this.userService.login(LoginUserInput, pointObject);
  }

  @Get('list')
  // @UseGuards(RolesGuard)
  // @Roles(Role.Admin)
  findAll() {
    return this.userService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.userService.findOneById(id);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.userService.remove(id);
  }
}
