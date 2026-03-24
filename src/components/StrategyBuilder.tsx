import React, { useState } from 'react';
import { Play, Plus, Save, Settings2, Trash2, Zap } from 'lucide-react';

export function StrategyBuilder() {
  const [strategyPrompt, setStrategyPrompt] = useState('');
  const [rules, setRules] = useState([
    { id: 1, type: 'condition', text: 'RSI (14) crosses below 30' },
    { id: 2, type: 'action', text: 'BUY 1 Standard Lot' },
    { id: 3, type: 'condition', text: 'MACD Signal crosses up' },
  ]);

  return (
    <div className="flex flex-col h-full gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-zinc-100">AI Strategy Builder</h2>
          <p className="text-zinc-400 text-sm mt-1">Natural Language to Execution Rules</p>
        </div>
        <div className="flex gap-3">
          <button className="flex items-center gap-2 px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 rounded-lg text-sm font-medium transition-colors">
            <Save className="w-4 h-4" /> Save
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-sm font-medium transition-colors">
            <Play className="w-4 h-4" /> Backtest
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1 min-h-0">
        {/* Natural Language Input */}
        <div className="lg:col-span-1 flex flex-col gap-4 bg-[#1a1a1a] border border-zinc-800 rounded-xl p-5">
          <div className="flex items-center gap-2 text-emerald-400 font-medium mb-2">
            <Zap className="w-5 h-5" />
            <h3>Natural Language Input</h3>
          </div>
          <p className="text-xs text-zinc-400 leading-relaxed">
            Describe your strategy in plain English. The AI will automatically convert it into executable trading rules.
          </p>
          <textarea
            className="flex-1 w-full bg-[#121212] border border-zinc-800 rounded-lg p-4 text-sm text-zinc-200 focus:outline-none focus:border-emerald-500/50 resize-none"
            placeholder="e.g., Buy when RSI is below 30 and MACD crosses up. Set stop loss at 1.5 ATR and take profit at 3 ATR."
            value={strategyPrompt}
            onChange={(e) => setStrategyPrompt(e.target.value)}
          />
          <button className="w-full py-3 bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-400 border border-emerald-500/30 rounded-lg font-medium text-sm transition-colors flex items-center justify-center gap-2">
            <Settings2 className="w-4 h-4" /> Generate Rules
          </button>
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
                  <button className="text-zinc-600 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity">
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
        </div>
      </div>
    </div>
  );
}
