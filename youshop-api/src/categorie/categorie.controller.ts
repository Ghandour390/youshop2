import { Controller, Post, Body, Get, Delete, Param, Put, ParseIntPipe, UseGuards } from '@nestjs/common';
import { CategorieService } from './categorie.service';
import { Roles } from 'src/auth/roles.decorator';
import { RolesGuard } from 'src/auth/roles.guard';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';

@Controller('categories')
export class CategorieController {
    constructor(private readonly categorieService: CategorieService) {}

    @Get()
    async findAll() {
        return this.categorieService.findAll();
    }

    @Post()
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('ADMIN')
    async create(@Body('name') name: string) {
        return this.categorieService.create(name);
    }

    @Get(':id')
    async findById(@Param('id', ParseIntPipe) id: number) {
        return this.categorieService.findById(id);
    }

    @Put(':id')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('ADMIN')
    async update(@Param('id', ParseIntPipe) id: number, @Body('name') name: string) {
        return this.categorieService.update(id, name);
    }

    @Delete(':id')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('ADMIN')
    async delete(@Param('id', ParseIntPipe) id: number) {
        return this.categorieService.delete(id);
    }
}

