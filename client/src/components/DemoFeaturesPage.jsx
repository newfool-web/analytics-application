import { useDemoTracker } from './useDemoTracker';

export default function DemoFeaturesPage() {
  useDemoTracker();

  return (
    <div className="flex min-h-screen items-center justify-center bg-surface-50 px-4 text-center text-surface-900 antialiased">
      <div className="max-w-lg">
        <p className="text-lg leading-8 text-surface-600">
          This is the features demo page with a simple second stop in the funnel.
          Use it to verify page views across separate routes.
        </p>
        <a
          href="/demo"
          className="mt-8 inline-block text-sm font-medium text-primary-600 transition-colors hover:text-primary-700"
        >
          Back to Demo Home
        </a>
      </div>
    </div>
  );
}
