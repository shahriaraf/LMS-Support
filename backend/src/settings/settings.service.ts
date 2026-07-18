import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ConfigService } from '@nestjs/config';
import { Settings, SettingsDocument } from './schemas/settings.schema';

/**
 * The raw Express CORS middleware in main.ts runs on every request, before
 * Nest's DI/route handling. It cannot `await` Mongo per-request without
 * hurting latency, so we mirror the one flag it needs (videoCorsErrorEnabled)
 * into this plain in-memory object. SettingsService keeps it in sync on
 * every read/write. This is the only piece of mutable module-level state
 * in the app, and it exists purely to make the CORS bug demo realistic.
 */
export const runtimeFlags = {
  videoCorsErrorEnabled: false,
};

@Injectable()
export class SettingsService {
  constructor(
    @InjectModel(Settings.name) private settingsModel: Model<SettingsDocument>,
    private config: ConfigService,
  ) {}

  async get(): Promise<SettingsDocument> {
    let doc = await this.settingsModel.findOne({ key: 'global' }).exec();
    if (!doc) {
      doc = await this.settingsModel.create({
        key: 'global',
        paymentFailureRate: Number(this.config.get('SIMULATE_PAYMENT_FAILURE_RATE') ?? 0.3),
        videoCorsErrorEnabled: this.config.get('SIMULATE_VIDEO_CORS_ERROR') === 'true',
        enrollmentValidationErrorEnabled: false,
        cssMisalignmentBugEnabled: true,
      });
    }
    runtimeFlags.videoCorsErrorEnabled = doc.videoCorsErrorEnabled;
    return doc;
  }

  async update(partial: Partial<Settings>) {
    await this.get(); // ensure exists
    const doc = await this.settingsModel
      .findOneAndUpdate({ key: 'global' }, { $set: partial }, { new: true })
      .exec();
    if (doc) runtimeFlags.videoCorsErrorEnabled = doc.videoCorsErrorEnabled;
    return doc;
  }
}
