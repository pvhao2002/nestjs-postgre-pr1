import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserModule } from './modules/user/user.module';
import { User } from './modules/user/entities/user.entity';
import { Profile } from './modules/profile/entities/profile.entity';
import { ProfileModule } from './modules/profile/profile.module';
import { Post } from './modules/post/entities/post.entity';
import { PostModule } from './modules/post/post.module';
import { CommentModule } from './modules/comment/comment.module';
import { Comment } from './modules/comment/entities/comment.entity';
import { Reaction } from './modules/reaction/entities/reaction.entity';
import { ReactionModule } from './modules/reaction/reaction.module';
import { Friend } from './modules/friend/entities/friend.entity';
import { FriendModule } from './modules/friend/friend.module';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: 'localhost',
      port: 5432,
      username: 'postgres',
      password: '123',
      database: 'test',
      entities: [User, Profile, Post, Comment, Reaction, Friend],
      autoLoadEntities: true,
      synchronize: true,
    }),
    UserModule,
    ProfileModule,
    PostModule,
    CommentModule,
    ReactionModule,
    FriendModule,
  ],
})
export class AppModule {}
