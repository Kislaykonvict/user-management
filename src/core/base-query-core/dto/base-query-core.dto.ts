import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  Contains,
  IsBoolean,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Max,
} from 'class-validator';

export class BaseQueryCoreDto {
  @ApiProperty({ required: false })
  @Type(() => Number)
  @IsInt()
  @IsOptional()
  skip?: number;

  @ApiProperty({ required: false })
  @Type(() => Number)
  @IsInt()
  @Max(50)
  @IsOptional()
  take?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @Contains('|')
  orderBy?: string[];

  @ApiProperty({ required: false })
  @IsOptional()
  include?: string[];

  @ApiProperty({ required: false })
  @IsOptional()
  search_column?: string[];

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  search?: string;
}

export class CoreIncludesDto {
  @ApiProperty({ required: false })
  @IsOptional()
  include?: string[];
}

export class CorePaginateDto {
  @ApiProperty({ required: true })
  @Type(() => Number)
  @IsInt()
  @IsNotEmpty()
  count: number;

  @ApiProperty({ required: false })
  @Type(() => Number)
  @IsInt()
  @IsNotEmpty()
  total: number;

  @ApiProperty({ required: false })
  @IsBoolean()
  hasMany: boolean;
}
