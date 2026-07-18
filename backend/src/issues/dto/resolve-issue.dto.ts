import { IsBoolean, IsOptional, IsString } from 'class-validator';

export class ResolveIssueDto {
  @IsOptional()
  @IsString()
  resolutionNotes?: string;

  // When true, the backend actually flips the underlying simulated-bug
  // toggle (e.g. unlocks the course, disables the CORS fault, resets the
  // payment failure rate) instead of just marking the ticket resolved.
  @IsOptional()
  @IsBoolean()
  applyFix?: boolean;
}
