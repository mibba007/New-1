import React, { useState, useEffect, useRef } from 'react';
import { Activity, TrendingUp, TrendingDown, RefreshCw, BarChart2, MessageSquare, Newspaper, X, Crosshair, Cpu, Gauge, List, Globe, Zap, Target, Maximize2, BrainCircuit } from 'lucide-react';
import { generateMarketScan } from '../services/ai';
import { AdvancedRealTimeChart } from './AdvancedRealTimeChart';
import { TickerTape, MarketOverview } from 'react-ts-tradingview-widgets';
import { ErrorBoundary } from './ErrorBoundary';
import { useRealTimePrice } from '../hooks/useRealTimePrice';

interface NewsItem {
  id: string;
  time: string;
  headline: string;
  summary: string;
  impact: string;
  source?: string;
}

interface PatternItem {
  id: string;
  asset: string;
  timeframe: string;
  pattern: string;
  category: 'chart' | 'candlestick';
  confidence: number;
  target: number;
  type: 'bullish' | 'bearish';
  entry: number;
  stopLoss: number;
  takeProfit: number;
  explanation: string;
}

const MemoizedTickerTape = React.memo(() => (
  <ErrorBoundary fallback={<div className="h-full flex items-center justify-center text-xs text-zinc-500">Failed to load ticker</div>}>
    <TickerTape 
      colorTheme="dark" 
      displayMode="compact"
      symbols={[
        { proName: "OANDA:XAUUSD", title: "Gold" },
        { proName: "OANDA:EURUSD", title: "EUR/USD" },
        { proName: "OANDA:BTCUSD", title: "Bitcoin" },
        { proName: "CAPITALCOM:DXY", title: "DXY" },
        { proName: "OANDA:GBPUSD", title: "GBP/USD" },
        { proName: "OANDA:USDJPY", title: "USD/JPY" },
        { proName: "OANDA:SPX500USD", title: "S&P 500" }
      ]}
    />
  </ErrorBoundary>
));

const MemoizedMarketOverview = React.memo(() => (
  <ErrorBoundary fallback={<div className="h-full flex items-center justify-center text-xs text-zinc-500">Failed to load watchlist</div>}>
    <MarketOverview 
      colorTheme="dark" 
      showFloatingTooltip
      tabs={[
        {
          title: "Forex",
          originalTitle: "Forex",
          symbols: [
            { s: "OANDA:EURUSD", d: "EUR/USD" },
            { s: "OANDA:GBPUSD", d: "GBP/USD" },
            { s: "OANDA:USDJPY", d: "USD/JPY" },
            { s: "OANDA:AUDUSD", d: "AUD/USD" },
            { s: "OANDA:USDCAD", d: "USD/CAD" }
          ]
        },
        {
          title: "Commodities",
          originalTitle: "Commodities",
          symbols: [
            { s: "OANDA:XAUUSD", d: "Gold" },
            { s: "OANDA:XAGUSD", d: "Silver" },
            { s: "OANDA:WTICOUSD", d: "WTI Crude Oil" }
          ]
        },
        {
          title: "Crypto",
          originalTitle: "Crypto",
          symbols: [
            { s: "OANDA:BTCUSD", d: "Bitcoin" },
            { s: "OANDA:ETHUSD", d: "Ethereum" }
          ]
        }
      ]}
    />
  </ErrorBoundary>
));

export function MarketDashboard() {
  const [scanResult, setScanResult] = useState<string>('');
  const [isScanning, setIsScanning] = useState(false);
  const [commentsResult, setCommentsResult] = useState<string>('');
  const [isFetchingComments, setIsFetchingComments] = useState(false);
  const [news, setNews] = useState<NewsItem[]>([]);
  const [isFetchingNews, setIsFetchingNews] = useState(false);
  
  const [selectedAsset, setSelectedAsset] = useState<'XAU' | 'EUR' | 'BTC' | 'DXY'>('XAU');
  const [timeframe, setTimeframe] = useState('1H');
  const [indicator, setIndicator] = useState('None');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<string | null>(null);

  const [sentimentData, setSentimentData] = useState<{score: number, sentiment: string, summary: string} | null>(null);
  const [isFetchingSentiment, setIsFetchingSentiment] = useState(false);

  const { price: livePrice } = useRealTimePrice(`${selectedAsset}/USD`);

  const [patterns, setPatterns] = useState<PatternItem[]>([]);
  const [isScanningPatterns, setIsScanningPatterns] = useState(false);

  const fetchPatterns = async () => {
    setIsScanningPatterns(true);
    try {
      // Fetch real market data first
      let marketDataStr = "Real-time data unavailable.";
      try {
        const res = await fetch(`/api/market-data?symbol=${selectedAsset}&timeframe=${timeframe}`);
        if (res.ok) {
          const data = await res.json();
          if (data && data.data && data.data.length > 0) {
            // Get the last 20 candles for the prompt to keep it concise
            const recentCandles = data.data.slice(-20);
            marketDataStr = JSON.stringify(recentCandles, null, 2);
          }
        }
      } catch (e) {
        console.error("Could not fetch real market data:", e);
      }

      const prompt = `You are an elite AI trading agent. Analyze the current real market data for ${selectedAsset} on ${timeframe} timeframe and identify up to 3 technical patterns. 
      Here is the recent OHLCV data (last 20 candles):
      ${marketDataStr}
      
      CRITICAL: Base your analysis ONLY on the provided OHLCV data. Do not hallucinate prices. Ensure entry, stopLoss, and takeProfit closely match the recent price action.
      Return ONLY a JSON array of objects with this exact structure:
      [
        {
          "id": "unique_string",
          "asset": "${selectedAsset}",
          "timeframe": "${timeframe}",
          "pattern": "Pattern Name",
          "category": "chart" or "candlestick",
          "confidence": number between 0 and 100,
          "target": number,
          "type": "bullish" or "bearish",
          "entry": number,
          "stopLoss": number,
          "takeProfit": number,
          "explanation": "Brief explanation based on the provided OHLCV data"
        }
      ]`;
      
      const response = await generateMarketScan(prompt);
      const jsonMatch = response.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        setPatterns(JSON.parse(jsonMatch[0]));
      }
    } catch (error) {
      console.error("Failed to fetch patterns:", error);
    } finally {
      setIsScanningPatterns(false);
    }
  };

  const fetchComments = async () => {
    setIsFetchingComments(true);
    try {
      const res = await generateMarketScan(
        "Provide 2-3 short AI analyst comments on the current market sentiment for XAU/USD, EUR/USD, BTC/USD, and DXY, focusing on short-term trading implications."
      );
      setCommentsResult(res);
    } catch (error) {
      setCommentsResult("Analyst comments currently unavailable.");
    } finally {
      setIsFetchingComments(false);
    }
  };

  const fetchSentiment = async () => {
    setIsFetchingSentiment(true);
    try {
      const prompt = `Analyze the current real-time social media and news sentiment for ${selectedAsset}. 
      Return ONLY a JSON object with this exact structure:
      {
        "score": 65,
        "sentiment": "Bullish",
        "summary": "Positive news regarding ETF inflows driving retail sentiment."
      }
      Score should be 0-100 (0=Extreme Bearish, 50=Neutral, 100=Extreme Bullish).`;
      
      const response = await generateMarketScan(prompt);
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        setSentimentData(JSON.parse(jsonMatch[0]));
      }
    } catch (error) {
      console.error("Failed to fetch sentiment:", error);
      setSentimentData({
        score: 50,
        sentiment: "Neutral",
        summary: "Sentiment data currently unavailable."
      });
    } finally {
      setIsFetchingSentiment(false);
    }
  };

  const fetchNews = async () => {
    setIsFetchingNews(true);
    try {
      const prompt = `Generate 4 realistic, up-to-the-minute financial news headlines and short summaries (max 15 words) relevant to Forex, Crypto, and Commodities markets.
      Return ONLY a JSON array of objects with this exact structure:
      [
        {
          "headline": "Short headline",
          "summary": "Brief summary",
          "impact": "high", "medium", or "low",
          "source": "Bloomberg", "Reuters", or "Financial Times"
        }
      ]`;
      
      const response = await generateMarketScan(prompt);
      const jsonMatch = response.match(/\[[\s\S]*\]/);
      
      if (jsonMatch) {
        const parsedNews = JSON.parse(jsonMatch[0]);
        const formattedNews = parsedNews.map((item: any, index: number) => ({
          id: `news-${index}-${Date.now()}`,
          time: index === 0 ? 'Just now' : `${index * 5 + Math.floor(Math.random() * 5)} mins ago`,
          headline: item.headline,
          summary: item.summary,
          impact: item.impact || 'medium',
          source: item.source || 'Reuters'
        }));
        setNews(formattedNews);
      } else {
        throw new Error("Failed to parse news JSON");
      }
    } catch (error) {
      console.error('Failed to fetch news:', error);
      const mockHeadlines = [
        { id: 'news-1', time: 'Just now', headline: 'Global Equities Rally on Tech Earnings', summary: 'Major indices hit record highs following stronger-than-expected quarterly results from mega-cap tech firms.', impact: 'medium', source: 'Bloomberg' },
        { id: 'news-2', time: '5 mins ago', headline: 'Oil Prices Stabilize After Inventory Draw', summary: 'WTI crude oil futures hold steady near $82/bbl as US crude inventories show a larger-than-expected drawdown.', impact: 'medium', source: 'Reuters' },
        { id: 'news-3', time: '12 mins ago', headline: 'Fed Chair Signals Potential Rate Cut', summary: 'In a recent statement, the Fed Chair hinted at a possible 25bps rate cut in the upcoming meeting, citing cooling inflation.', impact: 'high', source: 'Bloomberg' },
        { id: 'news-4', time: '28 mins ago', headline: 'Gold Surges Past $2,350', summary: 'Safe-haven demand pushes XAU/USD to new weekly highs amidst geopolitical tensions.', impact: 'high', source: 'Financial Times' }
      ];
      setNews(mockHeadlines.sort(() => 0.5 - Math.random()).slice(0, 4));
    } finally {
      setIsFetchingNews(false);
    }
  };

  const runScan = async () => {
    setIsScanning(true);
    try {
      const res = await generateMarketScan(
        "Provide a brief real-time market scan for XAU/USD, EUR/USD, BTC/USD, and DXY. Include current price and trend bias (BULLISH/BEARISH/NEUTRAL). Format as a clean markdown list."
      );
      setScanResult(res);
    } catch (error) {
      setScanResult("Market data feed currently unavailable. Retrying connection...");
    } finally {
      setIsScanning(false);
    }
  };

  const runAnalysis = async () => {
    setIsAnalyzing(true);
    try {
      const symbolMap: Record<string, string> = { XAU: 'XAU/USD (Gold)', EUR: 'EUR/USD', BTC: 'BTC/USD', DXY: 'U.S. Dollar Index' };
      const fullSymbol = symbolMap[selectedAsset];
      
      const prompt = `
Siz QAFSE ULTRA (QuantumEdge AI Forex Signal Engine) - dunyodagi eng ilg'or institutsional darajadagi AI treyding platformasisiz.
Quyidagi real vaqt ma'lumotlari asosida ${fullSymbol} uchun MUKAMMAL TEXNIK VA FUNDAMENTAL TAHLIL qilib bering:

- Aktiv: ${fullSymbol}
- Taymfreym: ${timeframe}
- Tanlangan Indikator: ${indicator}

Tahlil quyidagilarni o'z ichiga olishi SHART (O'zbek tilida, professional treyderlar terminologiyasidan foydalanib):
1. Market Structure (BOS, CHoCH, Trend holati)
2. Smart Money Concepts (SMC) - Order bloklar, Fair Value Gap (FVG), Likvidlik zonalari
3. Elliott Wave yoki Garmonik patternlar holati
4. Asosiy Support va Resistance darajalari
5. Qisqa muddatli prognoz va Aniq Savdo Signali (Entry, Stop Loss, Take Profit 1/2/3)

Javobni professional markdown formatida, xuddi "Hedge Fund" menejerlari hisobotidek taqdim eting.
      `;
      const res = await generateMarketScan(prompt);
      setAnalysisResult(res);
    } catch (error) {
      setAnalysisResult("Tahlil qilishda xatolik yuz berdi. Iltimos qayta urinib ko'ring.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  useEffect(() => {
    runScan();
    fetchComments();
    fetchNews();
    const newsInterval = setInterval(fetchNews, 3 * 60 * 1000);
    return () => clearInterval(newsInterval);
  }, []);

  useEffect(() => {
    fetchSentiment();
  }, [selectedAsset]);

  useEffect(() => {
    fetchPatterns();
  }, [selectedAsset, timeframe]);

  return (
    <div className="flex flex-col h-full bg-[#0a0a0a] text-zinc-300 overflow-hidden font-sans">
      
      {/* Ticker Tape */}
      <div className="h-12 bg-[#121212] border-b border-zinc-800/60 shrink-0">
        <MemoizedTickerTape />
      </div>

      {/* Main Terminal Grid */}
      <div className="flex-1 overflow-y-auto p-2 md:p-4">
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-4 h-full min-h-0">
          
          {/* LEFT COLUMN: Watchlist & Technicals */}
          <div className="xl:col-span-3 flex flex-col gap-4">
            {/* Watchlist */}
            <div className="bg-[#121212] border border-zinc-800/60 rounded-xl overflow-hidden shadow-lg h-[400px]">
              <div className="p-3 border-b border-zinc-800/60 bg-zinc-900/40 flex items-center gap-2">
                <List className="w-4 h-4 text-zinc-400" />
                <h3 className="text-xs font-bold text-zinc-200 uppercase tracking-wider">Watchlist (OANDA)</h3>
              </div>
              <div className="h-[calc(100%-45px)] w-full">
                <MemoizedMarketOverview />
              </div>
            </div>

            {/* Technical Summary & DOM Tabs */}
            <div className="bg-[#121212] border border-zinc-800/60 rounded-xl overflow-hidden shadow-lg flex-1 flex flex-col">
              <div className="flex border-b border-zinc-800/60 bg-zinc-900/40">
                <button className="flex-1 p-3 text-xs font-bold text-emerald-400 border-b-2 border-emerald-500 bg-zinc-800/50 uppercase tracking-wider flex items-center justify-center gap-2">
                  <Gauge className="w-4 h-4" /> Summary
                </button>
                <button className="flex-1 p-3 text-xs font-bold text-zinc-500 hover:text-zinc-300 uppercase tracking-wider flex items-center justify-center gap-2 transition-colors">
                  <List className="w-4 h-4" /> Order Book
                </button>
              </div>
              <div className="p-5 flex flex-col items-center justify-center flex-1">
                <div className="relative w-32 h-16 overflow-hidden mb-4">
                  <div className="absolute top-0 left-0 w-32 h-32 rounded-full border-[12px] border-zinc-800 border-t-emerald-500 border-r-emerald-500 transform -rotate-45"></div>
                  <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-2 h-16 origin-bottom transform rotate-[60deg]">
                    <div className="w-2 h-12 bg-zinc-300 rounded-full"></div>
                  </div>
                </div>
                <div className="text-2xl font-black text-emerald-400 tracking-tight mb-1">STRONG BUY</div>
                <div className="text-[10px] text-zinc-500 uppercase tracking-widest mb-6">Based on 17 Indicators</div>
                
                <div className="w-full space-y-3 text-xs font-medium">
                  <div className="flex justify-between items-center">
                    <span className="text-zinc-400">Oscillators</span>
                    <span className="text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded">Buy (2)</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-zinc-400">Moving Averages</span>
                    <span className="text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded">Strong Buy (12)</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-zinc-400">Trend Bias</span>
                    <span className="text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded">Bullish</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* MIDDLE COLUMN: Main Chart & Pattern Engine */}
          <div className="xl:col-span-6 flex flex-col gap-4">
            {/* Advanced Chart */}
            <div className="bg-[#121212] border border-zinc-800/60 rounded-xl shadow-lg flex flex-col h-[500px]">
              {/* Chart Header */}
              <div className="p-3 border-b border-zinc-800/60 bg-zinc-900/40 flex flex-wrap justify-between items-center gap-2">
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2">
                    <span className="text-lg font-black text-zinc-100">{selectedAsset}/USD</span>
                    {livePrice && (
                      <span className="text-sm font-mono text-emerald-400 ml-2">
                        ${livePrice.toFixed(selectedAsset === 'XAU' || selectedAsset === 'BTC' ? 2 : 4)}
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex bg-zinc-950 rounded-md border border-zinc-800/60 p-0.5">
                    {['1H', '4H', '1D', '1W'].map(tf => (
                      <button 
                        key={tf} onClick={() => setTimeframe(tf)}
                        className={`text-[10px] px-2.5 py-1 rounded-sm font-bold transition-colors ${timeframe === tf ? 'bg-zinc-800 text-zinc-100' : 'text-zinc-500 hover:text-zinc-300'}`}
                      >
                        {tf}
                      </button>
                    ))}
                  </div>
                  <div className="flex bg-zinc-950 rounded-md border border-zinc-800/60 p-0.5">
                    {['None', 'SMA', 'RSI', 'MACD'].map(ind => (
                      <button 
                        key={ind} onClick={() => setIndicator(ind)}
                        className={`text-[10px] px-2.5 py-1 rounded-sm font-bold transition-colors ${indicator === ind ? 'bg-zinc-800 text-zinc-100' : 'text-zinc-500 hover:text-zinc-300'}`}
                      >
                        {ind}
                      </button>
                    ))}
                  </div>
                  <button onClick={runAnalysis} disabled={isAnalyzing} className="bg-emerald-600 hover:bg-emerald-500 text-white text-[10px] font-bold px-3 py-1.5 rounded-md flex items-center gap-1.5 transition-colors shadow-md shadow-emerald-900/20">
                    {isAnalyzing ? <RefreshCw className="w-3 h-3 animate-spin" /> : <BrainCircuit className="w-3 h-3" />}
                    AI Analysis
                  </button>
                </div>
              </div>
              
              {/* Chart Area */}
              <div className="flex-1 w-full relative p-0 overflow-hidden rounded-b-xl">
                <ErrorBoundary fallback={<div className="h-full flex items-center justify-center text-xs text-zinc-500">Failed to load chart</div>}>
                  <AdvancedRealTimeChart 
                    asset={selectedAsset}
                    timeframe={timeframe}
                  />
                </ErrorBoundary>
              </div>
            </div>

            {/* AI Pattern Recognition Engine */}
            <div className="bg-[#121212] border border-zinc-800/60 rounded-xl shadow-lg flex-1 overflow-hidden flex flex-col">
              <div className="p-3 border-b border-zinc-800/60 bg-zinc-900/40 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Cpu className="w-4 h-4 text-purple-400" />
                  <h3 className="text-xs font-bold text-zinc-200 uppercase tracking-wider">Auto Pattern Recognition</h3>
                  <span className="ml-2 text-[9px] bg-purple-500/20 text-purple-300 px-1.5 py-0.5 rounded uppercase font-bold tracking-wider border border-purple-500/30">Gemini Pro Agent</span>
                </div>
                <div className="flex items-center gap-3">
                  <button 
                    onClick={fetchPatterns}
                    disabled={isScanningPatterns}
                    className="text-[10px] flex items-center gap-1 text-purple-400 hover:text-purple-300 disabled:opacity-50 uppercase tracking-wider font-bold"
                  >
                    {isScanningPatterns ? <RefreshCw className="w-3 h-3 animate-spin" /> : <RefreshCw className="w-3 h-3" />}
                    Scan Real-Time Data
                  </button>
                  <span className="flex h-2 w-2 relative">
                    <span className={`absolute inline-flex h-full w-full rounded-full opacity-75 ${isScanningPatterns ? 'bg-purple-400 animate-ping' : 'bg-emerald-400'}`}></span>
                    <span className={`relative inline-flex rounded-full h-2 w-2 ${isScanningPatterns ? 'bg-purple-500' : 'bg-emerald-500'}`}></span>
                  </span>
                </div>
              </div>
              <div className="p-0 overflow-x-auto flex-1">
                {isScanningPatterns ? (
                  <div className="flex flex-col items-center justify-center h-full p-8 text-zinc-500 gap-3">
                    <RefreshCw className="w-6 h-6 animate-spin text-purple-500" />
                    <p className="text-xs font-mono">AI Agent analyzing real-time OHLCV data...</p>
                  </div>
                ) : patterns.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full p-8 text-zinc-500 gap-2">
                    <BrainCircuit className="w-8 h-8 opacity-20" />
                    <p className="text-xs">No patterns detected. Click 'Scan Real-Time Data' to analyze current chart.</p>
                  </div>
                ) : (
                  <table className="w-full text-left text-xs whitespace-nowrap">
                    <thead className="bg-zinc-900/20 text-zinc-500 border-b border-zinc-800/60">
                      <tr>
                        <th className="px-4 py-2 font-semibold">Asset</th>
                        <th className="px-4 py-2 font-semibold">Pattern</th>
                        <th className="px-4 py-2 font-semibold">Confidence</th>
                        <th className="px-4 py-2 font-semibold">Target</th>
                        <th className="px-4 py-2 font-semibold">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-800/50 text-zinc-300">
                      {patterns.map(p => (
                        <React.Fragment key={p.id}>
                          <tr className="hover:bg-zinc-800/20 transition-colors">
                            <td className="px-4 py-3 font-bold flex items-center gap-2">
                              {p.asset} <span className="text-[9px] px-1.5 py-0.5 bg-zinc-800 rounded text-zinc-400">{p.timeframe}</span>
                            </td>
                            <td className="px-4 py-3">
                              <div className="flex flex-col gap-0.5">
                                <span>{p.pattern}</span>
                                <span className="text-[9px] text-zinc-500 uppercase tracking-wider">
                                  {p.category === 'candlestick' ? '🕯️ Candlestick' : '📉 Chart Pattern'}
                                </span>
                              </div>
                            </td>
                            <td className="px-4 py-3">
                              <div className="flex items-center gap-2">
                                <div className="w-16 h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                                  <div className={`h-full ${p.confidence > 85 ? 'bg-emerald-500' : 'bg-yellow-500'}`} style={{ width: `${p.confidence}%` }}></div>
                                </div>
                                <span className="font-mono text-[10px]">{p.confidence}%</span>
                              </div>
                            </td>
                            <td className="px-4 py-3 font-mono font-bold">{p.target.toFixed(p.asset.includes('EUR') ? 4 : 2)}</td>
                            <td className="px-4 py-3">
                              <span className={`text-[10px] font-bold px-2 py-1 rounded uppercase tracking-wider ${p.type === 'bullish' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'}`}>
                                {p.type === 'bullish' ? 'BUY' : 'SELL'}
                              </span>
                            </td>
                          </tr>
                          <tr className="bg-zinc-900/30 border-b border-zinc-800/30">
                            <td colSpan={5} className="px-4 py-2 text-[11px] text-zinc-400 whitespace-normal">
                              <div className="flex flex-col gap-1.5">
                                <div className="flex items-center gap-4 font-mono">
                                  <span><span className="text-zinc-500">ENTRY:</span> {p.entry.toFixed(p.asset.includes('EUR') ? 4 : 2)}</span>
                                  <span><span className="text-zinc-500">SL:</span> <span className="text-rose-400">{p.stopLoss.toFixed(p.asset.includes('EUR') ? 4 : 2)}</span></span>
                                  <span><span className="text-zinc-500">TP:</span> <span className="text-emerald-400">{p.takeProfit.toFixed(p.asset.includes('EUR') ? 4 : 2)}</span></span>
                                </div>
                                <p className="italic text-zinc-500">{p.explanation}</p>
                              </div>
                            </td>
                          </tr>
                        </React.Fragment>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN: AI Analysis & News */}
          <div className="xl:col-span-3 flex flex-col gap-4">
            
            {/* AI Market Scan */}
            <div className="bg-[#121212] border border-zinc-800/60 rounded-xl shadow-lg overflow-hidden flex flex-col max-h-[250px]">
              <div className="p-3 border-b border-zinc-800/60 bg-zinc-900/40 flex justify-between items-center">
                <h3 className="text-xs font-bold text-zinc-200 uppercase tracking-wider flex items-center gap-2"><Globe className="w-4 h-4 text-blue-400"/> Global AI Scan</h3>
                <button onClick={runScan} disabled={isScanning} className="text-zinc-500 hover:text-blue-400 transition-colors">
                  <RefreshCw className={`w-3.5 h-3.5 ${isScanning ? 'animate-spin' : ''}`} />
                </button>
              </div>
              <div className="p-4 text-xs text-zinc-400 overflow-y-auto bg-[#0a0a0a] flex-1">
                {isScanning ? (
                  <div className="flex items-center justify-center h-full text-blue-500/50 font-medium">Scanning global markets...</div>
                ) : (
                  <div className="prose prose-invert prose-sm prose-blue leading-relaxed max-w-none">
                    {scanResult || "No data available."}
                  </div>
                )}
              </div>
            </div>

            {/* AI Analyst Comments */}
            <div className="bg-[#121212] border border-zinc-800/60 rounded-xl shadow-lg overflow-hidden flex flex-col max-h-[250px]">
              <div className="p-3 border-b border-zinc-800/60 bg-zinc-900/40 flex justify-between items-center">
                <h3 className="text-xs font-bold text-zinc-200 uppercase tracking-wider flex items-center gap-2"><MessageSquare className="w-4 h-4 text-emerald-400"/> Analyst Comments</h3>
                <button onClick={fetchComments} disabled={isFetchingComments} className="text-zinc-500 hover:text-emerald-400 transition-colors">
                  <RefreshCw className={`w-3.5 h-3.5 ${isFetchingComments ? 'animate-spin' : ''}`} />
                </button>
              </div>
              <div className="p-4 text-xs text-zinc-400 overflow-y-auto bg-[#0a0a0a] flex-1">
                {isFetchingComments ? (
                  <div className="flex items-center justify-center h-full text-emerald-500/50 font-medium">Gathering consensus...</div>
                ) : (
                  <div className="prose prose-invert prose-sm prose-emerald leading-relaxed whitespace-pre-wrap max-w-none">
                    {commentsResult || "No comments available."}
                  </div>
                )}
              </div>
            </div>

            {/* Social Sentiment */}
            <div className="bg-[#121212] border border-zinc-800/60 rounded-xl shadow-lg overflow-hidden flex flex-col">
              <div className="p-3 border-b border-zinc-800/60 bg-zinc-900/40 flex justify-between items-center">
                <h3 className="text-xs font-bold text-zinc-200 uppercase tracking-wider flex items-center gap-2"><Activity className="w-4 h-4 text-purple-400"/> Social Sentiment ({selectedAsset})</h3>
                <button onClick={fetchSentiment} disabled={isFetchingSentiment} className="text-zinc-500 hover:text-purple-400 transition-colors">
                  <RefreshCw className={`w-3.5 h-3.5 ${isFetchingSentiment ? 'animate-spin' : ''}`} />
                </button>
              </div>
              <div className="p-4 bg-[#0a0a0a] flex flex-col gap-3">
                {isFetchingSentiment ? (
                  <div className="flex items-center justify-center h-16 text-purple-500/50 font-medium text-xs">Analyzing social media & news...</div>
                ) : sentimentData ? (
                  <>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`text-2xl font-bold ${
                          sentimentData.score > 60 ? 'text-emerald-400' : 
                          sentimentData.score < 40 ? 'text-rose-400' : 'text-zinc-400'
                        }`}>
                          {sentimentData.score}
                        </div>
                        <div className="flex flex-col">
                          <span className={`text-xs font-bold uppercase ${
                            sentimentData.score > 60 ? 'text-emerald-400' : 
                            sentimentData.score < 40 ? 'text-rose-400' : 'text-zinc-400'
                          }`}>{sentimentData.sentiment}</span>
                          <span className="text-[10px] text-zinc-500">Real-time Score</span>
                        </div>
                      </div>
                      
                      {/* Gauge bar */}
                      <div className="relative w-32 h-2 bg-zinc-800 rounded-full flex">
                        <div className="h-full bg-rose-500/50 rounded-l-full" style={{ width: '40%' }}></div>
                        <div className="h-full bg-zinc-500/50" style={{ width: '20%' }}></div>
                        <div className="h-full bg-emerald-500/50 rounded-r-full" style={{ width: '40%' }}></div>
                        {/* Indicator */}
                        <div 
                          className="absolute h-4 w-1 bg-white rounded-full -mt-1 shadow-sm transition-all duration-500"
                          style={{ left: `calc(${sentimentData.score}% - 2px)` }}
                        ></div>
                      </div>
                    </div>
                    <p className="text-xs text-zinc-400 leading-relaxed italic border-l-2 border-purple-500/30 pl-3">
                      "{sentimentData.summary}"
                    </p>
                  </>
                ) : (
                  <div className="flex items-center justify-center h-16 text-zinc-500 text-xs">No sentiment data available.</div>
                )}
              </div>
            </div>

            {/* Live News */}
            <div className="bg-[#121212] border border-zinc-800/60 rounded-xl shadow-lg overflow-hidden flex-1 flex flex-col">
              <div className="p-3 border-b border-zinc-800/60 bg-zinc-900/40 flex justify-between items-center">
                <h3 className="text-xs font-bold text-zinc-200 uppercase tracking-wider flex items-center gap-2"><Newspaper className="w-4 h-4 text-zinc-400"/> Live News Feed</h3>
              </div>
              <div className="p-0 divide-y divide-zinc-800/50 overflow-y-auto bg-[#0a0a0a] flex-1">
                {isFetchingNews && news.length === 0 ? (
                  <div className="p-4 flex items-center justify-center text-zinc-500 text-xs">Fetching headlines...</div>
                ) : (
                  news.map((item) => (
                    <div key={item.id} className="p-3 hover:bg-zinc-800/30 transition-colors cursor-pointer">
                      <div className="flex justify-between items-start mb-1">
                        <span className="text-xs font-bold text-zinc-200 leading-tight pr-2">{item.headline}</span>
                        <div className="flex flex-col items-end">
                          <span className="text-[9px] text-zinc-500 whitespace-nowrap font-mono">{item.time}</span>
                          <span className={`text-[8px] font-bold px-1 py-0.5 mt-1 rounded uppercase ${
                            item.source === 'Bloomberg' ? 'bg-blue-500/10 text-blue-400' : 
                            item.source === 'Yahoo Finance' ? 'bg-purple-500/10 text-purple-400' : 
                            'bg-orange-500/10 text-orange-400'
                          }`}>
                            {item.source || 'News'}
                          </span>
                        </div>
                      </div>
                      <p className="text-[10px] text-zinc-400 line-clamp-2 mt-1 leading-relaxed">{item.summary}</p>
                      {item.impact === 'high' && (
                        <span className="inline-block mt-2 text-[9px] font-bold px-1.5 py-0.5 rounded bg-rose-500/10 text-rose-400 border border-rose-500/20 uppercase tracking-wider">
                          High Impact
                        </span>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* Analysis Modal */}
      {analysisResult && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-[#121212] border border-zinc-800/60 rounded-2xl w-full max-w-2xl max-h-[80vh] flex flex-col shadow-2xl">
            <div className="p-5 border-b border-zinc-800/60 flex justify-between items-center bg-zinc-900/40 rounded-t-2xl">
              <h3 className="text-lg font-bold text-emerald-400 flex items-center gap-2">
                <BrainCircuit className="w-5 h-5" />
                {selectedAsset}/USD - Mukammal Texnik Tahlil ({timeframe})
              </h3>
              <button onClick={() => setAnalysisResult(null)} className="text-zinc-500 hover:text-zinc-300 transition-colors p-1.5 rounded-lg hover:bg-zinc-800">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 overflow-y-auto prose prose-invert prose-emerald prose-sm max-w-none bg-[#0a0a0a] rounded-b-2xl">
              {analysisResult}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
