import { Role } from 'src/auth/guards/role.enum';
import { Comment } from 'src/modules/comment/entities/comment.entity';
import { Friend } from 'src/modules/friend/entities/friend.entity';
import { Profile } from 'src/modules/profile/entities/profile.entity';
import { Reaction } from 'src/modules/reaction/entities/reaction.entity';
import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  JoinColumn,
  OneToOne,
  OneToMany,
  Index,
} from 'typeorm';
import { Geometry, Point } from 'geojson';

const THU_DUC_CITY = {
  lat: 10.8298295,
  long: 106.7617899,
};

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: string;

  @Column()
  password: string;

  @Column()
  email: string;

  @Column({ default: true })
  isActive: boolean;

  @Column({ type: 'enum', enum: Role, array: true, default: ['user'] })
  role: Role[];

  @Column({ nullable: true })
  accessToken: string;

  @OneToOne(() => Profile)
  @JoinColumn()
  profile: Profile;

  @Column({ type: 'double precision', default: THU_DUC_CITY.lat })
  lat: number;

  @Column({ type: 'double precision', default: THU_DUC_CITY.long })
  long: number;

  @Index({ spatial: true })
  @Column({
    type: 'geography',
    spatialFeatureType: 'Point',
    srid: 4326,
    nullable: true,
  })
  location: Point = {
    type: 'Point',
    coordinates: [0, 0], // Set default coordinates or provide actual coordinates
  };

  @OneToMany(() => Comment, (comment) => comment.user)
  comments: Comment[];

  @OneToMany(() => Reaction, (reaction) => reaction.user)
  reactions: Reaction[];

  @OneToMany(() => Friend, (friend) => friend.sender)
  sentFriendRequests: Friend[];

  @OneToMany(() => Friend, (friend) => friend.receiver)
  receivedFriendRequests: Friend[];
}
