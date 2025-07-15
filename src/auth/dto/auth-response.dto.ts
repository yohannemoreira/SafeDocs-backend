import { User } from '../../users/entities/user.entity';

export class AuthResponseDto {
  user: User;
  accessToken: string;
}