import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Document } from './entities/document.entity';
import { S3Service } from '../common/aws/s3.service';
import { CreateDocumentDto } from './dto/create-document.dto';
import { ConfigService } from '@nestjs/config';
import { Multer } from 'multer';
import * as AWS from 'aws-sdk';

@Injectable()
export class DocumentsService {

  constructor(
    @InjectRepository(Document)
    private readonly documentsRepository: Repository<Document>,
    private readonly s3Service: S3Service,
    private readonly configService: ConfigService,
  ) {}

  async createUploadUrl(file: Multer.File, userId: number) {
    console.log(file);
    const { originalname } = file;

    return await this.s3_upload(
      file.buffer,
      this.configService.getOrThrow<string>('S3_BUCKET_NAME'),
      originalname,
      file.mimetype,
    );
  }

  async s3_upload(file, bucket, name, mimetype) {
    const s3 = new AWS.S3({
      accessKeyId: this.configService.getOrThrow<string>('AWS_ACCESS_KEY_ID'),
      secretAccessKey: this.configService.getOrThrow<string>('AWS_SECRET_ACCESS_KEY')
    });
    // ARRUMAR ESSA LINHA DE CIMA PQ TÁ TUDO CAGADO

    const params = {
      Bucket: bucket,
      Key: String(name),
      Body: file,
      ContentType: mimetype,
      ContentDisposition: 'inline',
    };

    try {
      let s3Response = await s3.upload(params).promise();
      return s3Response;
    } catch (e) {
      console.log(e);
    }
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
