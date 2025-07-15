import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Document } from './entities/document.entity';
import { S3Service } from '../common/aws/s3.service';
import { CreateDocumentDto } from './dto/create-document.dto';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class DocumentsService {
  constructor(
    @InjectRepository(Document)
    private readonly documentsRepository: Repository<Document>,
    private readonly s3Service: S3Service,
    private readonly configService: ConfigService,
  ) {}

  async createUploadUrl(createDocumentDto: CreateDocumentDto, userId: number) {
    const { originalName, fileType, fileSize } = createDocumentDto;

    // 1. Gera a URL pré-assinada e a chave do S3
    const { signedUrl, key } = await this.s3Service.generatePresignedUploadUrl(
      originalName,
      fileType,
    );

    // 2. Salva os metadados do documento no banco de dados
    const newDocument = this.documentsRepository.create({
      originalName,
      fileType,
      fileSize,
      s3Key: key,
      s3Bucket: this.configService.getOrThrow<string>('S3_BUCKET_NAME'),
      user: { id: userId }, // Associa ao usuário logado
      filename: key, // Usamos a chave do S3 como nome do arquivo
    });

    await this.documentsRepository.save(newDocument);

    // 3. Retorna a URL para o frontend
    return { signedUrl };
  }

  /**
   * Encontra todos os documentos de um usuário específico.
   */
  async findAllByUser(userId: number): Promise<Document[]> {
    return this.documentsRepository.find({
      where: {
        user: { id: userId },
      },
      order: {
        uploadDate: 'DESC', // Ordena pelos mais recentes primeiro
      },
    });
  }

  /**
   * Encontra um documento específico pelo seu ID e o ID do seu dono.
   */
  async findOneByUser(id: number, userId: number): Promise<Document> {
    const document = await this.documentsRepository.findOne({
      where: { id, user: { id: userId } },
    });

    if (!document) {
      // Lança um erro se o documento não existe OU não pertence ao usuário
      throw new NotFoundException(`Documento com ID #${id} não encontrado.`);
    }

    return document;
  }

  /**
    * Remove um documento do S3 e do banco de dados.
    */
  async remove(id: number, userId: number): Promise<void> {
    // 1. Verifica se o documento existe e se pertence ao usuário
    const document = await this.findOneByUser(id, userId);

    // 2. Deleta o arquivo do S3
    await this.s3Service.deleteFile(document.s3Key);

    // 3. Deleta o registro do banco de dados
    await this.documentsRepository.remove(document);
  }

}