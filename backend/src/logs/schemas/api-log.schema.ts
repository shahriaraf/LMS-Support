import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type ApiLogDocument = HydratedDocument<ApiLog>;

@Schema({ timestamps: true })
export class ApiLog {
  @Prop({ required: true })
  method: string;

  @Prop({ required: true })
  path: string;

  @Prop({ required: true })
  statusCode: number;

  @Prop({ type: Object })
  requestBody?: Record<string, any>;

  @Prop({ type: Object })
  responseBody?: any;

  @Prop({
    type: String,
    required: false,
    default: null,
  })
  userId?: string;

  @Prop()
  durationMs?: number;

  @Prop({ default: false })
  isError: boolean;
}

export const ApiLogSchema = SchemaFactory.createForClass(ApiLog);
