import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface Position {
  id: string;
  pair: string;
  type: 'LONG' | 'SHORT';
  size: number;
  entry: number;
  current: number;
  pnl: number;
  pnlPercent: number;
  stopLoss?: number;
  takeProfit?: number;
}

export interface TradeHistory {
  id: string;
  pair: string;
  type: 'LONG' | 'SHORT';
  size: number;
  entry: number;
  exit: number;
  pnl: number;
  pnlPercent: number;
  closedAt: number;
}

interface RiskParams {
  maxRiskPerTrade: number; // percentage
  maxDailyDrawdown: number; // percentage
  maxOpenPositions: number;
}

interface TradingState {
  balance: number;
  equity: number;
  positions: Position[];
  tradeHistory: TradeHistory[];
  riskParams: RiskParams;
  killSwitchActive: boolean;
  
  // Actions
  openPosition: (position: Omit<Position, 'id' | 'pnl' | 'pnlPercent' | 'current'>) => void;
  closePosition: (id: string, currentPrice: number) => void;
  updateCurrentPrices: (prices: Record<string, number>) => void;
  toggleKillSwitch: () => void;
  setRiskParam: (key: keyof RiskParams, value: number) => void;
  checkRiskLimits: () => { allowed: boolean; reason?: string };
  resetAccount: () => void;
  depositFunds: (amount: number) => void;
}

const INITIAL_BALANCE = 100000;

export const useTradingStore = create<TradingState>()(
  persist(
    (set, get) => ({
      balance: INITIAL_BALANCE,
      equity: INITIAL_BALANCE,
      positions: [],
      tradeHistory: [],
      riskParams: {
        maxRiskPerTrade: 2.0,
        maxDailyDrawdown: 5.0,
        maxOpenPositions: 5,
      },
      killSwitchActive: false,

      openPosition: (pos) => {
        const state = get();
        if (state.killSwitchActive) return;
        
        const riskCheck = state.checkRiskLimits();
        if (!riskCheck.allowed) {
          console.warn(`Trade rejected: ${riskCheck.reason}`);
          return;
        }

        const newPosition: Position = {
          ...pos,
          id: Math.random().toString(36).substring(7),
          current: pos.entry,
          pnl: 0,
          pnlPercent: 0,
        };

        set((state) => ({
          positions: [...state.positions, newPosition],
        }));
      },

      closePosition: (id, currentPrice) => {
        set((state) => {
          const position = state.positions.find((p) => p.id === id);
          if (!position) return state;

          const pnl = position.type === 'LONG' 
            ? (currentPrice - position.entry) * position.size * 100000 // Simplified calc
            : (position.entry - currentPrice) * position.size * 100000;
            
          const pnlPercent = (pnl / state.balance) * 100;

          const historyEntry: TradeHistory = {
            id: position.id,
            pair: position.pair,
            type: position.type,
            size: position.size,
            entry: position.entry,
            exit: currentPrice,
            pnl,
            pnlPercent,
            closedAt: Date.now(),
          };

          const newBalance = state.balance + pnl;

          return {
            positions: state.positions.filter((p) => p.id !== id),
            tradeHistory: [historyEntry, ...state.tradeHistory],
            balance: newBalance,
            equity: newBalance, // Will be updated by updateCurrentPrices for remaining positions
          };
        });
      },

      updateCurrentPrices: (prices) => {
        set((state) => {
          let totalUnrealizedPnl = 0;
          
          const updatedPositions = state.positions.map((pos) => {
            const currentPrice = prices[pos.pair] || pos.current;
            
            // Simplified PnL calculation for forex (assuming standard lots and USD quote)
            const pnl = pos.type === 'LONG'
              ? (currentPrice - pos.entry) * pos.size * 100000
              : (pos.entry - currentPrice) * pos.size * 100000;
              
            const pnlPercent = (pnl / state.balance) * 100;
            totalUnrealizedPnl += pnl;

            // Auto SL/TP check could go here
            if (pos.stopLoss && (pos.type === 'LONG' ? currentPrice <= pos.stopLoss : currentPrice >= pos.stopLoss)) {
                // Trigger SL (in a real app, this would dispatch an action or be handled asynchronously)
                // For now, we just update the price
            }

            return { ...pos, current: currentPrice, pnl, pnlPercent };
          });

          const newEquity = state.balance + totalUnrealizedPnl;
          
          // Check daily drawdown
          const drawdown = ((INITIAL_BALANCE - newEquity) / INITIAL_BALANCE) * 100;
          let killSwitch = state.killSwitchActive;
          
          if (drawdown >= state.riskParams.maxDailyDrawdown && !killSwitch) {
            killSwitch = true;
            // In a real app, we would close all positions here
          }

          return {
            positions: updatedPositions,
            equity: newEquity,
            killSwitchActive: killSwitch
          };
        });
      },

      toggleKillSwitch: () => set((state) => ({ killSwitchActive: !state.killSwitchActive })),

      setRiskParam: (key, value) => set((state) => ({
        riskParams: { ...state.riskParams, [key]: value }
      })),

      checkRiskLimits: () => {
        const state = get();
        if (state.positions.length >= state.riskParams.maxOpenPositions) {
          return { allowed: false, reason: 'Max open positions reached' };
        }
        // Add more complex risk checks here (e.g., margin utilization, correlation)
        return { allowed: true };
      },
      
      resetAccount: () => set({
        balance: INITIAL_BALANCE,
        equity: INITIAL_BALANCE,
        positions: [],
        tradeHistory: [],
        killSwitchActive: false
      }),
      
      depositFunds: (amount) => set((state) => ({
        balance: state.balance + amount,
        equity: state.equity + amount
      }))
    }),
    {
      name: 'qafse-trading-store',
    }
  )
);
