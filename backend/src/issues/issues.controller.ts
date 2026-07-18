import { Body, Controller, Get, Param, Patch, Post, Query, Req, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { IssuesService } from './issues.service';
import { CreateIssueDto } from './dto/create-issue.dto';
import { ResolveIssueDto } from './dto/resolve-issue.dto';

@Controller('issues')
@UseGuards(JwtAuthGuard)
export class IssuesController {
  constructor(private readonly issuesService: IssuesService) {}

  // Any logged-in student can report an issue - mirrors a real "Report a problem" button.
  @Post()
  create(@Body() dto: CreateIssueDto, @Req() req: any) {
    return this.issuesService.create(req.user.userId, dto);
  }

  @Get()
  @UseGuards(RolesGuard)
  @Roles('support_engineer', 'admin')
  findAll(@Query('status') status?: string) {
    return this.issuesService.findAll(status);
  }

  @Get(':id')
  @UseGuards(RolesGuard)
  @Roles('support_engineer', 'admin')
  findOne(@Param('id') id: string) {
    return this.issuesService.findOne(id);
  }

  @Patch(':id/status')
  @UseGuards(RolesGuard)
  @Roles('support_engineer', 'admin')
  setStatus(
    @Param('id') id: string,
    @Body('status') status: 'open' | 'investigating' | 'resolved',
    @Req() req: any,
  ) {
    return this.issuesService.setStatus(id, status, req.user.userId);
  }

  @Patch(':id/resolve')
  @UseGuards(RolesGuard)
  @Roles('support_engineer', 'admin')
  resolve(@Param('id') id: string, @Body() dto: ResolveIssueDto) {
    return this.issuesService.resolve(id, dto);
  }
}
