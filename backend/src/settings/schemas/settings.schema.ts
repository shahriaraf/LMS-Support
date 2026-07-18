import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type SettingsDocument = HydratedDocument<Settings>;

/**
 * Singleton document. There is only ever one Settings row, keyed by
 * `key: "global"`. It holds every simulated-failure toggle that the
 * Support Engineer Dashboard can flip. Flipping a toggle actually changes
 * real backend behavior on the next request - this is what makes the
 * "Suggested Fix" panel feel real instead of decorative.
 */
@Schema({ timestamps: true })
export class Settings {
  @Prop({ default: 'global', unique: true })
  key: string;

  // Issue: "Payment failed -> 500 response from mock API"
  @Prop({ default: 0.3, min: 0, max: 1 })
  paymentFailureRate: number;

  // Issue: "Video not playing -> CORS issue simulation"
  @Prop({ default: false })
  videoCorsErrorEnabled: boolean;

  // Issue: "User cannot enroll -> Database validation error"
  @Prop({ default: false })
  enrollmentValidationErrorEnabled: boolean;

  // Issue: "Button misaligned -> CSS issue" (frontend reads this flag)
  @Prop({ default: true })
  cssMisalignmentBugEnabled: boolean;
}

export const SettingsSchema = SchemaFactory.createForClass(Settings);
