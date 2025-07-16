import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class LoginDto {
  @IsEmail({}, { message: 'Por favor, insira um email válido.' })
  email: string;

  @IsString()
  @IsNotEmpty({ message: 'A senha не pode estar vazia.' })
  password: string;
}
