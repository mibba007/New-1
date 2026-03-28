import React, { useState } from 'react';
import { Play, Plus, Save, Settings2, Trash2, Zap, Loader2, Calendar, DollarSign, Activity } from 'lucide-react';
import { generateMarketScan } from '../services/ai';

interface Rule {
  id: number;
  type: 'condition' | 'action';
  text: string;
}

export function StrategyBuilder() {
  const [strategyPrompt, setStrategyPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [notification, setNotification] = useState<string | null>(null);
  const [rules, setRules] = useState<Rule[]>([
    { id: 1, type: 'condition', text: 'RSI (14) crosses below 30' },
    { id: 2, type: 'action', text: 'BUY 1 Standard Lot' },
    { id: 3, type: 'condition', text: 'MACD Signal crosses up' },
  ]);

  const [backtestParams, setBacktestParams] = useState({
    startDate: '2023-01-01',
    endDate: new Date().toISOString().split('T')[0],
    initialCapital: 10000,
    instrument: 'AAPL'
  });

  const [isBacktesting, setIsBacktesting] = useState(false);
  const [backtestResult, setBacktestResult] = useState<{
    winRate: number;
    totalTrades: number;
    profitFactor: number;
    netProfit: number;
  } | null>(null);

  const handleGenerateRules = async () => {
    if (!strategyPrompt.trim()) return;
    
    setIsGenerating(true);
    try {
      const prompt = `Convert the following trading strategy description into a structured list of rules.
      Strategy: "${strategyPrompt}"
      
      Return ONLY a JSON array of objects with this exact structure:
      [
        { "type": "condition" or "action", "text": "Clear description of the rule" }
      ]`;

      const response = await generateMarketScan(prompt, true);
      const jsonMatch = response?.match(/\[[\s\S]*\]/);
      
      if (jsonMatch) {
        const parsedRules = JSON.parse(jsonMatch[0]);
        const formattedRules = parsedRules.map((r: any, idx: number) => ({
          id: Date.now() + idx,
          type: r.type === 'action' ? 'action' : 'condition',
          text: r.text
        }));
        setRules(formattedRules);
        setBacktestResult(null); // Reset backtest on new rules
      } else {
        throw new Error("Failed to parse JSON array from response");
      }
    } catch (error) {
      console.error("Failed to generate rules:", error);
      setNotification("Failed to generate rules. Please try rephrasing your strategy.");
      setTimeout(() => setNotification(null), 3000);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleBacktest = () => {
    if (rules.length === 0) return;
    setIsBacktesting(true);
    
    // Simulate backtest delay
    setTimeout(() => {
      const baseProfit = (Math.random() * 0.8 - 0.2) * backtestParams.initialCapital; // -20% to +60% return
      setBacktestResult({
        winRate: Math.floor(Math.random() * 30) + 45, // 45% - 75%
        totalTrades: Math.floor(Math.random() * 200) + 50, // 50 - 250
        profitFactor: +(Math.random() * 1.5 + 1.1).toFixed(2), // 1.1 - 2.6
        netProfit: Math.floor(baseProfit),
      });
      setIsBacktesting(false);
    }, 2000);
  };

  const removeRule = (id: number) => {
    setRules(rules.filter(r => r.id !== id));
  };

  return (
    <div className="flex flex-col h-full gap-6 relative">
      {notification && (
        <div className="absolute top-4 right-4 bg-red-500/90 text-white px-4 py-2 rounded-lg shadow-lg z-50 flex items-center gap-2 animate-in fade-in slide-in-from-top-4">
          <Zap className="w-4 h-4" />
          {notification}
        </div>
      )}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-zinc-100">AI Strategy Builder</h2>
          <p className="text-zinc-400 text-sm mt-1">Natural Language to Execution Rules</p>
        </div>
        <div className="flex gap-3">
          <button className="flex items-center gap-2 px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 rounded-lg text-sm font-medium transition-colors">
            <Save className="w-4 h-4" /> Save
          </button>
          <button 
            onClick={handleBacktest}
            disabled={isBacktesting || rules.length === 0}
            className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isBacktesting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
            {isBacktesting ? 'Running...' : 'Backtest'}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1 min-h-0">
        {/* Left Column: Input & Parameters */}
        <div className="lg:col-span-1 flex flex-col gap-6 overflow-y-auto pr-2">
          {/* Natural Language Input */}
          <div className="flex flex-col gap-4 bg-[#1a1a1a] border border-zinc-800 rounded-xl p-5">
            <div className="flex items-center gap-2 text-emerald-400 font-medium mb-2">
              <Zap className="w-5 h-5" />
              <h3>Natural Language Input</h3>
            </div>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Describe your strategy in plain English. The AI will automatically convert it into executable trading rules.
            </p>
            <textarea
              className="w-full h-32 bg-[#121212] border border-zinc-800 rounded-lg p-4 text-sm text-zinc-200 focus:outline-none focus:border-emerald-500/50 resize-none"
              placeholder="e.g., Buy when RSI is below 30 and MACD crosses up. Set stop loss at 1.5 ATR and take profit at 3 ATR."
              value={strategyPrompt}
              onChange={(e) => setStrategyPrompt(e.target.value)}
            />
            <button 
              onClick={handleGenerateRules}
              disabled={isGenerating || !strategyPrompt.trim()}
              className="w-full py-3 bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-400 border border-emerald-500/30 rounded-lg font-medium text-sm transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isGenerating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Settings2 className="w-4 h-4" />}
              {isGenerating ? 'Generating...' : 'Generate Rules'}
            </button>
          </div>

          {/* Backtest Parameters */}
          <div className="flex flex-col gap-4 bg-[#1a1a1a] border border-zinc-800 rounded-xl p-5">
            <div className="flex items-center gap-2 text-blue-400 font-medium mb-2">
              <Settings2 className="w-5 h-5" />
              <h3>Backtest Parameters</h3>
            </div>
            
            <div className="space-y-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-medium text-zinc-400 flex items-center gap-1.5">
                  <Activity className="w-3.5 h-3.5" /> Instrument
                </label>
                <input
                  type="text"
                  value={backtestParams.instrument}
                  onChange={(e) => setBacktestParams({ ...backtestParams, instrument: e.target.value.toUpperCase() })}
                  className="w-full bg-[#121212] border border-zinc-800 rounded-lg px-3 py-2 text-sm text-zinc-200 focus:outline-none focus:border-blue-500/50"
                  placeholder="e.g., AAPL, BTC-USD"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-medium text-zinc-400 flex items-center gap-1.5">
                  <DollarSign className="w-3.5 h-3.5" /> Initial Capital
                </label>
                <input
                  type="number"
                  value={backtestParams.initialCapital}
                  onChange={(e) => setBacktestParams({ ...backtestParams, initialCapital: Number(e.target.value) })}
                  className="w-full bg-[#121212] border border-zinc-800 rounded-lg px-3 py-2 text-sm text-zinc-200 focus:outline-none focus:border-blue-500/50"
                  min="100"
                  step="1000"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-medium text-zinc-400 flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5" /> Start Date
                  </label>
                  <input
                    type="date"
                    value={backtestParams.startDate}
                    onChange={(e) => setBacktestParams({ ...backtestParams, startDate: e.target.value })}
                    className="w-full bg-[#121212] border border-zinc-800 rounded-lg px-3 py-2 text-sm text-zinc-200 focus:outline-none focus:border-blue-500/50"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-medium text-zinc-400 flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5" /> End Date
                  </label>
                  <input
                    type="date"
                    value={backtestParams.endDate}
                    onChange={(e) => setBacktestParams({ ...backtestParams, endDate: e.target.value })}
                    className="w-full bg-[#121212] border border-zinc-800 rounded-lg px-3 py-2 text-sm text-zinc-200 focus:outline-none focus:border-blue-500/50"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Rule Builder Canvas */}
        <div className="lg:col-span-2 flex flex-col bg-[#1a1a1a] border border-zinc-800 rounded-xl p-5 overflow-hidden">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-medium text-zinc-200">Execution Rules</h3>
            <button className="text-xs flex items-center gap-1 text-emerald-400 hover:text-emerald-300">
              <Plus className="w-4 h-4" /> Add Rule Manually
            </button>
          </div>
          
          <div className="flex-1 overflow-y-auto pr-2 space-y-3">
            {rules.map((rule, idx) => (
              <div key={rule.id} className="flex items-center gap-3">
                <div className="flex flex-col items-center">
                  <div className="w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center text-xs font-bold text-zinc-400 border border-zinc-700">
                    {idx + 1}
                  </div>
                  {idx < rules.length - 1 && <div className="w-0.5 h-6 bg-zinc-800 my-1"></div>}
                </div>
                <div className="flex-1 bg-[#121212] border border-zinc-800 rounded-lg p-4 flex items-center justify-between group hover:border-zinc-700 transition-colors">
                  <div className="flex items-center gap-3">
                    <span className={`text-[10px] uppercase tracking-wider font-bold px-2 py-1 rounded ${
                      rule.type === 'condition' ? 'bg-blue-500/10 text-blue-400' : 'bg-emerald-500/10 text-emerald-400'
                    }`}>
                      {rule.type}
                    </span>
                    <span className="text-sm text-zinc-300">{rule.text}</span>
                  </div>
                  <button 
                    onClick={() => removeRule(rule.id)}
                    className="text-zinc-600 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
            
            <div className="flex items-center gap-3 mt-4 opacity-50">
              <div className="flex flex-col items-center">
                <div className="w-8 h-8 rounded-full border-2 border-dashed border-zinc-700 flex items-center justify-center text-zinc-600">
                  <Plus className="w-4 h-4" />
                </div>
              </div>
              <div className="flex-1 border-2 border-dashed border-zinc-800 rounded-lg p-4 flex items-center justify-center text-sm text-zinc-500 cursor-pointer hover:border-zinc-700 hover:text-zinc-400 transition-colors">
                Drag and drop or click to add new rule
              </div>
            </div>
          </div>

          {/* Backtest Results Panel */}
          {backtestResult && (
            <div className="mt-6 p-5 bg-[#121212] border border-emerald-500/20 rounded-xl animate-in fade-in slide-in-from-bottom-4">
              <h4 className="text-emerald-400 font-medium mb-4 flex items-center gap-2">
                <Play className="w-4 h-4" /> Backtest Results (Simulated)
              </h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="flex flex-col gap-1">
                  <span className="text-xs text-zinc-500">Win Rate</span>
                  <span className="text-lg font-bold text-zinc-200">{backtestResult.winRate}%</span>
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-xs text-zinc-500">Total Trades</span>
                  <span className="text-lg font-bold text-zinc-200">{backtestResult.totalTrades}</span>
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-xs text-zinc-500">Profit Factor</span>
                  <span className="text-lg font-bold text-zinc-200">{backtestResult.profitFactor}</span>
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-xs text-zinc-500">Net Profit</span>
                  <span className={`text-lg font-bold ${backtestResult.netProfit >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                    ${backtestResult.netProfit.toLocaleString()}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
