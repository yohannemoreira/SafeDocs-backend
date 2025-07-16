import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { SharedLinksService } from './shared-links.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { User } from '../users/entities/user.entity';
import { CreateSharedLinkDto } from './dto/create-shared-links.dto';

@Controller('shared-links')
export class SharedLinksController {
  constructor(private readonly sharedLinksService: SharedLinksService) {}

  /**
   * Endpoint protegido para criar um novo link de compartilhamento.
   * POST /shared-links
   */
  @UseGuards(JwtAuthGuard)
  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(
    @Body() createSharedLinkDto: CreateSharedLinkDto,
    @CurrentUser() user: User,
  ) {
    return this.sharedLinksService.create(
      createSharedLinkDto.documentId,
      user.id,
    );
  }

  /**
   * Endpoint público para acessar o conteúdo de um link.
   * GET /shared-links/:token
   */
  @Get(':token')
  accessLink(@Param('token') token: string) {
    return this.sharedLinksService.getDocumentUrlFromToken(token);
  }
}
