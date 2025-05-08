import { IsInt, IsNotEmpty, IsPositive } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

import { PartialType } from '@nestjs/mapped-types';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString } from 'class-validator';
import { Status } from '@prisma/client';


export class CreateIngestionJobDto {
  @ApiProperty({ description: 'The ID of the document to process' })
  @IsNotEmpty({ message: 'Document ID is required' })
  @IsInt({ message: 'Document ID must be an integer' })
  @IsPositive({ message: 'Document ID must be a positive number' })
  documentId: number;
}


export class UpdateIngestionJobDto extends PartialType(CreateIngestionJobDto) {
  @ApiPropertyOptional({ enum: Status, description: 'The status of the ingestion job' })
  @IsOptional()
  @IsEnum(Status, { message: 'Status must be a valid job status' })
  status?: Status;

  @ApiPropertyOptional({ description: 'The output or result of the job' })
  @IsOptional()
  @IsString({ message: 'Output must be a string' })
  output?: string;
}

export class IngestionJobDto {
  @ApiProperty({ description: 'Unique identifier for the ingestion job' })
  id: number;
  
  @ApiProperty({ description: 'ID of the document being processed' })
  documentId: number;
  
  @ApiProperty({ enum: Status, description: 'Current status of the ingestion job' })
  status: Status;
  
  @ApiProperty({ description: 'ID of the user who started the job' })
  startedById: number;
  
  @ApiProperty({ description: 'When the job was started' })
  startedAt: Date;
  
  @ApiPropertyOptional({ description: 'When the job was completed' })
  completedAt: Date | null;
  
  @ApiPropertyOptional({ description: 'Output or result from the job' })
  output: string | null;
}