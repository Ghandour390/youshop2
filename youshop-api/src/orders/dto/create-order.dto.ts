import { ApiProperty } from "@nestjs/swagger";
import { IsArray, IsInt, Min, Max, ValidateNested, ArrayMinSize } from "class-validator";
import { Type } from "class-transformer";

class OrderItemDto {
    @IsInt()
    @Min(1)
    @Max(100)
    productId: number;

    @IsInt()
    @Min(1)
    @Max(999)
    quantity: number;
}

export class CreateOrderDto {
    @ApiProperty({ example: [{ productId: 1, quantity: 2 }], type: [OrderItemDto] })
    @IsArray()
    @ArrayMinSize(1)
    @ValidateNested({ each: true })
    @Type(() => OrderItemDto)
    items: OrderItemDto[];
}
