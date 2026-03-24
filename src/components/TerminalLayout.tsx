import React from 'react';
import { Activity, MessageSquare, Settings, ShieldAlert, Cpu, LineChart, Zap } from 'lucide-react';
import { Tab } from '../App';
import { cn } from '../lib/utils';

interface Props {
  activeTab: Tab;
  onTabChange: (tab: Tab) => void;
  children: React.ReactNode;
}

export function TerminalLayout({ activeTab, onTabChange, children }: Props) {
  return (
    <div className="flex flex-col md:flex-row h-screen w-full bg-[#121212] text-zinc-300 font-sans overflow-hidden">
      {/* Desktop Sidebar */}
      <div className="hidden md:flex w-64 border-r border-zinc-800 bg-[#121212] flex-col z-20">
        <div className="p-6 border-b border-zinc-800">
          <div className="flex items-center gap-3 text-emerald-400 font-bold text-xl tracking-tight">
            <Activity className="w-6 h-6" />
            <span>QAFSE ULTRA</span>
          </div>
          <div className="text-xs text-zinc-500 mt-2 uppercase tracking-widest font-medium">
            Institutional Grade AI
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-2">
          <NavItem 
            icon={<LineChart className="w-5 h-5" />} 
            label="Market Dashboard" 
            active={activeTab === 'dashboard'} 
            onClick={() => onTabChange('dashboard')} 
          />
          <NavItem 
            icon={<Cpu className="w-5 h-5" />} 
            label="Multi-Agent AI" 
            active={activeTab === 'multi-agent'} 
            onClick={() => onTabChange('multi-agent')} 
          />
          <NavItem 
            icon={<Zap className="w-5 h-5" />} 
            label="Strategy Builder" 
            active={activeTab === 'strategy'} 
            onClick={() => onTabChange('strategy')} 
          />
          <NavItem 
            icon={<ShieldAlert className="w-5 h-5" />} 
            label="Paper Trading" 
            active={activeTab === 'paper-trading'} 
            onClick={() => onTabChange('paper-trading')} 
          />
          <NavItem 
            icon={<MessageSquare className="w-5 h-5" />} 
            label="AI Chatbot" 
            active={activeTab === 'chat'} 
            onClick={() => onTabChange('chat')} 
          />
        </nav>

        <div className="p-6 border-t border-zinc-800 text-sm text-zinc-500">
          <div className="flex items-center gap-2 mb-2">
            <ShieldAlert className="w-4 h-4 text-emerald-500" />
            <span className="font-medium text-emerald-500">System: ONLINE</span>
          </div>
          <div className="text-xs">6-AI Ensemble Consensus</div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col h-full overflow-hidden relative pb-16 md:pb-0">
        <header className="h-16 border-b border-zinc-800 flex items-center px-4 md:px-8 justify-between bg-[#121212] z-10">
          <div className="text-lg font-bold text-zinc-100 capitalize tracking-tight flex items-center gap-2">
            <span className="md:hidden text-emerald-400"><Activity className="w-5 h-5" /></span>
            {activeTab.replace('-', ' ')}
          </div>
          <div className="flex items-center gap-3 text-sm font-medium">
            <span className="text-emerald-400 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              LIVE
            </span>
            <span className="text-zinc-500 hidden sm:inline-block">UTC: {new Date().toISOString().split('T')[1].slice(0, 5)}</span>
          </div>
        </header>
        <main className="flex-1 overflow-y-auto p-4 md:p-8 bg-[#0a0a0a]">
          {children}
        </main>
      </div>

      {/* Mobile Bottom Navigation */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 h-16 bg-[#121212] border-t border-zinc-800 flex items-center justify-around z-50 px-2 pb-safe">
        <MobileNavItem 
          icon={<LineChart className="w-6 h-6" />} 
          label="Markets" 
          active={activeTab === 'dashboard'} 
          onClick={() => onTabChange('dashboard')} 
        />
        <MobileNavItem 
          icon={<Cpu className="w-6 h-6" />} 
          label="Agents" 
          active={activeTab === 'multi-agent'} 
          onClick={() => onTabChange('multi-agent')} 
        />
        <MobileNavItem 
          icon={<Zap className="w-6 h-6" />} 
          label="Strategy" 
          active={activeTab === 'strategy'} 
          onClick={() => onTabChange('strategy')} 
        />
        <MobileNavItem 
          icon={<ShieldAlert className="w-6 h-6" />} 
          label="Trading" 
          active={activeTab === 'paper-trading'} 
          onClick={() => onTabChange('paper-trading')} 
        />
        <MobileNavItem 
          icon={<MessageSquare className="w-6 h-6" />} 
          label="Chat" 
          active={activeTab === 'chat'} 
          onClick={() => onTabChange('chat')} 
        />
      </div>
    </div>
  );
}

function NavItem({ icon, label, active, onClick }: { icon: React.ReactNode, label: string, active: boolean, onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "w-full flex items-center gap-3 px-4 py-3 rounded-xl text-base font-medium transition-all text-left",
        active 
          ? "bg-emerald-500/10 text-emerald-400" 
          : "text-zinc-400 hover:bg-zinc-800/50 hover:text-zinc-200"
      )}
    >
      {icon}
      {label}
    </button>
  );
}

function MobileNavItem({ icon, label, active, onClick }: { icon: React.ReactNode, label: string, active: boolean, onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "flex flex-col items-center justify-center w-full h-full gap-1 transition-colors",
        active ? "text-emerald-400" : "text-zinc-500 hover:text-zinc-300"
      )}
    >
      {icon}
      <span className="text-[10px] font-medium">{label}</span>
    </button>
  );
}
