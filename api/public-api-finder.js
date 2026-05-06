const CRYPTO_APIS = [
  { name: 'DexScreener', url: 'https://docs.dexscreener.com/api/reference', description: 'Free DEX market data, pairs, liquidity, price charts, and trending assets across chains.', auth: 'No', https: true, cors: 'Yes', category: 'Cryptocurrency', source: 'echo-curated', score: 120 },
  { name: 'CoinGecko', url: 'https://www.coingecko.com/en/api', description: 'Crypto prices, market data, assets, exchanges, DeFi data, and historical market charts.', auth: 'apiKey', https: true, cors: 'Yes', category: 'Cryptocurrency', source: 'echo-curated', score: 112 },
  { name: 'CoinMarketCap', url: 'https://coinmarketcap.com/api/', description: 'Crypto market rankings, quotes, metadata, exchange data, and free-tier API access with a key.', auth: 'apiKey', https: true, cors: 'Unknown', category: 'Cryptocurrency', source: 'echo-curated', score: 108 },
  { name: 'DexPaprika', url: 'https://api.dexpaprika.com', description: 'Free DEX and DeFi data: pools, assets, OHLCV, trades, and market data across chains.', auth: 'No', https: true, cors: 'Yes', category: 'Cryptocurrency', source: 'echo-curated', score: 106 },
  { name: 'DefiLlama', url: 'https://defillama.com/docs/api', description: 'Free DeFi protocol, chain TVL, stablecoin, yield, fee, revenue, and DEX volume data.', auth: 'No', https: true, cors: 'Yes', category: 'Cryptocurrency', source: 'echo-curated', score: 104 },
  { name: 'GeckoTerminal', url: 'https://www.geckoterminal.com/dex-api', description: 'DEX pools, networks, OHLCV, trades, prices, and liquidity data from CoinGecko.', auth: 'No', https: true, cors: 'Yes', category: 'Cryptocurrency', source: 'echo-curated', score: 102 },
  { name: 'Coinpaprika', url: 'https://api.coinpaprika.com/', description: 'Free crypto prices, coins, market data, exchanges, and historical data.', auth: 'No', https: true, cors: 'Yes', category: 'Cryptocurrency', source: 'echo-curated', score: 98 },
  { name: 'CoinCap', url: 'https://docs.coincap.io/', description: 'Real-time crypto prices, assets, rates, exchanges, and markets.', auth: 'No', https: true, cors: 'Unknown', category: 'Cryptocurrency', source: 'echo-curated', score: 92 },
  { name: 'Birdeye', url: 'https://docs.birdeye.so/', description: 'On-chain market data, prices, trades, wallets, and DeFi analytics across chains.', auth: 'apiKey', https: true, cors: 'Unknown', category: 'Cryptocurrency', source: 'echo-curated', score: 86 },
];


const FINANCE_APIS = [
  { name: 'Stooq', url: 'https://stooq.com/db/h/', description: 'Free historical stock quotes, daily prices, forex, indices, and CSV market data downloads.', auth: 'No', https: true, cors: 'Unknown', category: 'Finance', source: 'echo-curated', score: 118 },
  { name: 'Alpha Vantage', url: 'https://www.alphavantage.co/documentation/', description: 'Stock, ETF, forex, crypto, technical indicators, company data, and market data API with a free API-key tier.', auth: 'apiKey', https: true, cors: 'Unknown', category: 'Finance', source: 'echo-curated', score: 112 },
  { name: 'Finnhub', url: 'https://finnhub.io/docs/api', description: 'Real-time stock, forex, crypto, company fundamentals, news, and alternative market data.', auth: 'apiKey', https: true, cors: 'Unknown', category: 'Finance', source: 'echo-curated', score: 108 },
  { name: 'Twelve Data', url: 'https://twelvedata.com/docs', description: 'Stock, forex, ETF, index, and crypto market data with real-time and historical prices.', auth: 'apiKey', https: true, cors: 'Unknown', category: 'Finance', source: 'echo-curated', score: 106 },
  { name: 'Polygon.io', url: 'https://polygon.io/docs/', description: 'Stock market, options, forex, crypto, tickers, trades, aggregates, and historical market data.', auth: 'apiKey', https: true, cors: 'Unknown', category: 'Finance', source: 'echo-curated', score: 104 },
  { name: 'Tradier', url: 'https://developer.tradier.com/', description: 'US equity, options, quotes, market data, trading, and brokerage API.', auth: 'OAuth', https: true, cors: 'Yes', category: 'Finance', source: 'echo-curated', score: 98 },
  { name: 'Financial Modeling Prep', url: 'https://site.financialmodelingprep.com/developer/docs', description: 'Stock quotes, company fundamentals, financial statements, earnings, analyst estimates, and market data.', auth: 'apiKey', https: true, cors: 'Unknown', category: 'Finance', source: 'echo-curated', score: 94 },
  { name: 'Portfolio Optimizer', url: 'https://portfoliooptimizer.io/', description: 'Portfolio optimization, asset allocation, efficient frontier, risk metrics, and finance analytics API.', auth: 'No', https: true, cors: 'Yes', category: 'Finance', source: 'echo-curated', score: 72 },
];

const json = (res, status, body) => {
  res.statusCode = status;
  res.setHeader('content-type', 'application/json; charset=utf-8');
  res.setHeader('cache-control', 's-maxage=3600, stale-while-revalidate=86400');
  res.end(JSON.stringify(body));
};

const hasCryptoIntent = (query) => /\b(crypto|cryptocurrency|dex|defi|coin|coins|market cap|wallet|chain|base|solana|ethereum|bitcoin)\b/i.test(query);
const isFinanceQuery = (query) => !hasCryptoIntent(query) && /\b(stock|stocks|equity|equities|ticker|tickers|quote|quotes|market data|intraday|ohlc|candles|portfolio|options|etf|forex|earnings|fundamentals)\b/i.test(query);
const isCryptoQuery = (query) => hasCryptoIntent(query);
const isCryptoResult = (api) => /cryptocurrency|crypto|dex|defi|coin|chain|wallet|market/i.test(`${api.category} ${api.name} ${api.description}`);
const isFinanceResult = (api) => /finance|financial/i.test(String(api.category || '')); 

function normalizeResult(api) {
  return {
    name: api.name,
    url: api.url,
    description: api.description,
    auth: api.auth || 'Unknown',
    https: api.https !== false,
    cors: api.cors || 'Unknown',
    category: api.category || 'Uncategorized',
    source: api.source || 'public-api-finder',
    score: Number(api.score || 0),
  };
}

function mergeDedupe(results) {
  const seen = new Set();
  const merged = [];
  for (const api of results.map(normalizeResult)) {
    const key = `${api.name.toLowerCase()}|${api.url.toLowerCase().replace(/\/$/, '')}`;
    if (seen.has(key)) continue;
    seen.add(key);
    merged.push(api);
  }
  return merged;
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return json(res, 405, { error: 'POST required' });

  try {
    const body = typeof req.body === 'object' && req.body ? req.body : JSON.parse(req.body || '{}');
    const query = String(body.query || '').trim();
    if (!query) return json(res, 400, { error: 'query is required' });

    const options = {
      query,
      category: body.category,
      source: body.source,
      noAuth: Boolean(body.noAuth),
      https: Boolean(body.https),
      cors: body.cors || undefined,
      openapi: Boolean(body.openapi),
      limit: Math.min(Math.max(Number(body.limit || 8), 1), 20),
      check: false,
      refresh: false,
    };

    process.env.PUBLIC_API_FINDER_CACHE ||= '/tmp/public-api-finder-cache.json';
    const { searchApis } = await import('@builtbyecho/public-api-finder/src/cli.js');
    const packageResults = await searchApis(options);
    let results = packageResults;

    if (isFinanceQuery(query)) {
      results = mergeDedupe([...FINANCE_APIS, ...packageResults])
        .filter(isFinanceResult)
        .filter((api) => !options.noAuth || api.auth === 'No')
        .filter((api) => !options.https || api.https)
        .filter((api) => !options.cors || api.cors === options.cors)
        .sort((a, b) => b.score - a.score || a.name.localeCompare(b.name));
    } else if (isCryptoQuery(query)) {
      results = mergeDedupe([...CRYPTO_APIS, ...packageResults])
        .filter(isCryptoResult)
        .filter((api) => !options.noAuth || api.auth === 'No')
        .filter((api) => !options.https || api.https)
        .filter((api) => !options.cors || api.cors === options.cors)
        .sort((a, b) => b.score - a.score || a.name.localeCompare(b.name));
    }

    results = mergeDedupe(results).slice(0, options.limit);

    return json(res, 200, {
      query,
      resultCount: results.length,
      source: '@builtbyecho/public-api-finder',
      results,
    });
  } catch (err) {
    return json(res, 500, { error: err?.message || 'search failed' });
  }
}
