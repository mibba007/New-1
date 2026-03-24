import React, { useState } from 'react';
import { TerminalLayout } from './components/TerminalLayout';
import { MarketDashboard } from './components/MarketDashboard';
import { AIChat } from './components/AIChat';
import { StrategyBuilder } from './components/StrategyBuilder';
import { PaperTrading } from './components/PaperTrading';
import { MultiAgentTerminal } from './components/MultiAgentTerminal';

export type Tab = 'dashboard' | 'chat' | 'strategy' | 'paper-trading' | 'multi-agent';

export default function App() {
  const [activeTab, setActiveTab] = useState<Tab>('dashboard');

  return (
    <TerminalLayout activeTab={activeTab} onTabChange={setActiveTab}>
      {activeTab === 'dashboard' && (
        <div className="block h-full">
          <MarketDashboard />
        </div>
      )}
      {activeTab === 'chat' && (
        <div className="block h-full">
          <AIChat />
        </div>
      )}
      {activeTab === 'strategy' && (
        <div className="block h-full">
          <StrategyBuilder />
        </div>
      )}
      {activeTab === 'paper-trading' && (
        <div className="block h-full">
          <PaperTrading />
        </div>
      )}
      {activeTab === 'multi-agent' && (
        <div className="block h-full">
          <MultiAgentTerminal />
        </div>
      )}
    </TerminalLayout>
  );
}
