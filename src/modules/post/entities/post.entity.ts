import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  OneToMany,
} from 'typeorm';
import { Profile } from 'src/modules/profile/entities/profile.entity';
import { Comment } from 'src/modules/comment/entities/comment.entity';
import { Reaction } from 'src/modules/reaction/entities/reaction.entity';

@Entity()
export class Post {
  @PrimaryGeneratedColumn()
  id: string;

  @Column({ nullable: true, default: null })
  description?: string;

  @Column({ type: 'varchar', array: true, nullable: true, default: '{}' })
  image?: string[];

  @Column({ nullable: true, default: new Date() })
  createdAt: Date;

  @Column({ nullable: true, default: new Date() })
  updatedAt: Date;

  @Column({ default: 0 })
  likeCount: number;

  @Column({ default: 0 })
  dislikeCount: number;

  @Column({ default: 0 })
  hahaCount: number;

  @Column({ default: 0 })
  loveCount: number;

  @ManyToOne(() => Profile, (profile) => profile.posts)
  profile: Profile;

  @Column({ default: true })
  status: boolean;

  @OneToMany(() => Comment, (comment) => comment.post, { cascade: true })
  comments: Comment[];

  @OneToMany(() => Reaction, (reaction) => reaction.post, { cascade: true })
  reactions: Reaction[];
}
