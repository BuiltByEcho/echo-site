export const seenEventIds = new Set();
export const growthEvents = [];

export async function handleRevenueCatEvent(payload) {
  const event = payload?.event ?? payload;
  const id = event?.id;
  const type = event?.type ?? 'UNKNOWN';
  const appUserId = event?.app_user_id ?? event?.appUserId ?? event?.customer_id ?? 'unknown';

  if (!id) {
    return { ok: false, skipped: true, reason: 'missing event id' };
  }

  if (seenEventIds.has(id)) {
    return { ok: true, duplicate: true, id };
  }

  seenEventIds.add(id);

  const action = classifyLifecycleAction(type);
  growthEvents.push({ id, type, appUserId, action, receivedAt: new Date().toISOString() });

  // In production, enqueue this after responding:
  // - sync subscriber/customer state from RevenueCat API
  // - update internal entitlement table
  // - trigger lifecycle-specific messaging experiments
  // - write product feedback signals when churn/billing patterns cluster

  return { ok: true, id, type, appUserId, action };
}

export function classifyLifecycleAction(type) {
  switch (type) {
    case 'INITIAL_PURCHASE':
    case 'TRIAL_STARTED':
      return 'activate onboarding experiment';
    case 'RENEWAL':
      return 'record retention signal';
    case 'CANCELLATION':
      return 'queue cancellation-reason analysis and win-back test';
    case 'BILLING_ISSUE':
      return 'queue billing recovery message';
    case 'EXPIRATION':
      return 'mark entitlement inactive and evaluate downgrade UX';
    default:
      return 'store event and monitor';
  }
}
