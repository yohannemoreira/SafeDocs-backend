import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { S3Client, PutObjectCommand, DeleteObjectCommand, GetObjectCommand} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { randomUUID } from 'crypto';

@Injectable()
export class S3Service {
  private readonly s3Client: S3Client;
  private readonly bucketName: string;

  constructor(private readonly configService: ConfigService) {
    this.bucketName = this.configService.getOrThrow<string>('S3_BUCKET_NAME');
    
    this.s3Client = new S3Client({
      region: this.configService.getOrThrow<string>('AWS_REGION'),
      credentials: {
        accessKeyId: this.configService.getOrThrow<string>('AWS_ACCESS_KEY_ID'),
        secretAccessKey: this.configService.getOrThrow<string>('AWS_SECRET_ACCESS_KEY'),
      },
    });
  }

  /**
   * Gera uma URL pré-assinada para upload de um arquivo no S3.
   * @param originalName - O nome original do arquivo para extrair a extensão.
   * @param contentType - O tipo MIME do arquivo.
   * @returns A URL pré-assinada e a chave única do arquivo no S3.
   */
  async generatePresignedUploadUrl(originalName: string, contentType: string) {
    const fileExtension = originalName.split('.').pop();
    const key = `${randomUUID()}.${fileExtension}`; // Gera uma chave única

    const command = new PutObjectCommand({
      Bucket: this.bucketName,
      Key: key,
      ContentType: contentType,
    });

    const signedUrl = await getSignedUrl(this.s3Client, command, {
      expiresIn: 3600, // URL expira em 1 hora
    });

    return { signedUrl, key };
  }

  /**
   * Deleta um arquivo do bucket S3.
   * @param key - A chave do objeto a ser deletado.
   */
  async deleteFile(key: string): Promise<void> {
    const command = new DeleteObjectCommand({
      Bucket: this.bucketName,
      Key: key,
    });

    try {
      await this.s3Client.send(command);
    } catch (error) {
      // Logging aqui para erros de deleção no S3
      console.error(`Erro ao deletar arquivo do S3: ${key}`, error);
    }
  }

  /**
   * Gera uma URL pré-assinada para download de um arquivo do S3.
   * @param key - A chave do objeto a ser baixado.
   * @returns A URL pré-assinada para download.
   */
  async generatePresignedDownloadUrl(key: string): Promise<string> {
    const command = new GetObjectCommand({
      Bucket: this.bucketName,
      Key: key,
    });

    // URL de download expira em 1 hora por padrão.
    const signedUrl = await getSignedUrl(this.s3Client, command, {
      expiresIn: 3600,
    });

    return signedUrl;
  }
}