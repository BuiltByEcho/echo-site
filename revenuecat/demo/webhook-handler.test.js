import test from 'node:test';
import assert from 'node:assert/strict';
import { handleRevenueCatEvent, seenEventIds, growthEvents } from './webhook-handler.js';

test('dedupes RevenueCat webhook events by id', async () => {
  seenEventIds.clear();
  growthEvents.length = 0;

  const payload = { event: { id: 'evt_1', type: 'INITIAL_PURCHASE', app_user_id: 'user_123' } };
  const first = await handleRevenueCatEvent(payload);
  const second = await handleRevenueCatEvent(payload);

  assert.equal(first.ok, true);
  assert.equal(first.action, 'activate onboarding experiment');
  assert.equal(second.duplicate, true);
  assert.equal(growthEvents.length, 1);
});

test('rejects events without ids', async () => {
  const result = await handleRevenueCatEvent({ event: { type: 'RENEWAL' } });
  assert.equal(result.skipped, true);
});
