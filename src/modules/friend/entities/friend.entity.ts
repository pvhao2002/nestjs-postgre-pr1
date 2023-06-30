import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { TypeFriend } from './friend.enum';
import { User } from 'src/modules/user/entities/user.entity';

@Entity()
export class Friend {
  @PrimaryGeneratedColumn()
  id: string;

  @Column()
  type: TypeFriend;

  @ManyToOne(() => User, { eager: true })
  sender: User;

  @ManyToOne(() => User, { eager: true })
  receiver: User;
}
