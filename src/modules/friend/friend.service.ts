import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateFriendDto } from './dto/create-friend.dto';
import { UpdateFriendDto } from './dto/update-friend.dto';
import { User } from '../user/entities/user.entity';
import { Friend } from './entities/friend.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { TypeFriend } from './entities/friend.enum';
import { SearchFriendDto } from './dto/search-friend.dto';
const DEFAULT_RANGE = 10; // unit meters, default 10km

@Injectable()
export class FriendService {
  constructor(
    @InjectRepository(Friend)
    private readonly friendRepository: Repository<Friend>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  public async findRecommendedFriends(
    user: User,
    searchFriendDto: SearchFriendDto,
  ): Promise<User[]> {
    const { distance } = searchFriendDto;
    const subquery = await this.friendRepository
      .createQueryBuilder('friend')
      .select('friend.senderId')
      .where('friend.receiverId = :userId', { userId: user.id })
      .getQuery();

    const recommendedFriends = await this.userRepository
      .createQueryBuilder('user')
      .select([
        'user.id',
        'user.email',
        'user.lat',
        'user.long',
        `ST_Distance(user.location, ST_SetSRID(ST_GeomFromGeoJSON(:origin), ST_SRID(user.location))) / 1000 AS distance`,
      ])
      .leftJoin('user.sentFriendRequests', 'sentRequest')
      .leftJoin('user.receivedFriendRequests', 'receivedRequest')
      .where('user.id != :userId', { userId: user.id })
      .andWhere(
        `ST_DWithin(user.location, ST_SetSRID(ST_GeomFromGeoJSON(:origin1), ST_SRID(user.location)), :range)`,
      )
      .andWhere('sentRequest.id IS NULL')
      .andWhere('receivedRequest.id IS NULL')
      .andWhere(`user.id NOT IN (${subquery})`)
      .orderBy('distance', 'ASC')
      .setParameters({
        origin: JSON.stringify(user.location),
        range: distance * 1000, // Convert km to meters,
        origin1: JSON.stringify(user.location),
      })
      .getRawMany();
    return recommendedFriends;
  }

  public async getRange(
    lat: number,
    long: number,
    range: number = DEFAULT_RANGE,
  ) {
    const origin = {
      type: 'Point',
      coordinates: [long, lat],
    };

    console.log(JSON.stringify(origin));

    const locations = await this.userRepository
      .createQueryBuilder('user')
      .select([
        'user.id',
        'user.email',
        'user.lat',
        'user.long',
        `ST_Distance(user.location, ST_SetSRID(ST_GeomFromGeoJSON(:origin), ST_SRID(user.location))) / 1000 AS distance`,
      ])
      .where(
        `ST_DWithin(user.location, ST_SetSRID(ST_GeomFromGeoJSON(:origin), ST_SRID(user.location)), :range)`,
      )
      .orderBy('distance', 'ASC')
      .setParameters({
        origin: JSON.stringify(origin),
        range: range * 1000, // Convert km to meters
      })
      .getRawMany();

    return locations;
  }

  async findAllRequest(req: User) {
    const listRequest = await this.friendRepository.find({
      where: [
        {
          receiver: { id: req.id },
          type: TypeFriend.REQUEST_FRIEND,
        },
      ],
      relations: ['sender'],
    });

    return listRequest.map((request) => request.sender);
  }
  async findAll(user: User): Promise<User[]> {
    const userId = user.id;
    const friends = await this.friendRepository.find({
      where: [
        {
          sender: { id: userId },
          type: TypeFriend.IS_FRIEND,
        },
      ],
      relations: ['receiver'],
    });
    const users = friends.map((friend) => friend.receiver);
    return users;
  }

  async create(createFriendDto: CreateFriendDto, user: User) {
    const { receiverId } = createFriendDto;
    // check is friend
    if (user.id === receiverId) {
      throw new BadRequestException(
        `You cannot send request friend to yourself!`,
      );
    }

    const receiver = await this.userRepository.findOne({
      where: { id: receiverId },
    });
    if (!receiver) {
      throw new BadRequestException(`Receiver not found!`);
    }

    const checkExistFriend = await this.friendRepository.findOne({
      where: [
        {
          sender: { id: user.id },
          receiver: { id: receiverId },
        },
        {
          sender: { id: receiverId },
          receiver: { id: user.id },
        },
      ],
    });
    if (checkExistFriend) {
      throw new BadRequestException(
        `You cannot send request friend. You are friend or send request before or need confirm request!`,
      );
    }

    // send request friend
    const friend = this.friendRepository.create({
      type: TypeFriend.REQUEST_FRIEND,
      sender: user,
      receiver: receiver,
    });
    const friend1 = this.friendRepository.create({
      type: TypeFriend.CONFIRM_FRIEND,
      sender: receiver,
      receiver: user,
    });
    await this.friendRepository.save(friend);
    await this.friendRepository.save(friend1);

    return {
      message: 'Send request friend success!',
      friend,
      friend1,
    };
  }

  async update(updateFriendDto: UpdateFriendDto, user: User) {
    const { senderId } = updateFriendDto;
    if (user.id === senderId) {
      throw new BadRequestException(
        `You cannot send request friend to yourself!`,
      );
    }
    const sender = await this.userRepository.findOne({
      where: { id: senderId },
    });

    if (!sender) {
      throw new BadRequestException(`Sender not found!`);
    }
    // check exist friend request
    const checkExistFriend = await this.friendRepository.findOne({
      where: {
        sender: { id: senderId },
        receiver: { id: user.id },
        type: TypeFriend.REQUEST_FRIEND,
      },
    });

    const checkExistFriend1 = await this.friendRepository.findOne({
      where: {
        sender: { id: user.id },
        receiver: { id: senderId },
        type: TypeFriend.CONFIRM_FRIEND,
      },
    });

    if (!checkExistFriend && !checkExistFriend1) {
      throw new BadRequestException(
        `You cannot confirm request friend. You are friend.`,
      );
    }
    // confirm request friend
    const friend = await this.friendRepository.update(
      { id: checkExistFriend.id },
      { type: TypeFriend.IS_FRIEND },
    );
    const friend1 = await this.friendRepository.update(
      { id: checkExistFriend1.id },
      { type: TypeFriend.IS_FRIEND },
    );
    return {
      message: 'Confirm request friend success!',
      friend,
      friend1,
    };
  }

  async remove(friendId: string, user: User) {
    if (user.id === friendId) {
      throw new BadRequestException(`You cannot remove friend to yourself!`);
    }

    const friend = await this.userRepository.findOne({
      where: {
        id: friendId,
      },
    });
    if (!friend) {
      throw new BadRequestException(`Friend not found!`);
    }

    // check exist friend
    const checkExistFriend = await this.friendRepository.findOne({
      where: {
        sender: { id: friendId },
        receiver: { id: user.id },
      },
    });

    const checkExistFriend1 = await this.friendRepository.findOne({
      where: {
        sender: { id: user.id },
        receiver: { id: friendId },
      },
    });
    if (!checkExistFriend && !checkExistFriend1) {
      throw new BadRequestException(
        `You cannot remove friend. You are not friend.`,
      );
    }
    const friend1 = await this.friendRepository.delete({
      id: checkExistFriend.id,
    });
    const friend2 = await this.friendRepository.delete({
      id: checkExistFriend1.id,
    });
    return {
      message: 'Remove friend success!',
      friend1,
      friend2,
    };
  }
}
