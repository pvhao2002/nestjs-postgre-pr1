import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateProfileDto } from './dto/create-profile.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { ILike, Repository } from 'typeorm';
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
  removeWhitespace(str: string): string {
    // Xóa tất cả khoảng trắng từ chuỗi
    if (!str) {
      return '';
    }
    const cleanedStr = str.replace(/\s/g, '');
    return cleanedStr;
  }
  async search(search: string) {
    search = this.removeWhitespace(search);
    const profile = await this.profileRepository
      .createQueryBuilder('profile')
      .leftJoinAndSelect('profile.user', 'user')
      .where('unaccent(profile.search) ILike unaccent(:search)', {
        search: `%${search}%`,
      })
      .getMany();

    return profile;
  }

  getDefaultSearchColumns(createProfileDto: any): string {
    const valuesToConcatenate = [
      createProfileDto.userName,
      createProfileDto.phone,
      createProfileDto.address,
    ];
    return valuesToConcatenate
      .filter((value) => value)
      .join('')
      .toLowerCase()
      .trim();
  }

  create(createProfileDto: CreateProfileDto) {
    const search = this.getDefaultSearchColumns(createProfileDto);

    const profile = this.profileRepository.create({
      userName: createProfileDto.userName,
      phone: createProfileDto.phone,
      address: createProfileDto.address,
      dateOfBirth: createProfileDto.dateOfBirth,
      search: this.removeWhitespace(search),
    });
    return this.profileRepository.save(profile);
  }

  async update(
    id: string,
    profileId: string,
    updateProfileDto: UpdateProfileDto,
  ): Promise<string> {
    const search = this.getDefaultSearchColumns(updateProfileDto);
    if (!profileId) {
      const profile = await this.profileRepository.create({
        userName: updateProfileDto.userName,
        phone: updateProfileDto.phone,
        address: updateProfileDto.address,
        dateOfBirth: updateProfileDto.dateOfBirth,
        search: this.removeWhitespace(search),
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
          search: this.removeWhitespace(search),
        },
      );
    }
    return 'update successfully';
  }

  remove(id: number) {
    return `This action removes a #${id} profile`;
  }
}
