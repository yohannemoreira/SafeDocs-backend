import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { AuthResponseDto } from './dto/auth-response.dto';
import { User } from '../users/entities/user.entity';

@Controller('auth') // Define o prefixo da rota para '/auth'
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  /**
   * Endpoint para registro de novos usuários.
   * Rota: POST /auth/register
   */
  @Post('register')
  @HttpCode(HttpStatus.CREATED) // Retorna status 201
  async register(
    @Body() registerDto: RegisterDto,
  ): Promise<Omit<User, 'passwordHash'>> {
    return this.authService.register(registerDto);
  }

  /**
   * Endpoint para login de usuários.
   * Rota: POST /auth/login
   */
  @Post('login')
  @HttpCode(HttpStatus.OK) // Retorna status 200 OK
  async login(@Body() loginDto: LoginDto): Promise<AuthResponseDto> {
    return this.authService.login(loginDto);
  }
}
