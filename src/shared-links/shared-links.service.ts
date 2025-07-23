import { Injectable, NotFoundException, GoneException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { randomBytes } from 'crypto';
import { SharedLink } from './entities/shared-link.entity';
import { DocumentsService } from '../documents/document.service';
import { S3Service } from '../common/aws/s3.service';

@Injectable()
export class SharedLinksService {
  constructor(
    @InjectRepository(SharedLink)
    private readonly sharedLinksRepository: Repository<SharedLink>,
    private readonly documentsService: DocumentsService,
    private readonly s3Service: S3Service,
  ) {}

  /**
   * Cria um link de compartilhamento para um documento.
   */
  async create(documentId: number, userId: number): Promise<SharedLink> {
    // Garante que o documento existe e pertence ao usuário.
    const document = await this.documentsService.findOneByUser(
      documentId,
      userId,
    );

    // Gera um token seguro e aleatório.
    const token = randomBytes(32).toString('hex');

    // Define a data de expiração (ex: 7 dias a partir de agora).
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    // Cria e salva o link no banco.
    const newSharedLink = this.sharedLinksRepository.create({
      document,
      token,
      expiresAt,
    });

    return this.sharedLinksRepository.save(newSharedLink);
  }

  /**
   * Valida um token e retorna uma URL de download para o documento associado.
   */
  async getDocumentUrlFromToken(
    token: string,
  ): Promise<{ downloadUrl: string }> {
    // Encontra o link pelo token, incluindo o documento relacionado.
    const sharedLink = await this.sharedLinksRepository.findOne({
      where: { token },
      relations: ['document'],
    });

    if (!sharedLink) {
      throw new NotFoundException('Link de compartilhamento não encontrado.');
    }

    // Verifica se o link expirou.
    if (new Date() > sharedLink.expiresAt) {
      // Opcional: Deletar o link expirado para limpar o banco.
      await this.sharedLinksRepository.remove(sharedLink);
      throw new GoneException('Este link de compartilhamento expirou.'); // HTTP 410 Gone
    }

    // Incrementa o contador de acessos.
    sharedLink.accessCount++;
    await this.sharedLinksRepository.save(sharedLink);

    // Gera a URL de download e a retorna.
    const downloadUrl = await this.s3Service.generatePresignedDownloadUrl(
      sharedLink.document.s3Key,
    );

    return { downloadUrl };
  }
}
