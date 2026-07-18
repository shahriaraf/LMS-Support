import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { v4 as uuid } from 'uuid';
import { Payment, PaymentDocument } from './schemas/payment.schema';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { SettingsService } from '../settings/settings.service';
import { EnrollmentsService } from '../enrollments/enrollments.service';
import { LogsService } from '../logs/logs.service';

// A well-known "always declines" test card, mirroring Stripe's
// 4000000000000002 pattern, so QA/support can reliably reproduce the bug
// without relying on randomness.
const ALWAYS_FAILS_CARD = '4000000000000002';

@Injectable()
export class PaymentsService {
  constructor(
    @InjectModel(Payment.name) private paymentModel: Model<PaymentDocument>,
    private readonly settingsService: SettingsService,
    private readonly enrollmentsService: EnrollmentsService,
    private readonly logsService: LogsService,
  ) {}

  async charge(userId: string, courseId: string, dto: CreatePaymentDto, amountCents: number) {
    const settings = await this.settingsService.get();
    const isTestFailureCard = dto.cardNumber === ALWAYS_FAILS_CARD;
    const randomFailure = Math.random() < settings.paymentFailureRate;
    const shouldFail = isTestFailureCard || randomFailure;

    const providerRef = `mock_${uuid()}`;
    const last4 = dto.cardNumber.slice(-4);

    if (shouldFail) {
      const reason = isTestFailureCard
        ? 'card_declined: mock gateway returned decline for test card 4000000000000002'
        : 'gateway_timeout: mock payment provider returned a transient 500 (simulated failure rate ' +
          `${Math.round(settings.paymentFailureRate * 100)}%)`;

      await this.paymentModel.create({
        userId,
        courseId,
        amountCents,
        status: 'failed',
        failureReason: reason,
        mockCardLast4: last4,
        providerRef,
      });

      await this.logsService.recordActivity({
        userId,
        action: 'PAYMENT_FAILED',
        metadata: { courseId, reason, providerRef },
      });

      // Issue #2 from the brief: "Payment failed -> 500 response from mock API".
      throw new InternalServerErrorException({
        message: 'Payment provider error: charge could not be completed',
        providerRef,
        reason,
      });
    }

    const payment = await this.paymentModel.create({
      userId,
      courseId,
      amountCents,
      status: 'succeeded',
      mockCardLast4: last4,
      providerRef,
    });

    await this.enrollmentsService.activate(userId, courseId);

    await this.logsService.recordActivity({
      userId,
      action: 'PAYMENT_SUCCESS',
      metadata: { courseId, providerRef, amountCents },
    });

    return payment;
  }

  findMine(userId: string) {
    return this.paymentModel.find({ userId }).sort({ createdAt: -1 }).exec();
  }

  findFailed(limit = 100) {
    return this.paymentModel
      .find({ status: 'failed' })
      .sort({ createdAt: -1 })
      .limit(limit)
      .exec();
  }

  findAll(limit = 200) {
    return this.paymentModel.find().sort({ createdAt: -1 }).limit(limit).exec();
  }
}
