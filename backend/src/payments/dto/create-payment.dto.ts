import { IsMongoId, IsString, Length, Matches } from 'class-validator';

export class CreatePaymentDto {
  @IsMongoId()
  courseId: string;

  @IsString()
  @Matches(/^\d{13,19}$/, { message: 'cardNumber must be 13-19 digits (mock validation)' })
  cardNumber: string;

  @IsString()
  @Length(3, 4)
  cvc: string;

  @IsString()
  expiry: string; // MM/YY
}
