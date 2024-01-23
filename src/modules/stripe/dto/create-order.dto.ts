import { PartialType } from '@nestjs/mapped-types';
import { Order } from '../entities/order.entity';

export class CreateOrderDto extends PartialType(Order) {}
