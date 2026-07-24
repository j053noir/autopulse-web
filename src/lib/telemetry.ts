import { WebTracerProvider } from "@opentelemetry/sdk-trace-web";
import { BatchSpanProcessor } from "@opentelemetry/sdk-trace-web";
import { OTLPTraceExporter } from "@opentelemetry/exporter-trace-otlp-http";
import { registerInstrumentations } from "@opentelemetry/instrumentation";
import { FetchInstrumentation } from "@opentelemetry/instrumentation-fetch";
import { resourceFromAttributes } from "@opentelemetry/resources";
import { W3CTraceContextPropagator } from "@opentelemetry/core";

export function initTelemetry() {
  if (typeof window === "undefined") return;

  const exporter = new OTLPTraceExporter({
    url: "http://localhost:4318/v1/traces",
  });

  const spanProcessor = new BatchSpanProcessor(exporter);

  const provider = new WebTracerProvider({
    resource: resourceFromAttributes({
      "service.name": "AutoPulse.Frontend",
    }),
    spanProcessors: [spanProcessor],
  });

  provider.register({
    propagator: new W3CTraceContextPropagator(),
  });

  registerInstrumentations({
    instrumentations: [
      new FetchInstrumentation({
        propagateTraceHeaderCorsUrls: [
          /http:\/\/localhost:5000\/api\/.*/,
        ],
      }),
    ],
  });
}
