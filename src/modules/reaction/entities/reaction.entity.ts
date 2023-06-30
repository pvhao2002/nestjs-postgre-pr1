import { Post } from 'src/modules/post/entities/post.entity';
import { User } from 'src/modules/user/entities/user.entity';
import { Entity, Column, PrimaryGeneratedColumn, ManyToOne } from 'typeorm';
import { TypeReaction } from './reaction.enum';

@Entity()
export class Reaction {
  @PrimaryGeneratedColumn()
  id: string;

  @Column({ default: TypeReaction.NONE })
  type: TypeReaction;

  @Column({ default: true })
  status: boolean;

  @ManyToOne(() => User, (user) => user.reactions)
  user: User;

  @ManyToOne(() => Post, (post) => post.reactions)
  post: Post;
}
