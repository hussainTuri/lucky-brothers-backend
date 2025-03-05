import * as Sentry from "@sentry/node";
import { nodeProfilingIntegration } from '@sentry/profiling-node';
// import package.json
import packageJson from './package.json';

// Ensure to call this before importing any other modules!
Sentry.init({
  environment: process.env.APP_ENV ?? 'dev',
  release: packageJson.version ?? '0.0.0',
  dsn: "https://f2e8e4a6fa4ec858a790eaebe29a6fe6@o943964.ingest.us.sentry.io/4507916658868224",
  integrations: [
    // Add our Profiling integration
    nodeProfilingIntegration(),
  ],

  // Add Tracing by setting tracesSampleRate
  // We recommend adjusting this value in production
  tracesSampleRate: 1.0,

  // Set sampling rate for profiling
  // This is relative to tracesSampleRate
  profilesSampleRate: 1.0,
});
