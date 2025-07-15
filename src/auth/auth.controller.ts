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
  @HttpCode(HttpStatus.CREATED) // Retorna o status 201 Created em caso de sucesso
  async register(@Body() registerDto: RegisterDto): Promise<User> {
    // O ValidationPipe (global) já validou o registerDto automaticamente
    return this.authService.register(registerDto);
  }

  /**
   * Endpoint para login de usuários.
   * Rota: POST /auth/login
   */
  @Post('login')
  @HttpCode(HttpStatus.OK) // Retorna o status 200 OK em caso de sucesso
  async login(@Body() loginDto: LoginDto): Promise<AuthResponseDto> {
    // O ValidationPipe (global) já validou o loginDto automaticamente
    return this.authService.login(loginDto);
  }
}