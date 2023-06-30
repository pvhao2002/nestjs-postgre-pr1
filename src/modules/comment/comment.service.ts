import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { CreateCommentDto } from './dto/create-comment.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';
import { Comment } from './entities/comment.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from '../user/entities/user.entity';
import { Profile } from '../profile/entities/profile.entity';
import { Post } from '../post/entities/post.entity';

@Injectable()
export class CommentService {
  constructor(
    @InjectRepository(Comment)
    private commentRepository: Repository<Comment>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Post)
    private postRepository: Repository<Post>,
  ) {}

  async create(createCommentDto: CreateCommentDto, userId: string) {
    const user = await this.userRepository.findOne({
      where: { id: userId },
    });
    const post = await this.postRepository.findOne({
      where: { id: createCommentDto.postId },
    });

    if (!post) {
      throw new NotFoundException('Post not found');
    }

    const comment = this.commentRepository.create({
      content: createCommentDto.content,
      post: post,
      user: user,
    });
    return await this.commentRepository.save(comment);
  }

  findAll() {
    return `This action returns all comment`;
  }

  findOne(id: number) {
    return `This action returns a #${id} comment`;
  }

  async update(id: string, updateCommentDto: UpdateCommentDto, userId: string) {
    const comment = await this.commentRepository.findOne({
      where: { id: id },
      relations: ['user'],
    });

    if (!comment) {
      throw new NotFoundException('Comment not found');
    }

    if (comment.user.id !== userId) {
      throw new UnauthorizedException(
        'User is not authorized to update this comment',
      );
    }

    await this.commentRepository.update(id, {
      content: updateCommentDto.content,
    });

    return {
      message: 'Update comment successfully',
    };
  }

  async remove(id: string, userId: string) {
    const comment = await this.commentRepository.findOne({
      where: { id: id },
      relations: ['user'],
    });

    if (!comment) {
      throw new NotFoundException('Comment not found');
    }

    if (comment.user.id !== userId) {
      throw new UnauthorizedException(
        'User is not authorized to remove this comment',
      );
    }

    await this.commentRepository.update(id, {
      status: false,
    });

    return {
      message: 'Remove comment successfully',
    };
  }

  async findAllByPostId(id: string) {
    const post = await this.postRepository.findOne({
      where: {
        id: id,
        status: true,
        comments: {
          status: true,
        },
      },
      relations: ['comments', 'comments.user'],
    });
    if (!post) {
      throw new NotFoundException('Post not found');
    }
    return post;
  }
}
