import { useDemoTracker } from './useDemoTracker';

const demoStops = [
  {
    title: 'Products Demo',
    href: '/demo/products',
    description: 'Another route to confirm page views and navigation across separate URLs.',
    cta: 'Open Products Demo',
    primary: true,
  },
  {
    title: 'Features Demo',
    href: '/demo/features',
    description: 'Another route to confirm page views and navigation across separate URLs.',
    cta: 'Open Features Demo',
    primary: false,
  },
];

export default function DemoPage() {
  useDemoTracker();

  return (
    <div className="min-h-screen bg-surface-50 text-surface-900 antialiased">
      <header className="border-b border-surface-200 bg-white">
        <div className="mx-auto flex h-16 max-w-4xl items-center justify-between px-4 sm:px-6">
          <div className="flex items-center gap-3">
            <span className="flex size-9 items-center justify-center rounded-lg bg-primary-600 text-sm font-bold text-white">
              D
            </span>
            <span className="text-lg font-bold text-primary-700">Demo</span>
          </div>
          <a
            href="/"
            className="text-sm font-medium text-surface-600 transition-colors hover:text-primary-600"
          >
            Dashboard
          </a>
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-4 py-12 sm:px-6 sm:py-16">
        <div className="text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-primary-600">
            CausalFunnel Analytics
          </p>
          <h1 className="mt-3 text-3xl font-bold text-surface-900 sm:text-4xl">
            Multi-page demo hub
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-lg leading-8 text-surface-600">
            Use this home page as the starting point for a realistic browsing session. The tracker
            records each full navigation between routes so you can inspect journeys in the dashboard.
          </p>
          <p className="mx-auto mt-4 max-w-2xl text-base leading-7 text-surface-500">
            Start here, open one or both demo pages below, then return to the dashboard to review
            sessions, heatmaps, and event timelines.
          </p>
        </div>

        <div className="mt-12 grid gap-6 sm:grid-cols-2">
          {demoStops.map((stop) => (
            <article
              key={stop.href}
              className="flex flex-col rounded-xl border border-surface-200 bg-white p-6 text-left shadow-sm"
            >
              <h2 className="text-xl font-semibold text-surface-900">{stop.title}</h2>
              <p className="mt-3 flex-1 text-sm leading-6 text-surface-500">{stop.description}</p>
              <a
                href={stop.href}
                className={
                  stop.primary
                    ? 'mt-6 inline-flex justify-center rounded-lg bg-primary-600 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-primary-700'
                    : 'mt-6 inline-flex justify-center rounded-lg border border-primary-600 px-5 py-2.5 text-sm font-semibold text-primary-700 transition-colors hover:bg-primary-50'
                }
              >
                {stop.cta}
              </a>
            </article>
          ))}
        </div>

        <section className="mt-12 rounded-xl border border-dashed border-surface-300 bg-white/60 px-6 py-8 text-center">
          <h2 className="text-lg font-semibold text-surface-900">What to try</h2>
          <ul className="mx-auto mt-4 max-w-xl space-y-2 text-left text-sm leading-6 text-surface-600">
            <li>Load this page first, then click through to Products and Features in any order.</li>
            <li>Use the browser back button or the demo home link on each subpage to move around.</li>
            <li>Open Dashboard when you are ready to compare the recorded session against the UI.</li>
          </ul>
        </section>
      </main>
    </div>
  );
}
