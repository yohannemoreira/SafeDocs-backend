import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { UsersService } from './users.service';

@Module({
  imports: [
    // Registra a entidade User para que o TypeORM possa criar seu repositório
    TypeOrmModule.forFeature([User]),
  ],
  providers: [UsersService],
  // Exporta o UsersService para que outros módulos possam injetá-lo
  exports: [UsersService],
})
export class UsersModule {}