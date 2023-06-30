import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';

import * as bcrypt from 'bcrypt';
import { LoginUserInput, SignupUserInput } from 'src/auth/dto/auth.input';
import { JwtService } from '@nestjs/jwt';
import { Profile } from '../profile/entities/profile.entity';
import { ProfileService } from '../profile/profile.service';
import { CreateProfileDto } from '../profile/dto/create-profile.dto';
import { Geometry, Point } from 'geojson';
@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    private jwtService: JwtService,
    @InjectRepository(Profile)
    private profileRepository: Repository<Profile>,
  ) {}

  async create(userDto: SignupUserInput) {
    const isExistEmail = await this.findOneByEmail(userDto.email);

    if (isExistEmail) {
      throw new NotFoundException('Email has been sign up!');
    }

    const user = this.usersRepository.create(userDto);

    user.password = await bcrypt.hash(userDto.password, 10);
    await this.usersRepository.save(user);
    return await this.usersRepository.save(user);
  }

  async login(loginInput: LoginUserInput, point: Point) {
    const user = await this.findOneByEmail(loginInput.email);

    if (!user) {
      throw new NotFoundException('User not found.');
    }

    const isValid = await bcrypt.compare(loginInput.password, user.password);
    if (!isValid) {
      throw new UnauthorizedException("You've entered an incorrect password!");
    }

    const payload = { userId: user.id };

    const accessToken = await this.jwtService.signAsync(payload);

    user.accessToken = accessToken;

    await this.usersRepository.update(
      {
        id: user.id,
      },
      {
        accessToken,
        lat: point.coordinates[1],
        long: point.coordinates[0],
        location: point,
      },
    );

    return user;
  }

  async findOneByEmail(email: string): Promise<User> {
    const user: User = await this.usersRepository.findOne({
      where: {
        email,
      },
    });
    return user;
  }

  async findOneById(id: string): Promise<User> {
    const user: User = await this.usersRepository.findOne({
      where: { id: id },
      relations: ['profile'],
    });

    return user;
  }

  async findAll(): Promise<User[]> {
    return await this.usersRepository.find();
  }

  async remove(id: string): Promise<void> {
    await this.usersRepository.delete(id);
  }
}
