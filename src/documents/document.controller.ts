import { Controller, Post, Body, UseGuards, Get, Param, Delete, HttpCode, HttpStatus, ParseIntPipe, UploadedFile, UseInterceptors } from '@nestjs/common';
import { DocumentsService } from './document.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { User } from '../users/entities/user.entity';
import { CreateDocumentDto } from './dto/create-document.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { Multer } from 'multer';

@Controller('documents')
@UseGuards(JwtAuthGuard) 
export class DocumentsController {
  constructor(private readonly documentsService: DocumentsService) {}

  @Post('upload')
  @UseInterceptors(FileInterceptor('file')) 
  async getUploadUrl(
    @CurrentUser() user: User,
    @UploadedFile() file: Multer.File
  ) {
    return this.documentsService.createUploadUrl(file, user.id);
  }

  @Get()
  async findAll(@CurrentUser() user: User) {
    return this.documentsService.findAllByUser(user.id);
  }

  @Get(':id')
  async findOne(
    @Param('id', ParseIntPipe) id: number, // ParseIntPipe transforma ID (string) em number
    @CurrentUser() user: User,
  ) {
    return this.documentsService.findOneByUser(id, user.id);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(
    @Param('id', ParseIntPipe) id: number, 
    @CurrentUser() user: User,
  ) {
    await this.documentsService.remove(id, user.id);
  }

}