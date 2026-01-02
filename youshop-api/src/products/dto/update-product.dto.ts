import { ApiProperty, PartialType } from '@nestjs/swagger';
import { CreateProductDto } from './create-product.dto';

export class UpdateProductDto extends PartialType(CreateProductDto) {
    @ApiProperty({ required: false })
  id?: number;
  @ApiProperty({ required: false })
  name?: string;
  @ApiProperty({ required: false })
  description?: string;
  @ApiProperty({ required: false })
  price?: number;
  @ApiProperty({ required: false })
  categoryId?: number;
  @ApiProperty({ required: false })
  quantity?: number;
}
