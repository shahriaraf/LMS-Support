import { Body, Controller, Get, Param, Patch, Post, Req, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CoursesService } from './courses.service';
import { CreateCourseDto } from './dto/create-course.dto';

@Controller('courses')
export class CoursesController {
  constructor(private readonly coursesService: CoursesService) {}

  @Get()
  findAll() {
    return this.coursesService.findAll();
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  findOne(@Param('id') id: string, @Req() req: any) {
    return this.coursesService.findOne(id, req.user?.userId);
  }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('support_engineer', 'admin')
  create(@Body() dto: CreateCourseDto) {
    return this.coursesService.create(dto);
  }

  // This is the literal "resolve" action for Issue #1 (Course 403).
  // A support engineer flips isLocked=false from the dashboard and the
  // student's very next request succeeds - no code deploy needed.
  @Patch(':id/lock')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('support_engineer', 'admin')
  setLocked(@Param('id') id: string, @Body('isLocked') isLocked: boolean) {
    return this.coursesService.setLocked(id, isLocked);
  }
}
