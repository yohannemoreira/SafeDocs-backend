import { Injectable, ConflictException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';

import { UsersService } from '../users/user.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { AuthResponseDto } from './dto/auth-response.dto';
import { User } from '../users/entities/user.entity';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  /**
   * Registra um novo usuário no sistema.
   */
  async register(registerDto: RegisterDto): Promise<Omit<User, 'passwordHash'>> {
    // 1. Verifica se já existe um usuário com o mesmo e-mail
    const existingUser = await this.usersService.findOneByEmail(registerDto.email);
    if (existingUser) {
      throw new ConflictException('Já existe um usuário com este e-mail.');
    }

    // 2. O hashing da senha acontece automaticamente graças ao hook @BeforeInsert
    //    na nossa entidade User. Então, podemos simplesmente passar os dados.
  
    
    // Cria o novo usuário
    const newUser = await this.usersService.create(registerDto);
    
    // Omite a senha do retorno por segurança
    const { passwordHash, ...result } = newUser;
    return result;
  }

  /**
   * Valida as credenciais do usuário. Se bem-sucedido, retorna os dados do usuário e um token JWT.
   */
  async login(loginDto: LoginDto): Promise<AuthResponseDto> {
    // Valida as credenciais do usuário
    const user = await this.validateUser(loginDto.email, loginDto.password);
    
    if (!user) {
      throw new UnauthorizedException('Credenciais inválidas.');
    }

    // Cria o payload para o token JWT
    const payload = { email: user.email, sub: user.id };

    // Gera o token de acesso
    const accessToken = this.jwtService.sign(payload);

    return {
      user,
      accessToken,
    };
  }

  /**
   * Método auxiliar para validar se um usuário existe e se a senha está correta.
   */
  async validateUser(email: string, pass: string): Promise<Omit<User, 'passwordHash'> | null> {
    const user = await this.usersService.findOneByEmail(email);

    if (user && (await bcrypt.compare(pass, user.passwordHash))) {
      // Se a senha corresponde, retorna o usuário sem o hash da senha
      const { passwordHash, ...result } = user;
      return result;
    }
    
    return null;
  }
}