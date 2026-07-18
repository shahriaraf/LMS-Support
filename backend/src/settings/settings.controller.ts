import { Body, Controller, Get, Patch, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { SettingsService } from './settings.service';

@Controller('settings')
export class SettingsController {
  constructor(private readonly settingsService: SettingsService) {}

  // Public: any logged-out visitor can hit this so the LMS UI knows
  // whether to render the (intentionally) buggy CSS state.
  @Get('public')
  async getPublic() {
    const s = await this.settingsService.get();
    return { cssMisalignmentBugEnabled: s.cssMisalignmentBugEnabled };
  }

  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('support_engineer', 'admin')
  getAll() {
    return this.settingsService.get();
  }

  @Patch()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('support_engineer', 'admin')
  update(@Body() body: any) {
    return this.settingsService.update(body);
  }
}
