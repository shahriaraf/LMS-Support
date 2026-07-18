import { Body, Controller, Get, Param, Post, Req, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { QuizService } from './quiz.service';
import { SubmitQuizDto } from './dto/submit-quiz.dto';

@Controller('quiz')
@UseGuards(JwtAuthGuard)
export class QuizController {
  constructor(private readonly quizService: QuizService) {}

  @Get('course/:courseId')
  findByCourse(@Param('courseId') courseId: string) {
    return this.quizService.findByCourse(courseId);
  }

  @Post('submit')
  submit(@Body() dto: SubmitQuizDto, @Req() req: any) {
    return this.quizService.submit(req.user.userId, dto.quizId, dto.answers);
  }
}
