import { IsString, IsNotEmpty, IsOptional } from 'class-validator';

export class CreateCategorieDto {
  @IsString()
  @IsNotEmpty()
  name: string;
}

export class UpdateCategorieDto {
  @IsString()
  @IsOptional()
  name?: string;
}