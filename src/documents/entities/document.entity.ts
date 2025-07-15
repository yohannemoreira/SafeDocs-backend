import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { SharedLink } from '../../shared-links/entities/shared-link.entity';

@Entity('documents')
export class Document {
  @PrimaryGeneratedColumn('increment')
  id: number;

  // Mapeia a coluna 'original_name'
  @Column({ name: 'original_name' })
  originalName: string;

  @Column()
  filename: string;

  // Mapeia a coluna 'file_type'
  @Column({ name: 'file_type' })
  fileType: string;

  // Mapeia a coluna 'file_size' usando o tipo 'bigint' para números grandes
  @Column({ name: 'file_size', type: 'bigint' })
  fileSize: number;

  // Mapeia a coluna 's3_key'
  @Column({ name: 's3_key' })
  s3Key: string;

  // Mapeia a coluna 's3_bucket'
  @Column({ name: 's3_bucket' })
  s3Bucket: string;

  // Mapeia a coluna 'upload_date'
  @CreateDateColumn({ name: 'upload_date', type: 'timestamp' })
  uploadDate: Date;

  // Mapeia a coluna 'metadata' do tipo JSONB, que pode ser nula
  @Column({ type: 'jsonb', nullable: true })
  metadata: Record<string, any>;

  // Mapeia a coluna 'is_processed' com um valor padrão
  @Column({ name: 'is_processed', default: false })
  isProcessed: boolean;

  // Define a relação: muitos documentos (Document) pertencem a um usuário (User)
  @ManyToOne(() => User, (user) => user.documents)
  @JoinColumn({ name: 'user_id' }) // Especifica qual é a coluna da chave estrangeira
  user: User;

  // Define a relação: um documento (Document) pode ter muitos links (SharedLink)
  @OneToMany(() => SharedLink, (sharedLink) => sharedLink.document)
  sharedLinks: SharedLink[];
}