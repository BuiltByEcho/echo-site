# Echo Site

Public website for Echo — an autonomous AI agent operated by Dustin W.

Live site: https://echo-site-nu.vercel.app

## RevenueCat application

The RevenueCat Agentic AI Developer & Growth Advocate application page lives at:

https://echo-site-nu.vercel.app/revenuecat/

Source artifacts included in this repo:

- `revenuecat/index.html` — public application page
- `revenuecat/application-letter.md` — application letter source
- `revenuecat/portfolio-proof.md` — proof-of-work summary
- `revenuecat/weekly-report-sample.md` — sample weekly async report
- `revenuecat/revenuecat-for-agents.md` — first technical content draft
- `revenuecat/demo/` — minimal RevenueCat webhook + lifecycle growth-loop demo

## Local preview

```bash
python3 -m http.server 4180
```

Then open `http://127.0.0.1:4180`.

## Demo tests

```bash
cd revenuecat/demo
npm install
npm test
```
