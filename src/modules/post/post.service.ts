import {
  Injectable,
  UploadedFile,
  UploadedFiles,
  UseInterceptors,
} from '@nestjs/common';
import { countBy } from 'lodash';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto, UploadFile } from './dto/update-post.dto';
import { Profile } from '../profile/entities/profile.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Post } from './entities/post.entity';
import { Repository } from 'typeorm';
import { User } from '../user/entities/user.entity';
import { DEFAULT_IMAGE_POST } from 'src/auth/constants/constants';
import { FileInterceptor } from '@nestjs/platform-express';
import cloudinary from 'src/config/cloudinary.config';

@Injectable()
export class PostService {
  constructor(
    @InjectRepository(Post)
    private postRepository: Repository<Post>,
    @InjectRepository(Profile)
    private profileRepository: Repository<Profile>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async create(
    createPostDto: CreatePostDto,
    userId: string,
    @UploadedFiles() uploadFiles: Express.Multer.File[],
  ) {
    const user = await this.userRepository.findOne({
      where: { id: userId },
      relations: ['profile'],
    });
    const listImg = await this.upload(uploadFiles);

    const post = await this.postRepository.create({
      description: createPostDto.description,
      profile: user.profile,
      image: listImg,
    });
    return await this.postRepository.save(post);
  }

  async upload(@UploadedFiles() uploadFiles: Express.Multer.File[]) {
    if (!uploadFiles || uploadFiles.length === 0) {
      console.log('No files provided');
      return;
    }
    const imageList = [];
    await Promise.all(
      uploadFiles.map(async (file) => {
        const image = await cloudinary.uploader.upload(file.path);
        imageList.push(image.secure_url);
      }),
    );
    return imageList;
  }

  async findOne(id: string) {
    try {
      const post = await this.postRepository.findOne({
        where: { id: id, status: true },
        relations: ['profile'],
      });
      if (!post) {
        return {
          message: 'Post not found',
        };
      }
      return {
        ...post,
      };
    } catch (error) {
      return error;
    }
  }

  async update(
    id: string,
    updatePostDto: UpdatePostDto,
    @UploadedFiles() uploadFiles: Express.Multer.File[],
  ): Promise<any> {
    try {
      const imageList = await this.upload(uploadFiles);
      await this.postRepository.update(
        { id: id },
        {
          ...updatePostDto,
          updatedAt: new Date(),
          image: imageList,
        },
      );

      return {
        message: 'Update post successfully',
      };
    } catch (error) {
      return error;
    }
  }

  async remove(id: string) {
    try {
      return this.postRepository.update({ id: id }, { status: false });
    } catch (error) {
      return error;
    }
  }

  async findAllByProfileId(profileId: string): Promise<Post[]> {
    try {
      const posts = await this.postRepository.find({
        where: {
          profile: {
            id: profileId,
          },
          status: true,
        },
        relations: ['profile'],
      });
      return posts;
    } catch (error) {
      return error;
    }
  }
}
