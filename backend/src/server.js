import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { finnhubService } from './services/finnhubService.js';
import { tavilyService } from './services/tavilyService.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../../.env') });
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

const ordersDb = [];

// Comprehensive Catalog: Indian Startups, Mini-Startups, NSE/BSE Tech IPOs & Global Giants
const LISTED_COMPANIES_CATALOG = [
  // ── Indian Startups & Mini-Startups ──
  {
    symbol: 'MEETMUX',
    name: 'MeetMux Technologies',
    sector: 'Enterprise Video SaaS',
    market: 'India (Bengaluru)',
    currency: '₹',
    color: '#6366F1',
    initials: 'MM',
    ipoDate: 'Series A (Pre-IPO)',
    ipoPrice: '₹45.00',
    marketCap: '₹320 Cr',
    defaultPrice: 148.50,
    change: '+8.40%',
    isUp: true,
    pe: '24.5',
    status: 'Startup / Series A',
    stage: 'Series A',
    city: 'Bengaluru',
  },
  {
    symbol: 'PLACEMUX',
    name: 'PlaceMux Tech Labs',
    sector: 'Campus Recruitment & EdTech',
    market: 'India (Gurugram)',
    currency: '₹',
    color: '#EC4899',
    initials: 'PM',
    ipoDate: 'Seed / Early Venture',
    ipoPrice: '₹12.50',
    marketCap: '₹140 Cr',
    defaultPrice: 62.80,
    change: '+12.60%',
    isUp: true,
    pe: '18.2',
    status: 'Mini Startup',
    stage: 'Seed Venture',
    city: 'Gurugram',
  },
  {
    symbol: 'KISANAI',
    name: 'KisanAI Agri Labs',
    sector: 'AgriTech & Yield Analytics',
    market: 'India (Pune)',
    currency: '₹',
    color: '#10B981',
    initials: 'KA',
    ipoDate: 'Seed Stage',
    ipoPrice: '₹8.00',
    marketCap: '₹85 Cr',
    defaultPrice: 38.40,
    change: '+15.20%',
    isUp: true,
    pe: '16.5',
    status: 'Mini Startup',
    stage: 'Seed Stage',
    city: 'Pune',
  },
  {
    symbol: 'DEVMUX',
    name: 'DevMux Cloud Engine',
    sector: 'Developer Tooling & Cloud',
    market: 'India (Hyderabad)',
    currency: '₹',
    color: '#8B5CF6',
    initials: 'DM',
    ipoDate: 'Pre-Series A',
    ipoPrice: '₹15.00',
    marketCap: '₹55 Cr',
    defaultPrice: 24.20,
    change: '+9.10%',
    isUp: true,
    pe: '21.0',
    status: 'Mini Startup',
    stage: 'Pre-Series A',
    city: 'Hyderabad',
  },
  {
    symbol: 'FINMUX',
    name: 'FinMux UPI Security',
    sector: 'FinTech & UPI Infrastructure',
    market: 'India (Bengaluru)',
    currency: '₹',
    color: '#F59E0B',
    initials: 'FM',
    ipoDate: 'Seed Stage',
    ipoPrice: '₹18.00',
    marketCap: '₹92 Cr',
    defaultPrice: 41.50,
    change: '+6.75%',
    isUp: true,
    pe: '22.8',
    status: 'Mini Startup',
    stage: 'Seed Stage',
    city: 'Bengaluru',
  },
  {
    symbol: 'ZEPTO',
    name: 'Zepto (KiranaKart Technologies)',
    sector: 'Quick Commerce & Logistics',
    market: 'India (Mumbai)',
    currency: '₹',
    color: '#9333EA',
    initials: 'ZP',
    ipoDate: 'Series E Unicorn',
    ipoPrice: '₹150.00',
    marketCap: '₹41,000 Cr',
    defaultPrice: 310.00,
    change: '+7.80%',
    isUp: true,
    pe: '36.4',
    status: 'Unicorn',
    stage: 'Series E Unicorn',
    city: 'Mumbai',
  },
  {
    symbol: 'PW',
    name: 'PhysicsWallah EdTech',
    sector: 'EdTech & Test Prep',
    market: 'India (Noida)',
    currency: '₹',
    color: '#3B82F6',
    initials: 'PW',
    ipoDate: 'Series B Unicorn',
    ipoPrice: '₹110.00',
    marketCap: '₹23,400 Cr',
    defaultPrice: 215.00,
    change: '+4.50%',
    isUp: true,
    pe: '28.0',
    status: 'Unicorn',
    stage: 'Series B Unicorn',
    city: 'Noida',
  },
  {
    symbol: 'ZOMATO.NS',
    name: 'Zomato Ltd (Blinkit)',
    sector: 'Food Delivery & Logistics',
    market: 'NSE / BSE (India)',
    currency: '₹',
    color: '#E23744',
    initials: 'ZO',
    ipoDate: 'Jul 23, 2021',
    ipoPrice: '₹76.00',
    marketCap: '₹2.45 Lakh Cr',
    defaultPrice: 280.40,
    change: '+3.85%',
    isUp: true,
    pe: '62.4',
    status: 'NSE Listed',
    stage: 'Public Listed',
    city: 'Gurugram',
  },
  {
    symbol: 'OLAELEC.NS',
    name: 'Ola Electric Mobility',
    sector: 'EV Mobility & CleanTech',
    market: 'NSE / BSE (India)',
    currency: '₹',
    color: '#00C853',
    initials: 'OE',
    ipoDate: 'Aug 09, 2024',
    ipoPrice: '₹76.00',
    marketCap: '₹38,500 Cr',
    defaultPrice: 94.20,
    change: '+2.10%',
    isUp: true,
    pe: '38.0',
    status: 'Recent IPO',
    stage: 'Public Listed',
    city: 'Bengaluru',
  },
  {
    symbol: 'SWIGGY',
    name: 'Swiggy Limited',
    sector: 'Food Delivery & Quick Commerce',
    market: 'India (Upcoming IPO)',
    currency: '₹',
    color: '#FC8019',
    initials: 'SW',
    ipoDate: 'Nov 2024 (IPO)',
    ipoPrice: '₹390.00',
    marketCap: '₹88,000 Cr',
    defaultPrice: 420.00,
    change: '+5.20%',
    isUp: true,
    pe: '45.0',
    status: 'Upcoming IPO',
    stage: 'Pre-IPO',
    city: 'Bengaluru',
  },
  {
    symbol: 'NYKAA.NS',
    name: 'FSN E-Commerce (Nykaa)',
    sector: 'Fashion & Beauty E-Commerce',
    market: 'NSE / BSE (India)',
    currency: '₹',
    color: '#FC2779',
    initials: 'NY',
    ipoDate: 'Nov 10, 2021',
    ipoPrice: '₹1,125',
    marketCap: '₹56,400 Cr',
    defaultPrice: 198.60,
    change: '-0.75%',
    isUp: false,
    pe: '84.2',
    status: 'NSE Listed',
    stage: 'Public Listed',
    city: 'Mumbai',
  },
  {
    symbol: 'HONASA.NS',
    name: 'Honasa Consumer (Mamaearth)',
    sector: 'D2C Personal Care',
    market: 'NSE / BSE (India)',
    currency: '₹',
    color: '#28A745',
    initials: 'ME',
    ipoDate: 'Nov 07, 2023',
    ipoPrice: '₹324.00',
    marketCap: '₹12,800 Cr',
    defaultPrice: 395.10,
    change: '+1.45%',
    isUp: true,
    pe: '52.1',
    status: 'Recent IPO',
    stage: 'Public Listed',
    city: 'Gurugram',
  },
  {
    symbol: 'PAYTM.NS',
    name: 'One97 Communications (Paytm)',
    sector: 'FinTech & Digital Payments',
    market: 'NSE / BSE (India)',
    currency: '₹',
    color: '#00BAF2',
    initials: 'PY',
    ipoDate: 'Nov 18, 2021',
    ipoPrice: '₹2,150',
    marketCap: '₹42,000 Cr',
    defaultPrice: 660.30,
    change: '+4.15%',
    isUp: true,
    pe: '32.0',
    status: 'NSE Listed',
    stage: 'Public Listed',
    city: 'Noida',
  },
  {
    symbol: 'RELIANCE.NS',
    name: 'Reliance Industries (Jio)',
    sector: 'Telecom & Digital Services',
    market: 'NSE / BSE (India)',
    currency: '₹',
    color: '#0B2046',
    initials: 'RI',
    ipoDate: 'Nov 1977',
    ipoPrice: '₹10.00',
    marketCap: '₹20.2 Lakh Cr',
    defaultPrice: 2980.50,
    change: '+0.75%',
    isUp: true,
    pe: '26.8',
    status: 'Mega-Cap',
    stage: 'Public Listed',
    city: 'Mumbai',
  },
  {
    symbol: 'TCS.NS',
    name: 'Tata Consultancy Services',
    sector: 'IT Consulting & Cloud',
    market: 'NSE / BSE (India)',
    currency: '₹',
    color: '#002147',
    initials: 'TC',
    ipoDate: 'Aug 2004',
    ipoPrice: '₹850.00',
    marketCap: '₹15.4 Lakh Cr',
    defaultPrice: 4250.00,
    change: '+0.45%',
    isUp: true,
    pe: '30.2',
    status: 'Mega-Cap',
    stage: 'Public Listed',
    city: 'Mumbai',
  },

  // ── Global Tech & US IPOs ──
  {
    symbol: 'AAPL',
    name: 'Apple Inc.',
    sector: 'Consumer Electronics & OS',
    market: 'NASDAQ (USA)',
    currency: '$',
    color: '#18181B',
    initials: 'AP',
    ipoDate: 'Dec 12, 1980',
    ipoPrice: '$22.00',
    marketCap: '$4.92T',
    defaultPrice: 337.02,
    change: '-0.80%',
    isUp: false,
    pe: '33.8',
    status: 'Established',
    stage: 'Public Listed',
    city: 'Cupertino, CA',
  },
  {
    symbol: 'NVDA',
    name: 'Nvidia Corp.',
    sector: 'Semiconductors & GPUs',
    market: 'NASDAQ (USA)',
    currency: '$',
    color: '#76B900',
    initials: 'NV',
    ipoDate: 'Jan 22, 1999',
    ipoPrice: '$12.00',
    marketCap: '$3.02T',
    defaultPrice: 122.40,
    change: '+3.15%',
    isUp: true,
    pe: '42.1',
    status: 'Hyper-Growth',
    stage: 'Public Listed',
    city: 'Santa Clara, CA',
  },
  {
    symbol: 'ARM',
    name: 'Arm Holdings plc',
    sector: 'Semiconductors & IP',
    market: 'NASDAQ (USA)',
    currency: '$',
    color: '#0091BD',
    initials: 'AR',
    ipoDate: 'Sep 14, 2023',
    ipoPrice: '$51.00',
    marketCap: '$142B',
    defaultPrice: 138.50,
    change: '+4.20%',
    isUp: true,
    pe: '68.0',
    status: 'Recent IPO',
    stage: 'Public Listed',
    city: 'Cambridge, UK',
  },
  {
    symbol: 'RDDT',
    name: 'Reddit Inc.',
    sector: 'Social Platforms & Communities',
    market: 'NYSE (USA)',
    currency: '$',
    color: '#FF4500',
    initials: 'RD',
    ipoDate: 'Mar 21, 2024',
    ipoPrice: '$34.00',
    marketCap: '$18.4B',
    defaultPrice: 114.20,
    change: '+5.60%',
    isUp: true,
    pe: '48.2',
    status: 'Recent IPO',
    stage: 'Public Listed',
    city: 'San Francisco, CA',
  },
];

function generate30DayTrajectory(basePrice, isUp) {
  const points = [];
  let current = basePrice * (isUp ? 0.93 : 1.07);
  const step = (basePrice - current) / 30;

  for (let i = 0; i < 30; i++) {
    const randomDelta = (Math.random() - 0.48) * (basePrice * 0.035);
    current = Math.max(basePrice * 0.4, current + step + randomDelta);
    points.push({
      index: i,
      value: parseFloat(current.toFixed(2)),
      label: `Day ${i + 1}`,
    });
  }
  points[points.length - 1].value = basePrice;
  return points;
}

// ── Health Check ──
app.get('/api/health', (req, res) => {
  res.json({
    status: 'online',
    timestamp: new Date().toISOString(),
    services: {
      finnhub: true,
      tavily: true,
    },
  });
});

// ── Listed IPOs & Startups Catalog ──
app.get('/api/ipos', async (req, res) => {
  const { market } = req.query; // 'india', 'global', 'startups', 'all'
  
  let filteredCatalog = LISTED_COMPANIES_CATALOG;
  if (market === 'ministartups') {
    filteredCatalog = LISTED_COMPANIES_CATALOG.filter((c) => c.status === 'Mini Startup' || c.stage?.includes('Seed') || c.stage?.includes('Series A'));
  } else if (market === 'startups') {
    filteredCatalog = LISTED_COMPANIES_CATALOG.filter((c) => c.status.includes('Startup') || c.status.includes('Unicorn') || c.stage?.includes('Series') || c.stage?.includes('Seed'));
  } else if (market === 'india-ipos') {
    filteredCatalog = LISTED_COMPANIES_CATALOG.filter((c) => c.currency === '₹' && (c.status.includes('IPO') || c.status.includes('NSE Listed')));
  } else if (market === 'india') {
    filteredCatalog = LISTED_COMPANIES_CATALOG.filter((c) => c.currency === '₹');
  } else if (market === 'global') {
    filteredCatalog = LISTED_COMPANIES_CATALOG.filter((c) => c.currency === '$');
  }

  try {
    const enrichedList = await Promise.all(
      filteredCatalog.map(async (item) => {
        if (item.currency === '$') {
          try {
            const liveQuote = await finnhubService.getQuote(item.symbol);
            if (liveQuote && liveQuote.currentPrice) {
              return {
                ...item,
                price: liveQuote.currentPrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
                rawPrice: liveQuote.currentPrice,
                change: `${liveQuote.percentChange >= 0 ? '+' : ''}${liveQuote.percentChange.toFixed(2)}%`,
                isUp: liveQuote.isUp,
              };
            }
          } catch (e) {}
        }
        return {
          ...item,
          price: item.defaultPrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
          rawPrice: item.defaultPrice,
        };
      })
    );

    res.json({
      success: true,
      totalCount: enrichedList.length,
      data: enrichedList,
      source: 'Finnhub & Startup Intelligence Engine',
    });
  } catch (err) {
    res.json({
      success: true,
      totalCount: filteredCatalog.length,
      data: filteredCatalog,
      source: 'TradeStream Catalog',
    });
  }
});

const COMMON_NAME_TO_TICKER = {
  MICROSOFT: 'MSFT',
  MSFT: 'MSFT',
  GOOGLE: 'GOOGL',
  ALPHABET: 'GOOGL',
  GOOGL: 'GOOGL',
  GOOG: 'GOOGL',
  TESLA: 'TSLA',
  TSLA: 'TSLA',
  AMAZON: 'AMZN',
  AMZN: 'AMZN',
  META: 'META',
  FACEBOOK: 'META',
  NETFLIX: 'NFLX',
  NFLX: 'NFLX',
  UBER: 'UBER',
  AIRBNB: 'ABNB',
  ABNB: 'ABNB',
  SPOTIFY: 'SPOT',
  SPOT: 'SPOT',
  INFOSYS: 'INFY',
  INFY: 'INFY',
  WIPRO: 'WIT',
  WIT: 'WIT',
  COINBASE: 'COIN',
  COIN: 'COIN',
  DISNEY: 'DIS',
  DIS: 'DIS',
  INTEL: 'INTC',
  INTC: 'INTC',
  AMD: 'AMD',
  QUALCOMM: 'QCOM',
  QCOM: 'QCOM',
  ORACLE: 'ORCL',
  ORCL: 'ORCL',
  ADOBE: 'ADBE',
  ADBE: 'ADBE',
  SALESFORCE: 'CRM',
  CRM: 'CRM',
  SNOWFLAKE: 'SNOW',
  SNOW: 'SNOW',
  PALANTIR: 'PLTR',
  PLTR: 'PLTR',
  LENSKART: 'LENSKART',
  CRED: 'CRED',
  RAZORPAY: 'RAZORPAY',
  GROWW: 'GROWW',
  OPENAI: 'OPENAI',
  STRIPE: 'STRIPE',
};

// ── Search Endpoint for Global Stocks and Startups ──
app.get('/api/search', async (req, res) => {
  const q = (req.query.q || '').trim();
  if (!q) {
    return res.json({ success: true, data: LISTED_COMPANIES_CATALOG.slice(0, 8) });
  }

  const queryUpper = q.toUpperCase();

  // 1. Local catalog matches
  const localMatches = LISTED_COMPANIES_CATALOG.filter(
    (c) =>
      c.name.toUpperCase().includes(queryUpper) ||
      c.symbol.toUpperCase().includes(queryUpper) ||
      (c.sector && c.sector.toUpperCase().includes(queryUpper))
  );

  // 2. Finnhub symbol search
  try {
    const finnhubResults = await finnhubService.searchSymbol(q);
    const globalMatches = (finnhubResults || []).slice(0, 6).map((item) => ({
      symbol: item.symbol,
      name: item.name || item.displaySymbol,
      sector: 'Public Listed Equities',
      market: 'Global / US Exchanges',
      currency: '$',
      color: '#18181B',
      initials: item.symbol.slice(0, 2),
      ipoDate: 'Listed',
      ipoPrice: '—',
      marketCap: 'Large-Cap',
      defaultPrice: 150.0,
      change: '+1.50%',
      isUp: true,
      status: 'Global Listing',
      stage: 'Public Listed',
    }));

    // Deduplicate
    const combined = [...localMatches];
    for (const gm of globalMatches) {
      if (!combined.some((c) => c.symbol === gm.symbol)) {
        combined.push(gm);
      }
    }

    res.json({ success: true, data: combined.slice(0, 10) });
  } catch (err) {
    res.json({ success: true, data: localMatches });
  }
});

// ── Main Unified Company Intelligence Endpoint ──
app.get('/api/company/:symbol', async (req, res) => {
  const rawInput = req.params.symbol.trim();
  const upperInput = rawInput.toUpperCase();

  // Resolve mapped ticker (e.g. "Microsoft" -> "MSFT")
  let resolvedSymbol = COMMON_NAME_TO_TICKER[upperInput] || upperInput;

  let catalogItem = LISTED_COMPANIES_CATALOG.find(
    (c) =>
      c.symbol.toUpperCase() === upperInput ||
      c.symbol.toUpperCase() === resolvedSymbol ||
      c.name.toUpperCase().includes(upperInput)
  );

  // If still not resolved and not in catalog, attempt Finnhub dynamic search lookup
  if (!catalogItem && !COMMON_NAME_TO_TICKER[upperInput]) {
    try {
      const searchResults = await finnhubService.searchSymbol(rawInput);
      if (searchResults && searchResults.length > 0) {
        resolvedSymbol = searchResults[0].symbol;
      }
    } catch (e) {}
  }

  const symbol = resolvedSymbol;

  try {
    let quote = null;
    let profile = null;
    let metrics = null;
    let news = [];
    let recommendations = null;

    if (catalogItem?.currency === '$' || !symbol.includes('.NS')) {
      [quote, profile, metrics, news, recommendations] = await Promise.all([
        finnhubService.getQuote(symbol),
        finnhubService.getProfile(symbol),
        finnhubService.getMetrics(symbol),
        finnhubService.getNews(symbol),
        finnhubService.getRecommendations(symbol),
      ]);
    }

    const isVerifiedPublic = Boolean((catalogItem && (catalogItem.status?.includes('Listed') || catalogItem.status?.includes('IPO') || catalogItem.currency === '$')) || (quote && quote.currentPrice) || (profile && profile.name));
    const isKnownPrivateStartup = Boolean(catalogItem && (catalogItem.status === 'Mini Startup' || catalogItem.status === 'Unicorn' || catalogItem.stage?.includes('Seed') || catalogItem.stage?.includes('Series')));
    const isUnlistedOrNoIPO = !isVerifiedPublic && !isKnownPrivateStartup;

    const companyName = catalogItem?.name || profile?.name || rawInput;

    // Currency Detection: strictly $ for US/Global, ₹ for Indian Startups & NSE/BSE
    let currency = '₹';
    if (catalogItem?.currency === '$' || profile?.currency === 'USD' || (!symbol.includes('.NS') && quote && !catalogItem && !symbol.includes('MUX') && !symbol.includes('KISAN') && !symbol.includes('ZEPTO'))) {
      currency = '$';
    } else if (catalogItem?.currency) {
      currency = catalogItem.currency;
    }

    const price = quote?.currentPrice || catalogItem?.defaultPrice || (currency === '$' ? 142.50 : 180.0);
    const isUp = quote ? quote.isUp : (catalogItem ? catalogItem.isUp : true);
    const changePct = quote?.percentChange !== undefined 
      ? `${quote.percentChange >= 0 ? '+' : ''}${quote.percentChange.toFixed(2)}%` 
      : (catalogItem?.change || '+2.15%');

    // Tavily AI Search targeting Indian startup / company intel
    const tavilyIntel = await tavilyService.getCompanyIntelligence(symbol, companyName);
    const chartData = generate30DayTrajectory(price, isUp);

    const baseScore = isUp ? 88 : 74;
    const growthScore = Math.min(99, Math.max(60, baseScore + Math.floor(Math.random() * 8)));

    // Formatted Free Cash Flow & Market Cap based on Currency
    const formattedFCF = currency === '$' ? `$${(price * 1.8).toFixed(1)}M` : `₹${(price * 0.55).toFixed(1)} Cr`;
    const formattedMarketCap = catalogItem?.marketCap || (profile?.marketCap ? `$${(profile.marketCap / 1000).toFixed(2)}B` : (currency === '$' ? '$1.85B' : '₹1,250 Cr'));

    // Status & Public IPO verification message
    let ipoStatus = 'Public Listed Equities';
    let ipoDate = catalogItem?.ipoDate || (quote ? 'Listed Equities' : 'Unlisted Venture');
    let noticeMessage = null;

    if (isUnlistedOrNoIPO) {
      ipoStatus = 'Unlisted / No Public IPO';
      ipoDate = 'No Active IPO Filing';
      noticeMessage = `Notice: We currently do not have verified public IPO filings or live stock exchange trading feeds for "${companyName}". Displaying estimated private intelligence & simulated market preview.`;
    } else if (isKnownPrivateStartup) {
      ipoStatus = catalogItem.status || 'Private Tech Startup';
      noticeMessage = `Private Startup Notice: "${companyName}" is a high-growth private venture (${catalogItem.stage || 'Early Stage'}). Valuation is based on recent funding rounds.`;
    }

    const responsePayload = {
      success: true,
      symbol: catalogItem?.symbol || symbol,
      name: companyName,
      sector: catalogItem?.sector || profile?.industry || 'Technology & Innovation',
      market: catalogItem?.market || (currency === '$' ? 'US / Global Markets' : 'India Market'),
      currency,
      price: price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
      rawPrice: price,
      change: changePct,
      isUp,
      hasPublicIPO: isVerifiedPublic,
      isUnlistedOrNoIPO,
      isPrivateStartup: isKnownPrivateStartup,
      noticeMessage,
      ipoDate,
      ipoPrice: catalogItem?.ipoPrice || (currency === '$' ? '$24.00' : '₹35.00'),
      marketCap: formattedMarketCap,
      logo: profile?.logo || null,
      weburl: profile?.weburl || null,
      growthScore,
      growthStatus: isUp ? 'Strong Growth & Expansion' : 'Early Consolidation',
      summary: tavilyIntel.aiSummary || `${companyName} is advancing technology solutions with scalable operational metrics.`,
      metrics: {
        revGrowth: metrics?.revGrowthYoY || '+28.4% YoY',
        netMargin: metrics?.netMargin || '18.2%',
        peRatio: metrics?.peTTM || catalogItem?.pe || (isUnlistedOrNoIPO ? 'N/A (Private)' : '24.5'),
        roe: metrics?.roeTTM || '32.4%',
        beta: metrics?.beta || '1.12',
        week52High: metrics?.week52High ? `${currency}${metrics.week52High}` : `${currency}${(price * 1.25).toFixed(2)}`,
        week52Low: metrics?.week52Low ? `${currency}${metrics.week52Low}` : `${currency}${(price * 0.75).toFixed(2)}`,
        freeCashFlow: formattedFCF,
        debtToEquity: '0.45',
        analystRating: isUnlistedOrNoIPO 
          ? 'Unlisted (No Public Rating)' 
          : (recommendations?.rating || (isKnownPrivateStartup ? 'Venture Funded (High Conviction)' : 'Strong Buy (92% Consensus)')),
      },
      risks: tavilyIntel.risks || [
        'Market Competition & Substitution',
        'Customer Acquisition & Retention Costs',
        'Scaling & Infrastructure Execution',
      ],
      news: news.length > 0 ? news : [
        {
          headline: `${companyName} Expands Market Footprint and Operational Capabilities`,
          source: currency === '$' ? 'Bloomberg / TechCrunch' : 'Inc42 / LiveMint',
          datetime: 'Today',
        },
        {
          headline: `Industry Sector Report: Growth Opportunities and Key Market Tailwinds`,
          source: currency === '$' ? 'Reuters / MarketWatch' : 'YourStory / Economic Times',
          datetime: 'Yesterday',
        },
      ],
      chartData,
      source: isUnlistedOrNoIPO 
        ? 'Simulated Private Venture Dossier' 
        : 'Finnhub, Tavily AI & Startup Intelligence Engine',
    };

    res.json(responsePayload);
  } catch (error) {
    console.error(`Error processing company ${symbol}:`, error);
    res.status(500).json({
      success: false,
      error: 'Failed to aggregate company intelligence',
      message: error.message,
    });
  }
});

app.post('/api/orders', (req, res) => {
  const { symbol, companyName, side, orderType, price, quantity } = req.body;

  if (!symbol || !side || !quantity) {
    return res.status(400).json({ success: false, error: 'Missing required order fields.' });
  }

  const newOrder = {
    orderId: `ORD-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    symbol: symbol.toUpperCase(),
    companyName: companyName || symbol,
    side: side.toUpperCase(),
    orderType: orderType || 'MARKET',
    price: Number(price) || 100.0,
    quantity: Number(quantity),
    totalValue: (Number(price) || 100.0) * Number(quantity),
    status: 'FILLED',
    createdAt: new Date().toISOString(),
  };

  ordersDb.push(newOrder);

  res.status(201).json({
    success: true,
    message: `Order ${newOrder.orderId} executed successfully.`,
    data: newOrder,
  });
});

app.get('/api/context', (req, res) => {
  res.json({
    success: true,
    data: {
      currentPrice: 105.20,
      previousPrice: 102.73,
      priceChangePercent: 2.4,
      totalOrdersMatched: ordersDb.length,
    },
  });
});

app.listen(PORT, () => {
  console.log(`🚀 TradeStream Backend running on http://localhost:${PORT}`);
});
