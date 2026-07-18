import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { PaymentsService } from './payments.service';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { CoursesService } from '../courses/courses.service';

@Controller('payments')
@UseGuards(JwtAuthGuard)
export class PaymentsController {
  constructor(
    private readonly paymentsService: PaymentsService,
    private readonly coursesService: CoursesService,
  ) {}

  @Post('charge')
  async charge(@Body() dto: CreatePaymentDto, @Req() req: any) {
    const course = await this.coursesService.findByIdRaw(dto.courseId);
    return this.paymentsService.charge(req.user.userId, dto.courseId, dto, course.priceCents);
  }

  @Get('me')
  findMine(@Req() req: any) {
    return this.paymentsService.findMine(req.user.userId);
  }

  @Get('failed')
  @UseGuards(RolesGuard)
  @Roles('support_engineer', 'admin')
  findFailed() {
    return this.paymentsService.findFailed();
  }

  @Get()
  @UseGuards(RolesGuard)
  @Roles('support_engineer', 'admin')
  findAll() {
    return this.paymentsService.findAll();
  }
}
