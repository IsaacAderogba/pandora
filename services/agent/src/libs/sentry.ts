import * as Sentry from "@sentry/node";
import * as Tracing from "@sentry/tracing";

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV,
  serverName: "agent",
  integrations: [new Tracing.Integrations.Express()],
  tracesSampleRate: 1.0,
  enabled: true,
});

export { Sentry };
