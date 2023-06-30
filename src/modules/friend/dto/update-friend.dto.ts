import { PartialType } from '@nestjs/mapped-types';
import { CreateFriendDto } from './create-friend.dto';
import { TypeFriend } from '../entities/friend.enum';

export class UpdateFriendDto extends PartialType(CreateFriendDto) {
  senderId: string;
}

export class RemoveFriendDto {
  friendId: string;
}
