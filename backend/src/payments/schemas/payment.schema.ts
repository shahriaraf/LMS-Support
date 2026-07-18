import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type PaymentDocument = HydratedDocument<Payment>;

@Schema({ timestamps: true })
export class Payment {
  @Prop({ required: true })
  userId: string;

  @Prop({ required: true })
  courseId: string;

  @Prop({ required: true })
  amountCents: number;

  @Prop({ enum: ['succeeded', 'failed'], required: true })
  status: 'succeeded' | 'failed';

  @Prop()
  failureReason?: string;

  @Prop({ required: true })
  mockCardLast4: string;

  @Prop({ required: true })
  providerRef: string;
}

export const PaymentSchema = SchemaFactory.createForClass(Payment);
