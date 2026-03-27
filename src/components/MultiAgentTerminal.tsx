import React, { useState, useEffect } from 'react';
import { Activity, Brain, CheckCircle2, Cpu, LineChart, Shield, Zap, Loader2 } from 'lucide-react';
import { runEnsembleAnalysis, EnsembleResult } from '../services/aiEnsemble';
import { useTradingStore } from '../store/tradingStore';
import { useRealTimePrice } from '../hooks/useRealTimePrice';

export function MultiAgentTerminal() {
  const [activeAsset, setActiveAsset] = useState('XAU/USD');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [ensembleResult, setEnsembleResult] = useState<EnsembleResult | null>(null);
  const [notification, setNotification] = useState<string | null>(null);
  const openPosition = useTradingStore(state => state.openPosition);
  const { price: currentPrice } = useRealTimePrice(activeAsset);

  const handleAnalyze = async () => {
    setIsAnalyzing(true);
    try {
      // Use current price and generate realistic indicators based on it
      const analysisData = { 
        price: currentPrice || 0, 
        timestamp: new Date().toISOString(),
        timeframe: '1H',
        asset: activeAsset
      };
      
      const result = await runEnsembleAnalysis(activeAsset, '1H', analysisData);
      setEnsembleResult(result);
    } catch (error) {
      console.error("Ensemble analysis failed:", error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  useEffect(() => {
    handleAnalyze();
  }, [activeAsset]);

  const handleExecuteTrade = () => {
    if (!ensembleResult || ensembleResult.finalSignal === 'NEUTRAL') return;
    
    const entryPrice = currentPrice || (activeAsset.includes('XAU') ? 2340.50 : 1.0850);
    
    openPosition({
      pair: activeAsset,
      type: ensembleResult.finalSignal === 'BUY' ? 'LONG' : 'SHORT',
      size: 1.0, // Default size
      entry: entryPrice,
    });
    setNotification(`Executed ${ensembleResult.finalSignal} trade for ${activeAsset} at ${entryPrice}`);
    setTimeout(() => setNotification(null), 3000);
  };

  // Map agent names to icons
  const getAgentIcon = (name: string) => {
    switch (name) {
      case 'Gemini': return <Cpu className="w-5 h-5 text-blue-400" />;
      case 'Claude': return <LineChart className="w-5 h-5 text-orange-400" />;
      case 'GPT4o': return <Brain className="w-5 h-5 text-purple-400" />;
      case 'GLM': return <Activity className="w-5 h-5 text-emerald-400" />;
      case 'Grok': return <Shield className="w-5 h-5 text-red-400" />;
      default: return <Zap className="w-5 h-5 text-zinc-400" />;
    }
  };

  return (
    <div className="flex flex-col h-full gap-6 relative">
      {notification && (
        <div className="absolute top-4 right-4 bg-emerald-500/90 text-white px-4 py-2 rounded-lg shadow-lg z-50 flex items-center gap-2 animate-in fade-in slide-in-from-top-4">
          <CheckCircle2 className="w-4 h-4" />
          {notification}
        </div>
      )}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-zinc-100 flex items-center gap-2">
            <Cpu className="w-6 h-6 text-emerald-400" />
            Multi-Agent Consensus
          </h2>
          <p className="text-zinc-400 text-sm mt-1">6-AI Ensemble Voting & Real-time Analysis</p>
        </div>
        <div className="flex gap-2 bg-zinc-800/50 p-1 rounded-lg border border-zinc-800">
          {['XAU/USD', 'EUR/USD', 'BTC/USD'].map((asset) => (
            <button
              key={asset}
              onClick={() => setActiveAsset(asset)}
              className={`px-4 py-1.5 rounded-md text-sm font-bold transition-all ${
                activeAsset === asset ? 'bg-zinc-700 text-zinc-100 shadow-sm' : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              {asset}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1 min-h-0">
        {/* Consensus Overview */}
        <div className="lg:col-span-1 bg-[#1a1a1a] border border-zinc-800 rounded-xl p-6 flex flex-col items-center justify-center relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-500 via-emerald-400 to-transparent"></div>
          
          {isAnalyzing ? (
            <div className="flex flex-col items-center justify-center h-full space-y-4">
              <Loader2 className="w-12 h-12 text-emerald-400 animate-spin" />
              <div className="text-zinc-400 font-medium animate-pulse">Running Ensemble Analysis...</div>
            </div>
          ) : ensembleResult ? (
            <div className="flex flex-col items-center justify-center w-full h-full">
              <div className="w-48 h-48 rounded-full border-8 border-zinc-800 flex items-center justify-center relative mb-6">
                <svg className="absolute inset-0 w-full h-full -rotate-90">
                  <circle 
                    cx="50%" cy="50%" r="46%" fill="none" 
                    stroke={ensembleResult.finalSignal === 'BUY' ? '#10b981' : ensembleResult.finalSignal === 'SELL' ? '#ef4444' : '#71717a'} 
                    strokeWidth="8" 
                    strokeDasharray="289" 
                    strokeDashoffset={289 - (289 * ensembleResult.consensusScore) / 100} 
                    className="transition-all duration-1000 ease-out" 
                  />
                </svg>
                <div className="text-center">
                  <span className="text-5xl font-black text-zinc-100">{Math.round(ensembleResult.consensusScore)}<span className="text-2xl text-zinc-500">%</span></span>
                  <div className={`text-xs font-bold mt-1 tracking-widest uppercase ${
                    ensembleResult.finalSignal === 'BUY' ? 'text-emerald-400' : 
                    ensembleResult.finalSignal === 'SELL' ? 'text-red-400' : 'text-zinc-400'
                  }`}>
                    {ensembleResult.finalSignal}
                  </div>
                </div>
              </div>
              
              <div className="w-full space-y-3">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-zinc-400">Consensus Requirement</span>
                  <span className="font-bold text-zinc-200">Weighted Average</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-zinc-400">Current Agreement</span>
                  <span className="font-bold text-emerald-400 flex items-center gap-1">
                    <CheckCircle2 className="w-4 h-4" /> 
                    {ensembleResult.agents.filter(a => a.signal === ensembleResult.finalSignal).length} / {ensembleResult.agents.length} AIs
                  </span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-zinc-400">Confidence Score</span>
                  <span className="font-bold text-zinc-200">{ensembleResult.consensusScore > 75 ? 'High' : ensembleResult.consensusScore > 50 ? 'Medium' : 'Low'} ({Math.round(ensembleResult.consensusScore)}%)</span>
                </div>
              </div>
              
              <button 
                onClick={handleExecuteTrade}
                disabled={ensembleResult.finalSignal === 'NEUTRAL'}
                className={`w-full mt-6 py-3 rounded-lg font-bold transition-colors shadow-lg ${
                  ensembleResult.finalSignal === 'BUY' ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-900/20' :
                  ensembleResult.finalSignal === 'SELL' ? 'bg-red-600 hover:bg-red-500 text-white shadow-red-900/20' :
                  'bg-zinc-700 text-zinc-400 cursor-not-allowed'
                }`}
              >
                Execute {ensembleResult.finalSignal !== 'NEUTRAL' ? ensembleResult.finalSignal : ''} Trade
              </button>
            </div>
          ) : (
            <div className="text-zinc-500">No analysis data available.</div>
          )}
        </div>

        {/* Agent Breakdown */}
        <div className="lg:col-span-2 bg-[#1a1a1a] border border-zinc-800 rounded-xl p-5 flex flex-col">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-medium text-zinc-200">Agent Breakdown: {activeAsset}</h3>
            <button 
              onClick={handleAnalyze}
              disabled={isAnalyzing}
              className="px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded text-xs font-medium transition-colors disabled:opacity-50"
            >
              Re-Analyze
            </button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 flex-1 overflow-y-auto pr-2">
            {isAnalyzing ? (
              // Skeleton loading state
              Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="bg-[#121212] border border-zinc-800 rounded-lg p-4 flex flex-col gap-3 animate-pulse">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 bg-zinc-800 rounded-lg"></div>
                      <div>
                        <div className="w-24 h-4 bg-zinc-800 rounded mb-1"></div>
                        <div className="w-16 h-3 bg-zinc-800 rounded"></div>
                      </div>
                    </div>
                    <div className="w-12 h-5 bg-zinc-800 rounded"></div>
                  </div>
                  <div className="mt-2">
                    <div className="flex justify-between mb-1">
                      <div className="w-16 h-3 bg-zinc-800 rounded"></div>
                      <div className="w-8 h-3 bg-zinc-800 rounded"></div>
                    </div>
                    <div className="h-1.5 bg-zinc-800 rounded-full"></div>
                  </div>
                </div>
              ))
            ) : ensembleResult ? (
              ensembleResult.agents.map((agent) => (
                <div key={agent.agentName} className="bg-[#121212] border border-zinc-800 rounded-lg p-4 flex flex-col gap-3 hover:border-zinc-700 transition-colors">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-zinc-800/50 rounded-lg border border-zinc-700/50">
                        {getAgentIcon(agent.agentName)}
                      </div>
                      <div>
                        <div className="font-bold text-zinc-200 text-sm">{agent.agentName}</div>
                        <div className="text-xs text-zinc-500 line-clamp-1" title={agent.reasoning}>{agent.reasoning}</div>
                      </div>
                    </div>
                    <div className={`px-2 py-1 rounded text-[10px] font-bold tracking-wider ${
                      agent.signal === 'BUY' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                      agent.signal === 'SELL' ? 'bg-red-500/10 text-red-400 border border-red-500/20' :
                      'bg-zinc-500/10 text-zinc-400 border border-zinc-500/20'
                    }`}>
                      {agent.signal}
                    </div>
                  </div>
                  
                  <div className="mt-2">
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-zinc-500">Confidence</span>
                      <span className="text-zinc-300 font-medium">{agent.confidence}%</span>
                    </div>
                    <div className="h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                      <div 
                        className={`h-full rounded-full ${agent.confidence > 80 ? 'bg-emerald-500' : agent.confidence > 60 ? 'bg-blue-500' : 'bg-zinc-500'}`}
                        style={{ width: `${agent.confidence}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              ))
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}
