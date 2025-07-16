import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { RegisterDto } from '../auth/dto/register.dto'; // Usamos o RegisterDto para a criação inicial
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  async create(registerDto: RegisterDto): Promise<User> {
    // 2. Hasheia a senha antes de criar o usuário
    const hashedPassword = await bcrypt.hash(registerDto.password, 10);

    // 3. Cria a entidade com os dados e a senha hasheada
    const userToSave = this.usersRepository.create({
      ...registerDto,
      passwordHash: hashedPassword,
    });

    // 4. Salva o usuário no banco
    const savedUser = await this.usersRepository.save(userToSave);

    return savedUser;
  }

  /**
   * Encontra um usuário pelo seu ID.
   */
  async findOneById(id: number): Promise<User> {
    const user = await this.usersRepository.findOneBy({ id });
    if (!user) {
      throw new NotFoundException(`Usuário com ID #${id} não encontrado`);
    }
    return user;
  }

  /**
   * Encontra um usuário pelo seu e-mail (necessário para login e verificação de duplicados).
   */
  async findOneByEmail(email: string): Promise<User | null> {
    return this.usersRepository.findOneBy({ email });
  }
}
