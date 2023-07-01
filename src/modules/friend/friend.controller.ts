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
} from '@nestjs/common';
import { FriendService } from './friend.service';
import { CreateFriendDto } from './dto/create-friend.dto';
import { RemoveFriendDto, UpdateFriendDto } from './dto/update-friend.dto';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { SearchFriendDto } from './dto/search-friend.dto';

@Controller('friend')
export class FriendController {
  constructor(private readonly friendService: FriendService) {}

  @Get('list')
  @UseGuards(RolesGuard)
  findAll(@Req() request: Request) {
    const req = request['authUser'];
    return this.friendService.findAll(req);
  }

  @Get('list-request')
  @UseGuards(RolesGuard)
  findAllRequest(@Req() request: Request) {
    const req = request['authUser'];
    return this.friendService.findAllRequest(req);
  }

  @Post('range')
  async getRange(@Body() location: any) {
    return this.friendService.getRange(location.lat, location.long);
  }

  @Get('list-friend-recommend')
  @UseGuards(RolesGuard)
  findAllFriendRecommend(
    @Req() request: Request,
    @Body() searchFriendDto: SearchFriendDto,
  ) {
    const req = request['authUser'];
    return this.friendService.findRecommendedFriends(req, searchFriendDto);
  }

  @Post('send-request')
  @UseGuards(RolesGuard)
  create(@Body() createFriendDto: CreateFriendDto, @Req() request: Request) {
    const req = request['authUser'];
    return this.friendService.create(createFriendDto, req);
  }

  @Patch('confirm-request')
  @UseGuards(RolesGuard)
  update(@Body() updateFriendDto: UpdateFriendDto, @Req() request: Request) {
    const req = request['authUser'];
    return this.friendService.update(updateFriendDto, req);
  }

  @Delete('remove-friend')
  @UseGuards(RolesGuard)
  remove(@Body() friendDto: RemoveFriendDto, @Req() request: Request) {
    const req = request['authUser'];
    return this.friendService.remove(friendDto.friendId, req);
  }
}
