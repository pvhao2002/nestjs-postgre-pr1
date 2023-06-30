import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateProfileDto } from './dto/create-profile.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { Repository } from 'typeorm';
import { Profile } from './entities/profile.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from '../user/entities/user.entity';

@Injectable()
export class ProfileService {
  constructor(
    @InjectRepository(Profile)
    private profileRepository: Repository<Profile>,

    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  create(createProfileDto: CreateProfileDto) {
    const profile = this.profileRepository.create(createProfileDto);
    return this.profileRepository.save(profile);
  }

  async update(
    id: string,
    profileId: string,
    updateProfileDto: UpdateProfileDto,
  ): Promise<string> {
    // const profile = await this.findOne(id);
    // profile.userName = updateProfileDto.userName || profile.userName;
    // profile.phone = updateProfileDto.phone || profile.phone;
    // profile.address = updateProfileDto.address || profile.address;
    // profile.dateOfBirth = updateProfileDto.dateOfBirth || profile.dateOfBirth;
    // return this.profileRepository.save(profile);

    if (!profileId) {
      const profile = await this.profileRepository.create({
        userName: updateProfileDto.userName,
        phone: updateProfileDto.phone,
        address: updateProfileDto.address,
        dateOfBirth: updateProfileDto.dateOfBirth,
      });

      await this.profileRepository.save(profile);

      await this.userRepository.update(
        {
          id: id,
        },
        {
          profile: profile,
        },
      );
    } else {
      await this.profileRepository.update(
        {
          id: profileId,
        },
        {
          userName: updateProfileDto.userName,
          phone: updateProfileDto.phone,
          address: updateProfileDto.address,
          dateOfBirth: updateProfileDto.dateOfBirth,
        },
      );
    }
    return 'update successfully';
  }

  remove(id: number) {
    return `This action removes a #${id} profile`;
  }
}
