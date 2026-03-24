import React from 'react';
import { Activity, ArrowDownRight, ArrowUpRight, DollarSign, Percent, PieChart, ShieldAlert, TrendingUp, Settings } from 'lucide-react';

export function PaperTrading() {
  const positions = [
    { id: 1, pair: 'EUR/USD', type: 'LONG', size: 1.5, entry: 1.0850, current: 1.0875, pnl: 375.00, pnlPercent: 0.23 },
    { id: 2, pair: 'XAU/USD', type: 'SHORT', size: 0.5, entry: 2345.50, current: 2340.20, pnl: 265.00, pnlPercent: 0.22 },
    { id: 3, pair: 'BTC/USD', type: 'LONG', size: 0.1, entry: 67500, current: 66800, pnl: -70.00, pnlPercent: -1.03 },
  ];

  return (
    <div className="flex flex-col h-full gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-zinc-100 flex items-center gap-2">
            <ShieldAlert className="w-6 h-6 text-blue-400" />
            Risk Management & Paper Trading
          </h2>
          <p className="text-zinc-400 text-sm mt-1">Simulated Execution & Real-time Exposure</p>
        </div>
        <div className="flex gap-3">
          <button className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 rounded-lg text-sm font-medium transition-colors">
            Reset Account
          </button>
          <button className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-sm font-medium transition-colors">
            Deposit Funds
          </button>
        </div>
      </div>

      {/* Top Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard title="Account Balance" value="$105,420.50" icon={<DollarSign className="w-5 h-5 text-emerald-400" />} trend="+5.4%" trendUp />
        <MetricCard title="Open P&L" value="+$570.00" icon={<TrendingUp className="w-5 h-5 text-blue-400" />} trend="+0.54%" trendUp />
        <MetricCard title="Margin Used" value="12.4%" icon={<PieChart className="w-5 h-5 text-purple-400" />} />
        <MetricCard title="Daily Drawdown" value="-1.2%" icon={<Activity className="w-5 h-5 text-red-400" />} trend="Safe" trendUp={false} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1 min-h-0">
        {/* Open Positions */}
        <div className="lg:col-span-2 bg-[#1a1a1a] border border-zinc-800 rounded-xl p-5 flex flex-col">
          <h3 className="font-medium text-zinc-200 mb-4">Open Positions</h3>
          <div className="flex-1 overflow-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-zinc-500 uppercase bg-[#121212] border-b border-zinc-800">
                <tr>
                  <th className="px-4 py-3 font-medium rounded-tl-lg">Instrument</th>
                  <th className="px-4 py-3 font-medium">Type</th>
                  <th className="px-4 py-3 font-medium">Size</th>
                  <th className="px-4 py-3 font-medium">Entry Price</th>
                  <th className="px-4 py-3 font-medium">Current Price</th>
                  <th className="px-4 py-3 font-medium text-right rounded-tr-lg">P&L</th>
                </tr>
              </thead>
              <tbody>
                {positions.map((pos) => (
                  <tr key={pos.id} className="border-b border-zinc-800/50 hover:bg-zinc-800/30 transition-colors">
                    <td className="px-4 py-4 font-bold text-zinc-200">{pos.pair}</td>
                    <td className="px-4 py-4">
                      <span className={`px-2 py-1 rounded text-xs font-bold ${pos.type === 'LONG' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'}`}>
                        {pos.type}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-zinc-300">{pos.size} Lots</td>
                    <td className="px-4 py-4 text-zinc-400">{pos.entry.toFixed(4)}</td>
                    <td className="px-4 py-4 text-zinc-200">{pos.current.toFixed(4)}</td>
                    <td className="px-4 py-4 text-right">
                      <div className={`font-bold flex items-center justify-end gap-1 ${pos.pnl >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                        {pos.pnl >= 0 ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
                        ${Math.abs(pos.pnl).toFixed(2)}
                      </div>
                      <div className="text-xs text-zinc-500">{pos.pnlPercent > 0 ? '+' : ''}{pos.pnlPercent}%</div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Risk Parameters */}
        <div className="lg:col-span-1 bg-[#1a1a1a] border border-zinc-800 rounded-xl p-5 flex flex-col gap-4">
          <h3 className="font-medium text-zinc-200 flex items-center gap-2">
            <Settings className="w-4 h-4 text-zinc-400" />
            Risk Parameters
          </h3>
          
          <div className="space-y-4 mt-2">
            <RiskSlider label="Max Risk Per Trade" value="2.0%" />
            <RiskSlider label="Max Daily Drawdown" value="5.0%" />
            <RiskSlider label="Max Open Positions" value="8" />
            
            <div className="pt-4 border-t border-zinc-800">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-zinc-400">Kill Switch</span>
                <button className="w-12 h-6 bg-zinc-700 rounded-full relative transition-colors">
                  <div className="w-4 h-4 bg-zinc-400 rounded-full absolute left-1 top-1"></div>
                </button>
              </div>
              <p className="text-xs text-zinc-500 leading-relaxed">
                Automatically close all positions and halt trading if daily drawdown exceeds the maximum limit.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function MetricCard({ title, value, icon, trend, trendUp }: { title: string, value: string, icon: React.ReactNode, trend?: string, trendUp?: boolean }) {
  return (
    <div className="bg-[#1a1a1a] border border-zinc-800 rounded-xl p-5 flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-zinc-400">{title}</span>
        <div className="p-2 bg-[#121212] rounded-lg border border-zinc-800">
          {icon}
        </div>
      </div>
      <div className="flex items-end justify-between">
        <span className="text-2xl font-bold text-zinc-100">{value}</span>
        {trend && (
          <span className={`text-xs font-bold flex items-center gap-1 ${trendUp ? 'text-emerald-400' : trendUp === false ? 'text-red-400' : 'text-zinc-500'}`}>
            {trendUp ? <ArrowUpRight className="w-3 h-3" /> : trendUp === false ? <ArrowDownRight className="w-3 h-3" /> : null}
            {trend}
          </span>
        )}
      </div>
    </div>
  );
}

function RiskSlider({ label, value }: { label: string, value: string }) {
  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between text-sm">
        <span className="text-zinc-300">{label}</span>
        <span className="font-bold text-emerald-400">{value}</span>
      </div>
      <div className="h-2 bg-[#121212] rounded-full overflow-hidden border border-zinc-800">
        <div className="h-full bg-emerald-500/50 w-1/3 rounded-full"></div>
      </div>
    </div>
  );
}
