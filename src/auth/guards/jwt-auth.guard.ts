import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

// O nome 'jwt' é o nome padrão da estratégia que registramos no AuthModule
@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {}