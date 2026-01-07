import { ApiProperty } from "@nestjs/swagger";
import { IsNumber, IsInt ,IsOptional } from "class-validator";
import { Type } from 'class-transformer';

class getAllProductsDto {
    @ApiProperty({ example: 1, required: false })
    @IsOptional()
    @IsInt()
    @IsNumber()
    @Type(() => Number)
    categoryId?: number;
}

export { getAllProductsDto };