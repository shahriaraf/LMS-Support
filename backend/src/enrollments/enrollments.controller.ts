import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { EnrollmentsService } from './enrollments.service';
import { EnrollDto } from './dto/enroll.dto';

@Controller('enrollments')
@UseGuards(JwtAuthGuard)
export class EnrollmentsController {
  constructor(private readonly enrollmentsService: EnrollmentsService) {}

  @Post()
  enroll(@Body() dto: EnrollDto, @Req() req: any) {
    return this.enrollmentsService.enroll(req.user.userId, dto.courseId);
  }

  @Get('me')
  findMine(@Req() req: any) {
    return this.enrollmentsService.findMine(req.user.userId);
  }

  @Get()
  @UseGuards(RolesGuard)
  @Roles('support_engineer', 'admin')
  findAll() {
    return this.enrollmentsService.findAll();
  }
}
