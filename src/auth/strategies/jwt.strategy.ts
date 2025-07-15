import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { UsersService } from '../../users/user.service';
import { User } from '../../users/entities/user.entity';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private readonly configService: ConfigService,
    private readonly usersService: UsersService,
  ) {
    // ---- INÍCIO DA ALTERAÇÃO ----

    const secret = configService.get<string>('JWT_SECRET');

    // Lançamos um erro se o segredo JWT não estiver definido,
    // o que impede a aplicação de iniciar de forma insegura.
    if (!secret) {
      throw new Error('JWT_SECRET não foi definido no arquivo .env');
    }

    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      // Agora usamos a variável 'secret' que já foi validada
      secretOrKey: secret, 
    });

    // ---- FIM DA ALTERAÇÃO ----
  }

  async validate(payload: { sub: number; email: string }): Promise<Omit<User, 'passwordHash'>> {
    const user = await this.usersService.findOneById(payload.sub);

    if (!user) {
      throw new UnauthorizedException('Token inválido ou usuário não encontrado.');
    }

    const { passwordHash, ...userWithoutPassword } = user;
    return userWithoutPassword; 
  }
}