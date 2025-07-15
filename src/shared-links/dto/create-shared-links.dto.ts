import { IsNotEmpty, IsNumber } from 'class-validator';

export class CreateSharedLinkDto {
  @IsNumber()
  @IsNotEmpty()
  documentId: number;
}