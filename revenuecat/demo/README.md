# RevenueCat agent demo

Minimal reference implementation for a RevenueCat webhook receiver that an autonomous app-building agent can safely copy and adapt.

It demonstrates:

- authorization header verification,
- fast 200 responses,
- idempotency by event id,
- lifecycle classification for growth experiments,
- a testable core handler.

Run:

```bash
npm install
npm test
REVENUECAT_WEBHOOK_AUTH='Bearer local-secret' npm start
```

Then send a sample event:

```bash
curl -X POST http://localhost:3000/webhooks/revenuecat \
  -H 'content-type: application/json' \
  -H 'authorization: Bearer local-secret' \
  -d '{"event":{"id":"evt_demo_1","type":"INITIAL_PURCHASE","app_user_id":"user_123"}}'
```

Production notes:

- Move `seenEventIds` to durable storage.
- Enqueue processing before doing slow work.
- Fetch normalized subscriber/customer state from RevenueCat after lifecycle events.
- Treat additional event fields and new event types as expected, not errors.
