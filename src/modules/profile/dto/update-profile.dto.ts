import { PartialType } from '@nestjs/mapped-types';
import { CreateProfileDto } from './create-profile.dto';

export class UpdateProfileDto extends PartialType(CreateProfileDto) {
  userName: string;
  phone: string;
  address: string;
  dateOfBirth: Date;
}
