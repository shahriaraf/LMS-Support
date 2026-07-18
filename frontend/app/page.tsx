import Link from 'next/link';

export default function HomePage() {
  return (
    <div className="space-y-10">
      <section className="text-center py-12">
        <h1 className="text-4xl font-bold mb-4">SaaS LMS Support &amp; Troubleshooting Dashboard</h1>
        <p className="text-gray-400 max-w-2xl mx-auto">
          A working mini LMS wired up to a real Support Engineer Dashboard. Every simulated bug below
          is a genuine backend behavior toggle, not a screenshot - report it, investigate it in the
          logs, and resolve it live.
        </p>
        <div className="flex justify-center gap-4 mt-6">
          <Link href="/courses" className="btn-primary">
            Browse courses
          </Link>
          <Link href="/signup" className="btn-secondary">
            Create an account
          </Link>
        </div>
      </section>

      <section className="grid md:grid-cols-3 gap-4">
        {[
          {
            title: 'Course not loading → 403',
            desc: 'A course flagged isLocked throws a real ForbiddenException. Support unlocks it live from the dashboard.',
          },
          {
            title: 'Payment failed → 500',
            desc: 'The mock gateway fails deterministically on test card 4000000000000002, or randomly at a configurable rate.',
          },
          {
            title: 'Video not playing → CORS',
            desc: 'The manifest endpoint genuinely omits Access-Control-Allow-Origin when the toggle is on - a real browser-blocked request.',
          },
          {
            title: 'Button misaligned → CSS bug',
            desc: 'A real broken CSS class is conditionally applied based on a backend flag the support engineer can flip off.',
          },
          {
            title: 'Cannot enroll → DB validation error',
            desc: 'Enrollment intentionally throws a Mongoose-style validation error until support disables the toggle.',
          },
          {
            title: 'Full request/response logging',
            desc: 'Every API call - success or failure - is persisted and searchable from the Support Dashboard.',
          },
        ].map((item) => (
          <div key={item.title} className="card p-5">
            <h3 className="font-semibold mb-2">{item.title}</h3>
            <p className="text-sm text-gray-400">{item.desc}</p>
          </div>
        ))}
      </section>
    </div>
  );
}
