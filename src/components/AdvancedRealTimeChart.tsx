import React from 'react';
import { AdvancedRealTimeChart as TVChart } from 'react-ts-tradingview-widgets';

interface AdvancedRealTimeChartProps {
  asset: string;
  timeframe: string;
  colors?: {
    backgroundColor: string;
    textColor: string;
    lineColor: string;
    areaTopColor: string;
    areaBottomColor: string;
  };
}

export function AdvancedRealTimeChart({ asset, timeframe, colors }: AdvancedRealTimeChartProps) {
  let symbol = 'OANDA:BTCUSD';
  if (asset === 'XAU') symbol = 'OANDA:XAUUSD';
  if (asset === 'EUR') symbol = 'OANDA:EURUSD';
  if (asset === 'DXY') symbol = 'CAPITALCOM:DXY'; // OANDA doesn't have DXY

  // Map our timeframe to TradingView timeframe
  let tvTimeframe = '60'; // 1H default
  if (timeframe === '1H') tvTimeframe = '60';
  if (timeframe === '4H') tvTimeframe = '240';
  if (timeframe === '1D') tvTimeframe = 'D';
  if (timeframe === '1W') tvTimeframe = 'W';

  return (
    <div className="w-full h-full">
      <TVChart
        symbol={symbol}
        theme="dark"
        interval={tvTimeframe as any}
        timezone="Etc/UTC"
        style="1"
        locale="en"
        enable_publishing={false}
        backgroundColor={colors?.backgroundColor || '#0a0a0a'}
        hide_top_toolbar={false}
        hide_legend={false}
        save_image={false}
        autosize
      />
    </div>
  );
}
