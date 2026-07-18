import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Issue, IssueDocument } from './schemas/issue.schema';
import { CreateIssueDto } from './dto/create-issue.dto';
import { ResolveIssueDto } from './dto/resolve-issue.dto';
import { SUGGESTED_FIXES } from './suggested-fixes.data';
import { SettingsService } from '../settings/settings.service';
import { CoursesService } from '../courses/courses.service';
import { LogsService } from '../logs/logs.service';

@Injectable()
export class IssuesService {
  constructor(
    @InjectModel(Issue.name) private issueModel: Model<IssueDocument>,
    private readonly settingsService: SettingsService,
    private readonly coursesService: CoursesService,
    private readonly logsService: LogsService,
  ) {}

  async create(reporterId: string, dto: CreateIssueDto) {
    const issue = await this.issueModel.create({ ...dto, reporterId, status: 'open' });
    await this.logsService.recordActivity({
      userId: reporterId,
      action: 'ISSUE_REPORTED',
      metadata: { issueId: issue.id, category: dto.category },
    });
    return this.withSuggestedFix(issue);
  }

  async findAll(status?: string) {
    const query = status ? { status } : {};
    const issues = await this.issueModel.find(query).sort({ createdAt: -1 }).exec();
    return issues.map((i) => this.withSuggestedFix(i));
  }

  async findOne(id: string) {
    const issue = await this.issueModel.findById(id).exec();
    if (!issue) throw new NotFoundException('Issue not found');
    return this.withSuggestedFix(issue);
  }

  async setStatus(id: string, status: 'open' | 'investigating' | 'resolved', assignedTo?: string) {
    const issue = await this.issueModel.findById(id).exec();
    if (!issue) throw new NotFoundException('Issue not found');
    issue.status = status;
    if (assignedTo) issue.assignedTo = assignedTo;
    await issue.save();
    return this.withSuggestedFix(issue);
  }

  async resolve(id: string, dto: ResolveIssueDto) {
    const issue = await this.issueModel.findById(id).exec();
    if (!issue) throw new NotFoundException('Issue not found');

    let fixApplied = false;
    if (dto.applyFix) {
      fixApplied = await this.applyFixForCategory(issue.category, issue.relatedCourseId);
    }

    issue.status = 'resolved';
    issue.resolutionNotes = dto.resolutionNotes ?? issue.resolutionNotes;
    issue.resolvedAt = new Date();
    await issue.save();

    await this.logsService.recordActivity({
      userId: issue.reporterId,
      action: 'ISSUE_RESOLVED',
      metadata: { issueId: issue.id, category: issue.category, fixApplied },
    });

    return { ...this.withSuggestedFix(issue), fixApplied };
  }

  /** Flips the actual underlying simulated-bug toggle for a category. */
  private async applyFixForCategory(category: Issue['category'], relatedCourseId?: string) {
    switch (category) {
      case 'COURSE_403':
        if (relatedCourseId) {
          await this.coursesService.setLocked(relatedCourseId, false);
          return true;
        }
        return false;
      case 'PAYMENT_FAILURE':
        await this.settingsService.update({ paymentFailureRate: 0 });
        return true;
      case 'VIDEO_CORS':
        await this.settingsService.update({ videoCorsErrorEnabled: false });
        return true;
      case 'ENROLLMENT_DB_ERROR':
        await this.settingsService.update({ enrollmentValidationErrorEnabled: false });
        return true;
      case 'CSS_MISALIGNMENT':
        await this.settingsService.update({ cssMisalignmentBugEnabled: false });
        return true;
      default:
        return false;
    }
  }

  private withSuggestedFix(issue: IssueDocument) {
    return {
      ...issue.toObject(),
      suggestedFix: SUGGESTED_FIXES[issue.category],
    };
  }
}
