import React, { useState, useEffect } from 'react';
import { Activity, ArrowDownRight, ArrowUpRight, DollarSign, Percent, PieChart, ShieldAlert, TrendingUp, Settings, Trash2 } from 'lucide-react';
import { useTradingStore } from '../store/tradingStore';
import { useRealTimePrice } from '../hooks/useRealTimePrice';

function PriceUpdater({ symbol }: { symbol: string }) {
  const { price } = useRealTimePrice(symbol);
  const updateCurrentPrices = useTradingStore(state => state.updateCurrentPrices);

  useEffect(() => {
    if (price) {
      updateCurrentPrices({ [symbol]: price });
    }
  }, [price, symbol, updateCurrentPrices]);

  return null;
}

export function PaperTrading() {
  const { 
    balance, 
    equity, 
    positions, 
    riskParams, 
    killSwitchActive,
    closePosition,
    resetAccount,
    depositFunds,
    setRiskParam,
    toggleKillSwitch
  } = useTradingStore();

  const [depositAmount, setDepositAmount] = useState('10000');
  const [notification, setNotification] = useState<string | null>(null);
  
  // Get unique symbols from open positions
  const uniqueSymbols = Array.from(new Set(positions.map(p => p.pair)));

  const handleDeposit = () => {
    const amount = parseFloat(depositAmount);
    if (!isNaN(amount) && amount > 0) {
      depositFunds(amount);
      setNotification(`Successfully deposited $${amount}`);
      setTimeout(() => setNotification(null), 3000);
    }
  };

  const openPnl = equity - balance;
  const openPnlPercent = (openPnl / balance) * 100;
  const marginUsed = positions.reduce((acc, pos) => acc + (pos.size * pos.entry * 0.01), 0); // Simulated 1% margin
  const marginUsedPercent = (marginUsed / equity) * 100;

  return (
    <div className="flex flex-col h-full gap-6 relative">
      {notification && (
        <div className="absolute top-4 right-4 bg-emerald-500/90 text-white px-4 py-2 rounded-lg shadow-lg z-50 flex items-center gap-2 animate-in fade-in slide-in-from-top-4">
          <Activity className="w-4 h-4" />
          {notification}
        </div>
      )}
      {uniqueSymbols.map(symbol => (
        <PriceUpdater key={symbol} symbol={symbol} />
      ))}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-zinc-100 flex items-center gap-2">
            <ShieldAlert className="w-6 h-6 text-blue-400" />
            Risk Management & Paper Trading
          </h2>
          <p className="text-zinc-400 text-sm mt-1">Simulated Execution & Real-time Exposure</p>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={resetAccount}
            className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 rounded-lg text-sm font-medium transition-colors"
          >
            Reset Account
          </button>
          <div className="flex items-center gap-2 bg-zinc-800 rounded-lg p-1">
            <input 
              type="number" 
              value={depositAmount}
              onChange={(e) => setDepositAmount(e.target.value)}
              className="bg-transparent text-zinc-200 w-24 px-2 py-1 text-sm outline-none"
              placeholder="Amount"
            />
            <button 
              onClick={handleDeposit}
              className="px-4 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-md text-sm font-medium transition-colors"
            >
              Deposit
            </button>
          </div>
        </div>
      </div>

      {/* Top Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard 
          title="Account Equity" 
          value={`$${equity.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`} 
          icon={<DollarSign className="w-5 h-5 text-emerald-400" />} 
          trend={`${((equity - 100000) / 100000 * 100).toFixed(2)}%`} 
          trendUp={equity >= 100000} 
        />
        <MetricCard 
          title="Open P&L" 
          value={`${openPnl >= 0 ? '+' : ''}$${openPnl.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`} 
          icon={<TrendingUp className="w-5 h-5 text-blue-400" />} 
          trend={`${openPnlPercent >= 0 ? '+' : ''}${openPnlPercent.toFixed(2)}%`} 
          trendUp={openPnl >= 0} 
        />
        <MetricCard 
          title="Margin Used" 
          value={`${marginUsedPercent.toFixed(1)}%`} 
          icon={<PieChart className="w-5 h-5 text-purple-400" />} 
        />
        <MetricCard 
          title="Kill Switch" 
          value={killSwitchActive ? "ACTIVE" : "Standby"} 
          icon={<Activity className={`w-5 h-5 ${killSwitchActive ? 'text-red-500' : 'text-emerald-500'}`} />} 
          trend={killSwitchActive ? "Trading Halted" : "Safe"} 
          trendUp={!killSwitchActive} 
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1 min-h-0">
        {/* Open Positions */}
        <div className="lg:col-span-2 bg-[#1a1a1a] border border-zinc-800 rounded-xl p-5 flex flex-col">
          <h3 className="font-medium text-zinc-200 mb-4">Open Positions ({positions.length})</h3>
          <div className="flex-1 overflow-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-zinc-500 uppercase bg-[#121212] border-b border-zinc-800">
                <tr>
                  <th className="px-4 py-3 font-medium rounded-tl-lg">Instrument</th>
                  <th className="px-4 py-3 font-medium">Type</th>
                  <th className="px-4 py-3 font-medium">Size</th>
                  <th className="px-4 py-3 font-medium">Entry Price</th>
                  <th className="px-4 py-3 font-medium">Current Price</th>
                  <th className="px-4 py-3 font-medium text-right">P&L</th>
                  <th className="px-4 py-3 font-medium text-center rounded-tr-lg">Action</th>
                </tr>
              </thead>
              <tbody>
                {positions.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-4 py-8 text-center text-zinc-500">
                      No open positions. Use the Multi-Agent Terminal to execute trades.
                    </td>
                  </tr>
                ) : (
                  positions.map((pos) => (
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
                        <div className="text-xs text-zinc-500">{pos.pnlPercent > 0 ? '+' : ''}{pos.pnlPercent.toFixed(2)}%</div>
                      </td>
                      <td className="px-4 py-4 text-center">
                        <button 
                          onClick={() => closePosition(pos.id, pos.current)}
                          className="p-2 hover:bg-red-500/10 text-zinc-500 hover:text-red-400 rounded-lg transition-colors"
                          title="Close Position"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
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
            <RiskSlider 
              label="Max Risk Per Trade" 
              value={riskParams.maxRiskPerTrade} 
              max={10} 
              unit="%" 
              onChange={(v) => setRiskParam('maxRiskPerTrade', v)} 
            />
            <RiskSlider 
              label="Max Daily Drawdown" 
              value={riskParams.maxDailyDrawdown} 
              max={20} 
              unit="%" 
              onChange={(v) => setRiskParam('maxDailyDrawdown', v)} 
            />
            <RiskSlider 
              label="Max Open Positions" 
              value={riskParams.maxOpenPositions} 
              max={20} 
              unit="" 
              onChange={(v) => setRiskParam('maxOpenPositions', v)} 
            />
            
            <div className="pt-4 border-t border-zinc-800">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-zinc-400">Kill Switch</span>
                <button 
                  onClick={toggleKillSwitch}
                  className={`w-12 h-6 rounded-full relative transition-colors ${killSwitchActive ? 'bg-red-500' : 'bg-zinc-700'}`}
                >
                  <div className={`w-4 h-4 bg-white rounded-full absolute top-1 transition-all ${killSwitchActive ? 'left-7' : 'left-1'}`}></div>
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

function RiskSlider({ label, value, max, unit, onChange }: { label: string, value: number, max: number, unit: string, onChange: (val: number) => void }) {
  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between text-sm">
        <span className="text-zinc-300">{label}</span>
        <span className="font-bold text-emerald-400">{value}{unit}</span>
      </div>
      <input 
        type="range" 
        min="1" 
        max={max} 
        step={unit === '%' ? "0.5" : "1"}
        value={value} 
        onChange={(e) => onChange(parseFloat(e.target.value))}
        className="w-full h-2 bg-[#121212] rounded-full appearance-none cursor-pointer accent-emerald-500"
      />
    </div>
  );
}
