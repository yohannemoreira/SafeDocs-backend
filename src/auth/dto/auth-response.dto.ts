import { User } from '../../users/entities/user.entity';

export class AuthResponseDto {
  user: Omit<User, 'passwordHash'>;
  accessToken: string;
}