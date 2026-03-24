import React, { useState } from 'react';
import { Activity, Brain, CheckCircle2, Cpu, LineChart, Shield, Zap } from 'lucide-react';

export function MultiAgentTerminal() {
  const [activeAsset, setActiveAsset] = useState('XAU/USD');

  const agents = [
    { id: 'gpt', name: 'GPT-5.4 Thinking', role: 'Macro & Policy', score: 85, vote: 'BULLISH', icon: <Brain className="w-5 h-5 text-purple-400" /> },
    { id: 'gemini', name: 'Gemini 3.1 Pro', role: 'Real-time & News', score: 92, vote: 'BULLISH', icon: <Cpu className="w-5 h-5 text-blue-400" /> },
    { id: 'opus', name: 'Claude Opus 4.6', role: 'Deep Technical', score: 78, vote: 'NEUTRAL', icon: <LineChart className="w-5 h-5 text-orange-400" /> },
    { id: 'sonnet', name: 'Claude Sonnet 4.6', role: 'Fast Execution', score: 88, vote: 'BULLISH', icon: <Zap className="w-5 h-5 text-yellow-400" /> },
    { id: 'glm', name: 'GLM-5', role: 'Quant Modeling', score: 65, vote: 'BEARISH', icon: <Activity className="w-5 h-5 text-emerald-400" /> },
    { id: 'grok', name: 'Grok 4.1 Fast', role: 'Social Sentiment', score: 95, vote: 'BULLISH', icon: <Shield className="w-5 h-5 text-red-400" /> },
  ];

  return (
    <div className="flex flex-col h-full gap-6">
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
          
          <div className="w-48 h-48 rounded-full border-8 border-zinc-800 flex items-center justify-center relative mb-6">
            <svg className="absolute inset-0 w-full h-full -rotate-90">
              <circle cx="50%" cy="50%" r="46%" fill="none" stroke="#10b981" strokeWidth="8" strokeDasharray="289" strokeDashoffset="58" className="transition-all duration-1000 ease-out" />
            </svg>
            <div className="text-center">
              <span className="text-5xl font-black text-zinc-100">80<span className="text-2xl text-zinc-500">%</span></span>
              <div className="text-xs font-bold text-emerald-400 mt-1 tracking-widest uppercase">Strong Buy</div>
            </div>
          </div>
          
          <div className="w-full space-y-3">
            <div className="flex justify-between items-center text-sm">
              <span className="text-zinc-400">Consensus Requirement</span>
              <span className="font-bold text-zinc-200">4 / 6 AIs</span>
            </div>
            <div className="flex justify-between items-center text-sm">
              <span className="text-zinc-400">Current Agreement</span>
              <span className="font-bold text-emerald-400 flex items-center gap-1"><CheckCircle2 className="w-4 h-4" /> 4 / 6 AIs</span>
            </div>
            <div className="flex justify-between items-center text-sm">
              <span className="text-zinc-400">Confidence Score</span>
              <span className="font-bold text-zinc-200">High (84%)</span>
            </div>
          </div>
          
          <button className="w-full mt-6 py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg font-bold transition-colors shadow-lg shadow-emerald-900/20">
            Execute Trade
          </button>
        </div>

        {/* Agent Breakdown */}
        <div className="lg:col-span-2 bg-[#1a1a1a] border border-zinc-800 rounded-xl p-5 flex flex-col">
          <h3 className="font-medium text-zinc-200 mb-4">Agent Breakdown: {activeAsset}</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 flex-1 overflow-y-auto pr-2">
            {agents.map((agent) => (
              <div key={agent.id} className="bg-[#121212] border border-zinc-800 rounded-lg p-4 flex flex-col gap-3 hover:border-zinc-700 transition-colors">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-zinc-800/50 rounded-lg border border-zinc-700/50">
                      {agent.icon}
                    </div>
                    <div>
                      <div className="font-bold text-zinc-200 text-sm">{agent.name}</div>
                      <div className="text-xs text-zinc-500">{agent.role}</div>
                    </div>
                  </div>
                  <div className={`px-2 py-1 rounded text-[10px] font-bold tracking-wider ${
                    agent.vote === 'BULLISH' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                    agent.vote === 'BEARISH' ? 'bg-red-500/10 text-red-400 border border-red-500/20' :
                    'bg-zinc-500/10 text-zinc-400 border border-zinc-500/20'
                  }`}>
                    {agent.vote}
                  </div>
                </div>
                
                <div className="mt-2">
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-zinc-500">Confidence</span>
                    <span className="text-zinc-300 font-medium">{agent.score}%</span>
                  </div>
                  <div className="h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                    <div 
                      className={`h-full rounded-full ${agent.score > 80 ? 'bg-emerald-500' : agent.score > 60 ? 'bg-blue-500' : 'bg-zinc-500'}`}
                      style={{ width: `${agent.score}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
