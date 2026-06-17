export type AnalyticsEvent = {
  name: string;
  metadata?: Record<string, unknown>;
};

export function trackEvent(event: AnalyticsEvent) {
  // Placeholder: enviar para serviço analítico real no futuro
  console.log('[analytics]', event.name, event.metadata ?? {});
}
