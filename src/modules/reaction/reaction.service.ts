import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateReactionDto } from './dto/create-reaction.dto';
import { UpdateReactionDto } from './dto/update-reaction.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Reaction } from './entities/reaction.entity';
import { Repository } from 'typeorm';
import { User } from '../user/entities/user.entity';
import { Post } from '../post/entities/post.entity';
import { TypeReaction } from './entities/reaction.enum';

@Injectable()
export class ReactionService {
  constructor(
    @InjectRepository(Reaction)
    private readonly reactionRepository: Repository<Reaction>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Post)
    private readonly postRepository: Repository<Post>,
  ) {}

  private async checkValidTypeReaction(type: TypeReaction) {
    switch (type) {
      case TypeReaction.LIKE:
        return true;
      case TypeReaction.DISLIKE:
        return true;
      case TypeReaction.LOVE:
        return true;
      case TypeReaction.HAHA:
        return true;
      default:
        return false;
    }
  }

  async create(createReactionDto: CreateReactionDto, userId: string) {
    const validType = await this.checkValidTypeReaction(createReactionDto.type);
    if (!validType) {
      throw new NotFoundException('Invalid type reaction');
    }
    const post = await this.postRepository.findOne({
      where: { id: createReactionDto.postId, status: true },
    });

    if (!post) {
      throw new NotFoundException('Post not found');
    }

    const reaction = await this.reactionRepository.findOne({
      where: {
        user: {
          id: userId,
        },
        post: {
          id: createReactionDto.postId,
          status: true,
        },
        status: true,
      },
    });
    if (reaction) {
      // If the user has already reacted, update the type of reaction
      await this.updateNumberReaction(
        post,
        createReactionDto.type,
        reaction.type,
      );
      const rs = await this.reactionRepository.update(
        { id: reaction.id },
        {
          type: createReactionDto.type,
        },
      );
      return rs;
    }

    const user = await this.userRepository.findOne({
      where: { id: userId },
      relations: ['reactions'],
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }
    const reaction1 = this.reactionRepository.create({
      type: createReactionDto.type,
      user,
      post: post,
    });
    await this.updateNumberReaction(post, createReactionDto.type);
    return await this.reactionRepository.save(reaction1);
  }

  private async updateNumberReaction(
    post: Post,
    typeNew: TypeReaction,
    typeOld?: TypeReaction,
  ) {
    switch (typeNew) {
      case TypeReaction.LIKE:
        post.likeCount = ++post.likeCount || 0;
        break;
      case TypeReaction.DISLIKE:
        post.dislikeCount = ++post.dislikeCount || 0;
        break;
      case TypeReaction.LOVE:
        post.loveCount = ++post.loveCount || 0;
        break;
      case TypeReaction.HAHA:
        post.hahaCount = ++post.hahaCount || 0;
        break;
      default:
        break;
    }
    if (typeOld) {
      switch (typeOld) {
        case TypeReaction.LIKE:
          post.likeCount = --post.likeCount || 0;
          break;
        case TypeReaction.DISLIKE:
          post.dislikeCount = --post.dislikeCount || 0;
          break;
        case TypeReaction.LOVE:
          post.loveCount = --post.loveCount || 0;
          break;
        case TypeReaction.HAHA:
          post.hahaCount = --post.hahaCount || 0;
          break;
        default:
          break;
      }
    }
    return await this.postRepository.save(post);
  }

  findAll() {
    return `This action returns all reaction`;
  }

  findOne(id: number) {
    return `This action returns a #${id} reaction`;
  }

  async findReactionTypeByPost(type: TypeReaction, postId: string) {
    const reaction = await this.reactionRepository.find({
      where: { post: { id: postId, status: true }, type: type, status: true },
    });
    console.log(reaction);
    return {
      reaction,
    };
  }

  async findAllReactByPost(postId: string) {
    return await this.reactionRepository.find({
      where: { post: { id: postId, status: true }, status: true },
      relations: ['post'],
    });
  }

  async update(
    id: string,
    updateReactionDto: UpdateReactionDto,
    userId: string,
  ) {
    try {
      const reaction = await this.reactionRepository.update(
        { id: id, status: true, user: { id: userId } },
        {
          type: updateReactionDto.type,
        },
      );
      return reaction;
    } catch (error) {
      return error;
    }
  }

  async remove(id: string, userId: string) {
    const reaction = await this.reactionRepository.update(
      { id: id, status: true, user: { id: userId } },
      {
        status: false,
      },
    );
    return reaction;
  }
}
