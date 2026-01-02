import { Controller, Post, Body, Get, Delete, Param, Put, ParseIntPipe } from '@nestjs/common';
import { CategorieService } from './categorie.service';

@Controller('categories')
export class CategorieController {
    constructor(private readonly categorieService: CategorieService) {}

    @Get()
    async findAll() {
        return this.categorieService.findAll();
    }

    @Post()
    async create(@Body('name') name: string) {
        return this.categorieService.create(name);
    }

    @Get(':id')
    async findById(@Param('id', ParseIntPipe) id: number) {
        return this.categorieService.findById(id);
    }

    @Put(':id')
    async update(@Param('id', ParseIntPipe) id: number, @Body('name') name: string) {
        return this.categorieService.update(id, name);
    }

    @Delete(':id')
    async delete(@Param('id', ParseIntPipe) id: number) {
        return this.categorieService.delete(id);
    }
}

