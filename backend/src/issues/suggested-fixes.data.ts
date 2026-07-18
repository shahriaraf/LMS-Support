import { IssueCategory } from './schemas/issue.schema';

export interface SuggestedFix {
  title: string;
  likelyRootCause: string;
  steps: string[];
  relevantLogQuery: string;
}

export const SUGGESTED_FIXES: Record<IssueCategory, SuggestedFix> = {
  COURSE_403: {
    title: 'Course returns 403 Forbidden on load',
    likelyRootCause:
      'The course document has isLocked=true, so CoursesService.findOne() throws ForbiddenException before the student ever sees content.',
    steps: [
      'Reproduce: open the course detail page as the reporting user and confirm a 403 in the Network tab / API Logs.',
      'Check API Logs filtered by path "courses" and statusCode 403 to confirm the pattern and timing.',
      'Open the course record in the Courses admin list and inspect the isLocked flag.',
      'If the lock was unintentional, use "Resolve & Apply Fix" to flip isLocked to false.',
      'Ask the reporter to refresh - no redeploy or cache clear is required since the flag is read live.',
    ],
    relevantLogQuery: 'path=courses statusCode=403',
  },
  PAYMENT_FAILURE: {
    title: 'Payment charge returns 500 from mock gateway',
    likelyRootCause:
      'Either the card used matches the deterministic test-decline card (4000000000000002), or the global simulated paymentFailureRate is set above 0 and this request was randomly selected to fail.',
    steps: [
      'Check the Payments log for this user - look at failureReason to see if it was card_declined (deterministic) or gateway_timeout (randomized).',
      'If card_declined: this is expected behavior for the test card and the user should be advised to use a different mock card number.',
      'If gateway_timeout: check current paymentFailureRate in Support Settings. If it is unexpectedly high, lower or zero it.',
      'Use "Resolve & Apply Fix" to set paymentFailureRate to 0 for this environment.',
      'Ask the student to retry the checkout - enrollment activates automatically on the next successful charge.',
    ],
    relevantLogQuery: 'path=payments/charge statusCode=500',
  },
  VIDEO_CORS: {
    title: 'Video fails to load with a CORS console error',
    likelyRootCause:
      'The videoCorsErrorEnabled toggle is on, so the API server intentionally omits Access-Control-Allow-Origin on the /video/:id/manifest response, and the browser blocks it client-side.',
    steps: [
      'Reproduce: open browser DevTools Console on the course video page and look for "blocked by CORS policy".',
      'Confirm in Support Settings that videoCorsErrorEnabled is true.',
      'Use "Resolve & Apply Fix" to disable videoCorsErrorEnabled.',
      'Have the user hard-refresh (CORS preflight responses can be cached by the browser for a few minutes).',
    ],
    relevantLogQuery: 'path=video statusCode=200',
  },
  CSS_MISALIGNMENT: {
    title: 'Enroll button is visually misaligned',
    likelyRootCause:
      'The frontend reads GET /settings/public and applies a deliberately broken flex/margin utility class when cssMisalignmentBugEnabled is true, reproducing a real CSS regression.',
    steps: [
      'Ask the user for a screenshot or reproduce directly on the course page.',
      'Confirm cssMisalignmentBugEnabled is true via GET /settings.',
      'Use "Resolve & Apply Fix" to disable cssMisalignmentBugEnabled.',
      'Verify the layout on both desktop and mobile widths using the Browser Compatibility Checker.',
    ],
    relevantLogQuery: 'n/a - client-side rendering issue, not present in API logs',
  },
  ENROLLMENT_DB_ERROR: {
    title: 'Enrollment fails with a database validation error',
    likelyRootCause:
      'The enrollmentValidationErrorEnabled toggle is on, so EnrollmentsService.enroll() intentionally throws a 400 mimicking a Mongoose schema validation failure before writing to the database.',
    steps: [
      'Check API Logs for POST /enrollments returning 400 with message containing "Enrollment.validate failed".',
      'Confirm enrollmentValidationErrorEnabled is true in Support Settings.',
      'Use "Resolve & Apply Fix" to disable the flag.',
      'Ask the user to retry enrollment; also check course.maxSeats in case the course is separately full.',
    ],
    relevantLogQuery: 'path=enrollments statusCode=400',
  },
  OTHER: {
    title: 'Uncategorized issue',
    likelyRootCause: 'Not automatically diagnosable - needs manual investigation.',
    steps: [
      'Review the reporter\'s Activity Log for the surrounding time window.',
      'Cross-reference API Logs for any non-2xx responses around the same timestamp.',
      'Escalate to engineering if no simulated-toggle explanation fits.',
    ],
    relevantLogQuery: 'n/a',
  },
};
