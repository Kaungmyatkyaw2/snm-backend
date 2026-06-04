import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsInt, IsOptional, IsString, IsUrl, Min } from 'class-validator';

const PAYMENT_METHODS = ['cod', 'bank_transfer'] as const;
const DELIVERY_TIME_SLOTS = ['morning', 'afternoon', 'evening'] as const;

export class CreateCheckoutDto {
  @ApiProperty()
  @IsString()
  addressId: string;

  @ApiProperty({ enum: PAYMENT_METHODS })
  @IsEnum(PAYMENT_METHODS)
  paymentMethod: 'cod' | 'bank_transfer';

  @ApiProperty()
  @IsString()
  deliveryDate: string;

  @ApiProperty({ enum: DELIVERY_TIME_SLOTS })
  @IsEnum(DELIVERY_TIME_SLOTS)
  deliveryTimeSlot: 'morning' | 'afternoon' | 'evening';

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  bankPaymentAccountId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUrl()
  transferProofUrl?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  customerNote?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsInt()
  @Min(0)
  pointsUsed?: number;
}
