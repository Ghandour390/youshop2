import { ApiProperty } from "@nestjs/swagger";
import { IsNumber, IsInt, IsString, Min, Max } from "class-validator";
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
  @Min(0.01)
  @Max(999999)
  price: number;
  @ApiProperty({ example: 1 })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  categoryId: number;
  @ApiProperty({ example: 10 })
  @Type(() => Number)
  @IsInt()
  @Min(0)
  @Max(99999)
  quantity: number;
}
