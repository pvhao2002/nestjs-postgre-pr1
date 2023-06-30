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
import { CommentService } from './comment.service';
import { CreateCommentDto } from './dto/create-comment.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { Roles } from 'src/auth/guards/roles.decorator';
import { Role } from 'src/auth/guards/role.enum';

@Controller('comment')
export class CommentController {
  constructor(private readonly commentService: CommentService) {}

  @Post('create')
  @UseGuards(RolesGuard)
  @Roles(Role.Admin, Role.User)
  create(@Body() createCommentDto: CreateCommentDto, @Req() request: Request) {
    const req = request['user'];
    return this.commentService.create(createCommentDto, req.userId);
  }

  @Patch('edit/:id')
  @UseGuards(RolesGuard)
  @Roles(Role.Admin, Role.User)
  update(
    @Param('id') id: string,
    @Body() updateCommentDto: UpdateCommentDto,
    @Req() request: Request,
  ) {
    const req = request['user'];
    return this.commentService.update(id, updateCommentDto, req.userId);
  }

  @Delete('delete/:id')
  @UseGuards(RolesGuard)
  @Roles(Role.Admin, Role.User)
  remove(@Param('id') id: string, @Req() request: Request) {
    const req = request['user'];
    return this.commentService.remove(id, req.userId);
  }

  @Get('post/:id')
  findAllByPostId(@Param('id') id: string) {
    return this.commentService.findAllByPostId(id);
  }
}
