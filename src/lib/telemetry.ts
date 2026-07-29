export type TelemetryKind = 'wallet_login' | 'route_funded' | 'quest_reward' | 'quest_receipt' | 'jetpack_shop' | 'jetpack_reward' | 'jetpack_receipt';
export type TelemetryEventInput = { kind: TelemetryKind; wallet: string; hash: string; label: string; amount?: string };

/** Fire-and-forget observability; wallet actions never fail just because analytics are unavailable. */
export function recordTelemetry(event: TelemetryEventInput) {
  void fetch('/api/telemetry', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(event) }).catch(() => undefined);
}

export type AdminTelemetryEvent = TelemetryEventInput & { createdAt: string };
export type AdminTelemetrySnapshot = { uniqueWallets: number; loginEvents: number; transactionCount: number; generatedAt: string; events: AdminTelemetryEvent[] };

export async function getAdminTelemetry(token: string): Promise<AdminTelemetrySnapshot> {
  const response = await fetch('/api/telemetry', { headers: { 'x-admin-token': token } });
  const body = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(typeof body.error === 'string' ? body.error : 'The observatory could not load its telemetry.');
  return body as AdminTelemetrySnapshot;
}
