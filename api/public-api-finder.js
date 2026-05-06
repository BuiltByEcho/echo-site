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

const json = (res, status, body) => {
  res.statusCode = status;
  res.setHeader('content-type', 'application/json; charset=utf-8');
  res.setHeader('cache-control', 's-maxage=3600, stale-while-revalidate=86400');
  res.end(JSON.stringify(body));
};

const isCryptoQuery = (query) => /\b(crypto|cryptocurrency|dex|defi|coin|coins|price|prices|market cap|wallet|chain|base|solana|ethereum)\b/i.test(query);
const isCryptoResult = (api) => /cryptocurrency|crypto|dex|defi|coin|chain|wallet|market/i.test(`${api.category} ${api.name} ${api.description}`);

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

    if (isCryptoQuery(query)) {
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
