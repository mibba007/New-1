import { useState, useEffect } from 'react';

// Using Polygon.io WebSocket for real-time forex data
// Note: Requires a valid API key in VITE_POLYGON_KEY
export function useRealTimePrice(symbol: string) {
  const [price, setPrice] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const apiKey = import.meta.env.VITE_POLYGON_KEY;
    
    if (!apiKey) {
      setError('Polygon API key missing');
      // Set a mock price if no API key is available
      let mockPrice = 1.0850;
      if (symbol.includes('XAU')) mockPrice = 2340.50;
      else if (symbol.includes('BTC')) mockPrice = 68500.00;
      else if (symbol.includes('DXY')) mockPrice = 104.20;
      
      setPrice(mockPrice);
      return;
    }

    // Format symbol for Polygon (e.g., C.EURUSD)
    const formattedSymbol = `C.${symbol.replace('/', '')}`;
    
    const ws = new WebSocket('wss://socket.polygon.io/forex');

    ws.onopen = () => {
      ws.send(JSON.stringify({ action: 'auth', params: apiKey }));
      ws.send(JSON.stringify({ action: 'subscribe', params: formattedSymbol }));
    };

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (Array.isArray(data)) {
          for (const msg of data) {
            if (msg.ev === 'C' && msg.sym === formattedSymbol) {
              setPrice(msg.a); // 'a' is the ask price, 'b' is the bid price
            }
          }
        }
      } catch (err) {
        console.error("WebSocket message parsing error:", err);
      }
    };

    ws.onerror = (err) => {
      console.error("WebSocket error:", err);
      setError('WebSocket connection error');
    };

    return () => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify({ action: 'unsubscribe', params: formattedSymbol }));
        ws.close();
      }
    };
  }, [symbol]);

  return { price, error };
}
