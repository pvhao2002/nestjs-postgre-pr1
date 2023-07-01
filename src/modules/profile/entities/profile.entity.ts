import { Post } from 'src/modules/post/entities/post.entity';
import { User } from 'src/modules/user/entities/user.entity';
import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  OneToOne,
  OneToMany,
  BeforeInsert,
  BeforeUpdate,
  JoinColumn,
} from 'typeorm';

@Entity()
export class Profile {
  @PrimaryGeneratedColumn()
  id: string;

  @Column({ nullable: true })
  userName: string;

  @Column()
  phone: string;

  @Column({ nullable: true })
  address: string;

  @Column({ nullable: true })
  dateOfBirth: Date;

  @Column({ default: '' })
  search: string;

  @OneToOne(() => User, { cascade: true })
  @JoinColumn()
  user: User;

  @OneToMany(() => Post, (post) => post.profile, { cascade: true })
  posts: Post[];
}
