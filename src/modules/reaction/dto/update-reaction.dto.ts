import { PartialType } from '@nestjs/mapped-types';
import { CreateReactionDto } from './create-reaction.dto';
import { TypeReaction } from '../entities/reaction.enum';

export class UpdateReactionDto extends PartialType(CreateReactionDto) {
    type: TypeReaction;
}
