import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from '../users/users.module';
import { DocumentsModule } from '../documents/documents.module';
import { SharedLinksModule } from '../shared-links/shared-links.module';

// Importa as entidades para a configuração do TypeORM
import { User } from '../users/entities/user.entity';
import { Document } from '../documents/entities/document.entity';
import { SharedLink } from '../shared-links/entities/shared-link.entity';


@Module({
  imports: [
    // 1. Configura o módulo de variáveis de ambiente para ser global
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),

    // 2. Configura a conexão com o banco de dados de forma assíncrona
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get<string>('DB_HOST'),
        port: configService.get<number>('DB_PORT'),
        username: configService.get<string>('DB_USERNAME'),
        password: configService.get<string>('DB_PASSWORD'),
        database: configService.get<string>('DB_DATABASE'),
        entities: [User, Document, SharedLink],
        // Sincroniza o schema do banco com as entidades.
        // ATENÇÃO: Usar 'true' apenas em desenvolvimento. Em produção, use migrações.
        synchronize: configService.get<string>('NODE_ENV') !== 'production',
      }),
    }),
    
    // 3. Importa os módulos de funcionalidades da aplicação
    UsersModule,
    DocumentsModule,
    SharedLinksModule,
    // Futuramente, adicionaremos o AuthModule aqui
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}