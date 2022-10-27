import * as Sentry from "@sentry/node";
import * as Tracing from "@sentry/tracing";
import { debug } from "../utils/debug";

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV,
  serverName: "agent",
  integrations: [new Tracing.Integrations.Express()],
  tracesSampleRate: 1.0,
  enabled: false,
});

const captureError = (error: unknown) => {
  debug("captured error,", error);
  Sentry.captureException(error);
};

export const withError = async <T>(callback: () => T | Promise<T>) => {
  try {
    await callback();
  } catch (err) {
    captureError(err);
  }
};

export { Sentry, captureError };
