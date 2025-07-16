import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';

import { UsersModule } from '../users/user.module';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtStrategy } from './strategies/jwt.strategy';

@Module({
  imports: [
    // Importamos o UsersModule para ter acesso ao UsersService
    UsersModule,

    // Configura o Passport com a estratégia padrão 'jwt'
    PassportModule.register({ defaultStrategy: 'jwt' }),

    // Configura o módulo JWT de forma assíncrona para usar as variáveis de ambiente
    JwtModule.registerAsync({
      imports: [ConfigModule], // Importa o ConfigModule para ter acesso ao ConfigService
      inject: [ConfigService], // Injeta o ConfigService
      useFactory: (configService: ConfigService) => ({
        // Pega o segredo do JWT do arquivo .env
        secret: configService.get<string>('JWT_SECRET'),
        signOptions: {
          // Define o tempo de expiração do token
          expiresIn: configService.get<string>('JWT_EXPIRES_IN'),
        },
      }),
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy],
  exports: [AuthService],
})
export class AuthModule {}
