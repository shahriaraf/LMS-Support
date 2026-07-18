import Link from 'next/link';
import { ArrowRight, ShieldAlert, CreditCard, Wifi, PenSquare, DatabaseZap, ScrollText } from 'lucide-react';

const SCENARIOS = [
  {
    icon: ShieldAlert,
    tone: 'danger' as const,
    title: 'Course won\u2019t load — 403',
    desc: 'A locked course throws a real ForbiddenException. Resolve it live from the dashboard and the fix takes effect on the student\u2019s next request.',
  },
  {
    icon: CreditCard,
    tone: 'danger' as const,
    title: 'Payment fails — 500',
    desc: 'The mock gateway declines deterministically on a known test card, or randomly at a rate you control.',
  },
  {
    icon: Wifi,
    tone: 'warn' as const,
    title: 'Video won\u2019t play — CORS',
    desc: 'The manifest endpoint genuinely omits its CORS header when the toggle is on — a real browser-blocked request, not a mock error string.',
  },
  {
    icon: PenSquare,
    tone: 'warn' as const,
    title: 'Button is misaligned — CSS',
    desc: 'A real broken layout class is applied conditionally from a backend flag. Turn it off and the fix ships instantly.',
  },
  {
    icon: DatabaseZap,
    tone: 'danger' as const,
    title: 'Can\u2019t enroll — DB validation',
    desc: 'Enrollment intentionally throws a Mongoose-style validation error until the toggle is disabled from Support Settings.',
  },
  {
    icon: ScrollText,
    tone: 'signal' as const,
    title: 'Full request & response logging',
    desc: 'Every API call, success or failure, is persisted and searchable — the exact evidence trail a real investigation needs.',
  },
];

const railClass = { danger: 'rail-danger', warn: 'rail-warn', signal: 'rail-signal' };
const tintClass = { danger: 'tint-danger', warn: 'tint-warn', signal: 'tint-signal' };

export default function HomePage() {
  return (
    <div className="space-y-20">
      <section className="pt-8 pb-4 max-w-2xl">
        <p className="font-mono text-xs uppercase tracking-widest text-signal mb-4">
          LMS + Support Engineering Console
        </p>
        <h1 className="text-4xl sm:text-[2.75rem] font-display font-semibold leading-tight tracking-tight">
          Every bug here is real. So is the fix.
        </h1>
        <p className="text-ui-muted mt-5 text-[15px] leading-relaxed">
          A working course platform wired to a genuine Support Engineer Dashboard. Report an
          issue as a student, then investigate and resolve it as support — reading real logs,
          flipping real backend state, watching the fix land without a redeploy.
        </p>
        <div className="flex items-center gap-3 mt-8">
          <Link href="/courses" className="btn btn-primary">
            Browse courses
            <ArrowRight size={15} />
          </Link>
          <Link href="/signup" className="btn btn-secondary">
            Create an account
          </Link>
        </div>
      </section>

      <section>
        <div className="flex items-baseline justify-between mb-5">
          <h2 className="font-display font-semibold text-lg">What you can reproduce</h2>
          <span className="text-xs font-mono text-ui-faint uppercase tracking-wide">6 live scenarios</span>
        </div>
        <div className="grid md:grid-cols-3 gap-3">
          {SCENARIOS.map((item) => (
            <div key={item.title} className={`card rail ${railClass[item.tone]} p-5`}>
              <span className={`icon-chip ${tintClass[item.tone]} mb-3`}>
                <item.icon size={15} />
              </span>
              <h3 className="font-medium text-sm mb-1.5">{item.title}</h3>
              <p className="text-sm text-ui-muted leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
