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
  Query,
} from '@nestjs/common';
import { ReactionService } from './reaction.service';
import { CreateReactionDto } from './dto/create-reaction.dto';
import { UpdateReactionDto } from './dto/update-reaction.dto';
import { RolesGuard } from 'src/auth/guards/roles.guard';

@Controller('reaction')
export class ReactionController {
  constructor(private readonly reactionService: ReactionService) {}

  @Post('create')
  @UseGuards(RolesGuard)
  create(
    @Body() createReactionDto: CreateReactionDto,
    @Req() request: Request,
  ) {
    const req = request['user'];
    return this.reactionService.create(createReactionDto, req.userId);
  }

  @Get('post/list/:id')
  findAllReactByPost(@Param('id') postId: string) {
    return this.reactionService.findAllReactByPost(postId);
  }

  @Get('post')
  findReactionTypeByPost(
    @Query('type') type: number,
    @Query('pId') postId: string,
  ) {
    return this.reactionService.findReactionTypeByPost(type, postId);
  }

  @Patch('edit/:id')
  @UseGuards(RolesGuard)
  update(
    @Param('id') id: string,
    @Body() updateReactionDto: UpdateReactionDto,
    @Req() request: Request,
  ) {
    const req = request['user'];
    return this.reactionService.update(id, updateReactionDto, req.userId);
  }

  @Delete('delete/:id')
  @UseGuards(RolesGuard)
  remove(@Param('id') id: string, @Req() request: Request) {
    const req = request['user'];
    return this.reactionService.remove(id, req.userId);
  }
}
