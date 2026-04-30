import express from 'express';
import { handleRevenueCatEvent, seenEventIds } from './webhook-handler.js';

const app = express();
app.use(express.json({ limit: '1mb' }));

app.post('/webhooks/revenuecat', async (req, res) => {
  const expected = process.env.REVENUECAT_WEBHOOK_AUTH;
  const received = req.get('authorization');

  if (expected && received !== expected) {
    return res.status(401).json({ error: 'invalid authorization header' });
  }

  // RevenueCat recommends responding quickly; real systems should enqueue work.
  const result = await handleRevenueCatEvent(req.body);
  return res.status(200).json(result);
});

app.get('/debug/seen-events', (_req, res) => {
  res.json({ seen: [...seenEventIds] });
});

const port = process.env.PORT || 3000;
if (process.argv[1] === new URL(import.meta.url).pathname) {
  app.listen(port, () => console.log(`RevenueCat demo webhook listening on :${port}`));
}

export default app;
