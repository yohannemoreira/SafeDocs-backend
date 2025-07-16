import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Document } from '../../documents/entities/document.entity';

@Entity('shared_links')
export class SharedLink {
  @PrimaryGeneratedColumn('increment')
  id: number;

  @Column({ unique: true })
  token: string;

  // Mapeia a coluna 'expires_at'
  @Column({ name: 'expires_at', type: 'timestamp' })
  expiresAt: Date;

  // Mapeia a coluna 'access_count'
  @Column({ name: 'access_count', default: 0 })
  accessCount: number;

  // Mapeia a coluna 'created_at'
  @CreateDateColumn({ name: 'created_at', type: 'timestamp' })
  createdAt: Date;

  // Define a relação: muitos links (SharedLink) pertencem a um documento (Document)
  @ManyToOne(() => Document, (document) => document.sharedLinks)
  @JoinColumn({ name: 'document_id' }) // Especifica a chave estrangeira
  document: Document;
}
