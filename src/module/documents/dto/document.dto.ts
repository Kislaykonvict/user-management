import { IsNotEmpty, IsString, IsOptional, IsNumber, IsUrl } from 'class-validator';
import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class CreateDocumentDto {
  @ApiProperty({ description: 'The title of the document' })
  @IsNotEmpty({ message: 'Title is required' })
  @IsString({ message: 'Title must be a string' })
  title: string;

  @ApiPropertyOptional({ description: 'Optional description of the document' })
  @IsOptional()
  @IsString({ message: 'Description must be a string' })
  description?: string;
}

export class UpdateDocumentDto extends PartialType(CreateDocumentDto) {
  @ApiPropertyOptional({ description: 'The title of the document' })
  @IsOptional()
  @IsString({ message: 'Title must be a string' })
  title?: string;

  @ApiPropertyOptional({ description: 'Description of the document' })
  @IsOptional()
  @IsString({ message: 'Description must be a string' })
  description?: string;
}


export class DocumentDto {
  @ApiProperty({ description: 'Unique identifier for the document' })
  @IsOptional()
  @IsNumber()
  id: number;
  
  @ApiProperty({ description: 'The title of the document' })
  title: string;
  
  @ApiPropertyOptional({ description: 'Optional description of the document' })
  description?: string;
  
  @ApiProperty({ description: 'Path to the stored file' })
  filePath: string;
  
  @ApiProperty({ description: 'ID of the user who created the document' })
  @IsNotEmpty()
  @IsNumber()
  createdById: number;
}