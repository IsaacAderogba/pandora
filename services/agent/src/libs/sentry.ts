import * as Sentry from "@sentry/node";
import * as Tracing from "@sentry/tracing";
import { yellow } from "../utils/colors";

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV,
  serverName: "agent",
  integrations: [new Tracing.Integrations.Express()],
  tracesSampleRate: 1.0,
  enabled: false,
});

const captureError = (error: unknown) => {
  console.warn(yellow, "[captured error]", error);
  Sentry.captureException(error);
};

export { Sentry, captureError };
