import { ApiProperty } from "@nestjs/swagger";
import { IsNumber, IsInt, IsString } from "class-validator";
import { Type } from 'class-transformer';

export class CreateProductDto {
    @IsString()
    @ApiProperty({ example: 'iPhone 15' })
  name: string;
  
  @IsString()
  @ApiProperty()
  description: string;
  @ApiProperty({ example: 999.99 })
  @Type(() => Number)
  @IsNumber()
  price: number;
  @ApiProperty({ example: 1 })
  @Type(() => Number)
  @IsInt()
  categoryId: number;
  @ApiProperty({ example: 10 })
  @Type(() => Number)
  @IsInt()
  quantity: number;
}
