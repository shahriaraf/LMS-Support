import { Controller, ForbiddenException, Get, Param, Req, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { SettingsService } from '../settings/settings.service';
import { CoursesService } from '../courses/courses.service';
import { EnrollmentsService } from '../enrollments/enrollments.service';
import { LogsService } from '../logs/logs.service';

@Controller('video')
@UseGuards(JwtAuthGuard)
export class VideoController {
  constructor(
    private readonly settingsService: SettingsService,
    private readonly coursesService: CoursesService,
    private readonly enrollmentsService: EnrollmentsService,
    private readonly logsService: LogsService,
  ) {}

  // Issue #3 from the brief: "Video not playing -> CORS issue simulation".
  // When the toggle is on, this endpoint deliberately omits
  // Access-Control-Allow-Origin, which real browsers block client-side.
  // The frontend player surfaces this as a genuine CORS console error.
  @Get(':courseId/manifest')
  async getManifest(@Param('courseId') courseId: string, @Req() req: any) {
    const course = await this.coursesService.findByIdRaw(courseId);
    const enrolled = await this.enrollmentsService.isEnrolled(req.user.userId, courseId);
    if (course.priceCents > 0 && !enrolled) {
      throw new ForbiddenException('You must be enrolled and have an active payment to watch this video.');
    }

    const settings = await this.settingsService.get();

    await this.logsService.recordActivity({
      userId: req.user.userId,
      action: 'VIDEO_MANIFEST_REQUEST',
      metadata: { courseId, corsSimulated: settings.videoCorsErrorEnabled },
    });

    // The actual Access-Control-Allow-Origin header (or its deliberate
    // omission) is handled by the CORS middleware in main.ts, keyed off
    // runtimeFlags.videoCorsErrorEnabled. If that flag is on, the browser
    // will block this response client-side before the frontend ever sees
    // this JSON - that's the real bug. This flag just lets the UI show a
    // helpful "this is the simulated CORS issue" hint if the request does
    // get through (e.g. same-origin dev proxy setups).
    return { videoUrl: course.videoUrl, corsSimulated: settings.videoCorsErrorEnabled };
  }
}
