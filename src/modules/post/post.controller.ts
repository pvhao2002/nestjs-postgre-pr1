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
  UseInterceptors,
  UploadedFiles,
} from '@nestjs/common';
import { PostService } from './post.service';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto, UploadFile } from './dto/update-post.dto';
import { Roles } from 'src/auth/guards/roles.decorator';
import { Role } from 'src/auth/guards/role.enum';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import {
  FileFieldsInterceptor,
  FileInterceptor,
} from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { log } from 'console';

@Controller('post')
export class PostController {
  constructor(private readonly postService: PostService) {}

  @Post('create')
  @UseGuards(RolesGuard)
  @Roles(Role.Admin, Role.User)
  @UseInterceptors(FileFieldsInterceptor([{ name: 'image', maxCount: 10 }]))
  create(
    @Body() createPostDto: CreatePostDto,
    @Req() request: Request,
    @UploadedFiles()
    files: {
      image?: Express.Multer.File[];
    },
  ) {
    const req = request['user'];
    console.log(req);

    return this.postService.create(createPostDto, req.userId, files.image);
  }

  @Get('detail/:id')
  async findOne(@Param('id') id: string) {
    return await this.postService.findOne(id);
  }

  @Get('list/:id')
  findAll(@Param('id') profileId: string) {
    return this.postService.findAllByProfileId(profileId);
  }

  @Patch('edit/:id')
  @UseGuards(RolesGuard)
  @Roles(Role.Admin, Role.User)
  @UseInterceptors(
    FileFieldsInterceptor([{ name: 'image', maxCount: 10 }], {
      storage: diskStorage({
        destination: './uploads',
        filename: (req, file, cb) => {
          // Generating a 32 random chars long string
          const randomName = Array(32)
            .fill(null)
            .map(() => Math.round(Math.random() * 16).toString(16))
            .join('');
          //Calling the callback passing the random name generated with the original extension name
          cb(null, `${randomName}${extname(file.originalname)}`);
        },
      }),
    }),
  )
  async update(
    @Param('id') id: string,
    @Body() updatePostDto: UpdatePostDto,
    @UploadedFiles()
    files: {
      image?: Express.Multer.File[];
    },
  ) {
    return this.postService.update(id, updatePostDto, files.image);
  }

  @Delete('delete/:id')
  @UseGuards(RolesGuard)
  @Roles(Role.Admin, Role.User)
  remove(@Param('id') id: string) {
    return this.postService.remove(id);
  }
}
