import { TypeReaction } from "../entities/reaction.enum";

export class CreateReactionDto {
  type: TypeReaction;
  postId: string;
}
