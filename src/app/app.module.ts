import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from '../users/user.module';
import { DocumentsModule } from '../documents/document.module';
import { SharedLinksModule } from '../shared-links/shared-links.module';
import { AuthModule } from '../auth/auth.module';
import { AwsModule } from '../common/aws/aws.module';

//configuração do TypeORM
import { User } from '../users/entities/user.entity';
import { Document } from '../documents/entities/document.entity';
import { SharedLink } from '../shared-links/entities/shared-link.entity';


@Module({
  imports: [
    //Configura o módulo de variáveis de ambiente para ser global
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),

    //Configura a conexão com o banco de dados de forma assíncrona
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
        // Usar 'true' apenas em desenvolvimento. Em produção, use migrações.
        synchronize: configService.get<string>('NODE_ENV') !== 'production',
      }),
    }),

    // Importa os módulos de funcionalidades da aplicação
    UsersModule,
    DocumentsModule,
    SharedLinksModule,
    AuthModule,
    AwsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}