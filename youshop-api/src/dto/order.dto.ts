export class CreateOrderDto {
  clientId: number;
  items: OrderItemDto[];
}

export class OrderItemDto {
  productId: number;
  quantity: number;
}

export class UpdateOrderDto {
  items?: OrderItemDto[];
}