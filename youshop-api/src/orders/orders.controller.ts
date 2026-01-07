import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Req, HttpException, HttpStatus, RawBody } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { Request } from 'express';
import { RolesGuard } from 'src/auth/roles.guard';
import { Roles } from 'src/auth/roles.decorator';
import { ResourceOwnerGuard } from 'src/auth/resource-owner.guard';
import { ResourceOwner } from 'src/auth/resource-owner.decorator';

@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Post('webhook')
  async handleStripeWebhook(@RawBody() rawBody: Buffer, @Req() req: Request) {
    try {
      const signature = req.headers['stripe-signature'] as string;
      return await this.ordersService.handleStripeWebhook(rawBody, signature);
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)

  async create(@Req() req: Request, @Body() createOrderDto: CreateOrderDto) {
    if (!req.user || !(req.user as any).id) {
      throw new HttpException('User not authenticated', HttpStatus.UNAUTHORIZED);
    }
    try {
      return await this.ordersService.create((req.user as any).id, createOrderDto.items);
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }

  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  findAll() {
    return this.ordersService.findAll();
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard, ResourceOwnerGuard)
  @ResourceOwner('order')
  findOne(@Param('id') id: string) {
    return this.ordersService.findOne(+id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, ResourceOwnerGuard)
  @ResourceOwner('order')
  update(@Param('id') id: string, @Body() updateOrderDto: UpdateOrderDto) {
    return this.ordersService.update(+id, updateOrderDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, ResourceOwnerGuard)
  @ResourceOwner('order')
  remove(@Param('id') id: string) {
    return this.ordersService.remove(+id);
  }

  @Post(':id/confirm-payment')
  async confirmPayment(@Param('id') id: string) {
    try {
      return await this.ordersService.confirmPayment(+id);
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }
}
