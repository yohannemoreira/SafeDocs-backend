import { Exclude } from 'class-transformer';
import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Document } from '../../documents/entities/document.entity';

@Entity('users')
export class User {
  // Mapeia a coluna 'id' como uma chave primária auto-incrementada
  @PrimaryGeneratedColumn('increment')
  id: number;

  @Column()
  name: string;

  @Column({ unique: true })
  email: string;

  // Mapeia para a coluna 'password_hash' no banco
  @Column({ name: 'password_hash' })
  @Exclude() // Garante que este campo nunca seja retornado nas respostas da API
  passwordHash: string;

  // Mapeia para a coluna 'created_at' e é preenchida automaticamente na criação
  @CreateDateColumn({ name: 'created_at', type: 'timestamp' })
  createdAt: Date;

  // Mapeia para a coluna 'updated_at' e é atualizada automaticamente
  @UpdateDateColumn({ name: 'updated_at', type: 'timestamp' })
  updatedAt: Date;

  // Define a relação: um usuário (User) pode ter muitos documentos (Document)
  @OneToMany(() => Document, (document) => document.user)
  documents: Document[];
}