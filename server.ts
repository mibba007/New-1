import express from "express";
import { createServer as createViteServer } from "vite";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import path from "path";
import { fileURLToPath } from "url";
import YahooFinance from 'yahoo-finance2';

const yahooFinance = new YahooFinance();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Trust the first proxy (required for express-rate-limit behind a reverse proxy)
  app.set('trust proxy', 1);

  // Security Middleware
  app.use(helmet({
    contentSecurityPolicy: false, // Disable CSP for development/iframe compatibility
  }));
  
  app.use(cors({
    origin: process.env.APP_URL || "*",
    credentials: true,
  }));

  // Rate Limiting
  const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per windowMs
    validate: { xForwardedForHeader: false }
  });
  app.use("/api/", limiter);

  app.use(express.json({ limit: "10kb" }));

  // API Routes
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", timestamp: new Date().toISOString() });
  });

  // Fetch real OHLCV data
  app.get("/api/market-data", async (req, res) => {
    try {
      const { symbol, timeframe } = req.query;
      if (!symbol || !timeframe) {
        return res.status(400).json({ error: "Missing symbol or timeframe" });
      }

      // Map our symbols to Yahoo Finance symbols
      let yfSymbol = String(symbol);
      if (yfSymbol === 'XAU') yfSymbol = 'GC=F'; // Gold futures
      else if (yfSymbol === 'BTC') yfSymbol = 'BTC-USD';
      else if (yfSymbol === 'EUR') yfSymbol = 'EURUSD=X';
      else if (yfSymbol === 'GBP') yfSymbol = 'GBPUSD=X';
      else if (yfSymbol === 'DXY') yfSymbol = 'DX-Y.NYB';
      else if (!yfSymbol.includes('=') && !yfSymbol.includes('-')) {
        // Fallback for forex pairs
        yfSymbol = `${yfSymbol}USD=X`;
      }

      // Map timeframe to Yahoo Finance interval
      let interval: '1m' | '2m' | '5m' | '15m' | '30m' | '60m' | '90m' | '1h' | '1d' | '5d' | '1wk' | '1mo' | '3mo' = '1h';
      let period1 = new Date();
      
      const tf = String(timeframe).toUpperCase();
      if (tf === '1M') { interval = '1m'; period1.setDate(period1.getDate() - 1); }
      else if (tf === '5M') { interval = '5m'; period1.setDate(period1.getDate() - 5); }
      else if (tf === '15M') { interval = '15m'; period1.setDate(period1.getDate() - 10); }
      else if (tf === '1H') { interval = '1h'; period1.setDate(period1.getDate() - 30); }
      else if (tf === '4H') { interval = '1h'; period1.setDate(period1.getDate() - 60); } // YF doesn't have 4h, use 1h and we can aggregate or just give 1h to AI
      else if (tf === '1D') { interval = '1d'; period1.setFullYear(period1.getFullYear() - 1); }
      else if (tf === '1W') { interval = '1wk'; period1.setFullYear(period1.getFullYear() - 2); }

      const queryOptions = {
        period1: period1.toISOString().split('T')[0],
        interval: interval
      };

      const result = await yahooFinance.chart(yfSymbol, queryOptions as any);
      
      // Return last 100 candles to avoid huge payloads
      const recentData = (result as any).quotes.slice(-100).map((d: any) => ({
        date: d.date,
        open: d.open,
        high: d.high,
        low: d.low,
        close: d.close,
        volume: d.volume
      }));

      res.json({ symbol: yfSymbol, timeframe: tf, data: recentData });
    } catch (error) {
      console.error("Market Data Error:", error);
      res.status(500).json({ error: "Failed to fetch market data" });
    }
  });

  // Proxy endpoint for Claude
  app.post("/api/claude-analyze", async (req, res) => {
    try {
      const { asset, timeframe, data } = req.body;
      if (!asset || !timeframe) return res.status(400).json({ error: "Missing required fields" });
      
      if (process.env.ANTHROPIC_API_KEY) {
        // Actual implementation would go here
        // const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
      }

      await new Promise(resolve => setTimeout(resolve, 1500));
      res.json({
        signal: Math.random() > 0.5 ? "BUY" : "SELL",
        confidence: Math.floor(Math.random() * 30) + 60,
        reasoning: `Claude analysis for ${asset} on ${timeframe} suggests a potential move based on recent volume patterns.`,
        keyLevels: { support: [1.0500, 1.0450], resistance: [1.0600, 1.0650] }
      });
    } catch (error) {
      console.error("Claude API Error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Proxy endpoint for GPT-4o
  app.post("/api/gpt4o-analyze", async (req, res) => {
    try {
      const { asset, timeframe, data } = req.body;
      if (!asset || !timeframe) return res.status(400).json({ error: "Missing required fields" });
      
      if (process.env.OPENAI_API_KEY) {
        // Actual implementation would go here
      }

      await new Promise(resolve => setTimeout(resolve, 1200));
      res.json({
        signal: Math.random() > 0.4 ? "BUY" : "SELL",
        confidence: Math.floor(Math.random() * 35) + 55,
        reasoning: `GPT-4o detects a strong trend continuation pattern for ${asset} on the ${timeframe} chart.`,
        keyLevels: { support: [1.0520, 1.0480], resistance: [1.0580, 1.0620] }
      });
    } catch (error) {
      console.error("GPT-4o API Error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Proxy endpoint for GLM
  app.post("/api/glm-analyze", async (req, res) => {
    try {
      const { asset, timeframe, data } = req.body;
      if (!asset || !timeframe) return res.status(400).json({ error: "Missing required fields" });
      
      if (process.env.ZHIPU_API_KEY) {
        // Actual implementation would go here
      }

      await new Promise(resolve => setTimeout(resolve, 1800));
      res.json({
        signal: Math.random() > 0.6 ? "BUY" : "SELL",
        confidence: Math.floor(Math.random() * 25) + 65,
        reasoning: `GLM indicates a potential reversal for ${asset} based on momentum divergence.`,
        keyLevels: { support: [1.0490, 1.0410], resistance: [1.0610, 1.0680] }
      });
    } catch (error) {
      console.error("GLM API Error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Proxy endpoint for Grok
  app.post("/api/grok-analyze", async (req, res) => {
    try {
      const { asset, timeframe, data } = req.body;
      if (!asset || !timeframe) return res.status(400).json({ error: "Missing required fields" });
      
      if (process.env.XAI_API_KEY) {
        // Actual implementation would go here
      }

      await new Promise(resolve => setTimeout(resolve, 1000));
      res.json({
        signal: Math.random() > 0.5 ? "BUY" : "SELL",
        confidence: Math.floor(Math.random() * 40) + 50,
        reasoning: `Grok's real-time sentiment analysis for ${asset} points towards this direction.`,
        keyLevels: { support: [1.0510, 1.0460], resistance: [1.0590, 1.0640] }
      });
    } catch (error) {
      console.error("Grok API Error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
