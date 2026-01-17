import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Query, ParseIntPipe, Req } from '@nestjs/common';
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { RolesGuard } from 'src/auth/roles.guard';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { Roles } from 'src/auth/roles.decorator';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiResponse, ApiConsumes } from '@nestjs/swagger';

@ApiTags('Products')
@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Create a new product' })
  @ApiConsumes('multipart/form-data')
  @ApiResponse({ status: 201, description: 'Product created successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin only' })
  async create(@Req() req: any) {
    const images: Express.Multer.File[] = [];
    const fields: any = {};
    const parts = req.parts();
    
    for await (const part of parts) {
      if (part.type === 'file' && part.fieldname === 'images') {
        const buffer = await part.toBuffer();
        images.push({
          buffer,
          originalname: part.filename,
          mimetype: part.mimetype,
        } as Express.Multer.File);
      } else if (part.type === 'field') {
        fields[part.fieldname] = part.value;
      }
    }
    
    const createProductDto: CreateProductDto = {
      name: fields.name,
      description: fields.description,
      price: parseFloat(fields.price),
      categoryId: parseInt(fields.categoryId),
      quantity: parseInt(fields.quantity),
    };
    
    return this.productsService.create(createProductDto, images);
  }

  @Get()
  @ApiOperation({ summary: 'Get all products' })
  @ApiResponse({ status: 200, description: 'Products retrieved successfully' })
  findAll(@Query('categoryId') categoryId?: string) {
    return this.productsService.findAll(categoryId ? +categoryId : undefined);
  }

  @Get('search')
  @ApiOperation({ summary: 'Search products by name' })
  @ApiResponse({ status: 200, description: 'Products retrieved successfully' })
  search(@Query('name') name: string) {
    return this.productsService.search(name);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a product by ID' })
  @ApiResponse({ status: 200, description: 'Product retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Product not found' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.productsService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Update a product' })
  @ApiConsumes('multipart/form-data')
  @ApiResponse({ status: 200, description: 'Product updated successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin only' })
  async update(@Param('id', ParseIntPipe) id: number, @Req() req: any) {
    const images: Express.Multer.File[] = [];
    const fields: any = {};
    const parts = req.parts();
    
    for await (const part of parts) {
      if (part.type === 'file' && part.fieldname === 'images') {
        const buffer = await part.toBuffer();
        images.push({
          buffer,
          originalname: part.filename,
          mimetype: part.mimetype,
        } as Express.Multer.File);
      } else if (part.type === 'field') {
        fields[part.fieldname] = part.value;
      }
    }
    
    const updateProductDto: UpdateProductDto = {
      name: fields.name,
      description: fields.description,
      price: fields.price ? parseFloat(fields.price) : undefined,
      categoryId: fields.categoryId ? parseInt(fields.categoryId) : undefined,
      quantity: fields.quantity ? parseInt(fields.quantity) : undefined,
    };
    
    return this.productsService.update(id, updateProductDto, images);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Delete a product' })
  @ApiResponse({ status: 200, description: 'Product deleted successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin only' })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.productsService.remove(id);
  }
}
