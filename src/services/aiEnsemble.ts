import { generateMarketScan } from './ai';

export interface AgentResult {
  agentName: string;
  signal: 'BUY' | 'SELL' | 'NEUTRAL';
  confidence: number;
  reasoning: string;
  keyLevels?: {
    support: number[];
    resistance: number[];
  };
}

export interface EnsembleResult {
  finalSignal: 'BUY' | 'SELL' | 'NEUTRAL';
  consensusScore: number;
  agents: AgentResult[];
  tradingPlan: string;
}

const AGENT_WEIGHTS = {
  Gemini: 0.35,
  Claude: 0.30,
  GPT4o: 0.20,
  GLM: 0.10,
  Grok: 0.05,
};

export async function runGeminiAgent(asset: string, timeframe: string, data: any): Promise<AgentResult> {
  const prompt = `Analyze ${asset} on ${timeframe} timeframe. Data: ${JSON.stringify(data)}.
  Return ONLY a JSON object with this exact structure:
  {
    "signal": "BUY" or "SELL" or "NEUTRAL",
    "confidence": number between 0 and 100,
    "reasoning": "Brief explanation",
    "keyLevels": { "support": [number, number], "resistance": [number, number] }
  }`;

  try {
    const response = await generateMarketScan(prompt, true);
    // Attempt to parse JSON from the response
    const jsonMatch = response?.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      return {
        agentName: 'Gemini',
        signal: parsed.signal || 'NEUTRAL',
        confidence: parsed.confidence || 50,
        reasoning: parsed.reasoning || 'No reasoning provided.',
        keyLevels: parsed.keyLevels
      };
    }
    throw new Error("Failed to parse JSON from Gemini");
  } catch (error) {
    console.error("Gemini Agent Error:", error);
    return {
      agentName: 'Gemini',
      signal: 'NEUTRAL',
      confidence: 0,
      reasoning: 'Error during analysis.',
    };
  }
}

export async function runClaudeAgent(asset: string, timeframe: string, data: any): Promise<AgentResult> {
  try {
    const response = await fetch('/api/claude-analyze', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ asset, timeframe, data })
    });
    
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    
    const result = await response.json();
    return {
      agentName: 'Claude',
      signal: result.signal || 'NEUTRAL',
      confidence: result.confidence || 50,
      reasoning: result.reasoning || 'No reasoning provided.',
      keyLevels: result.keyLevels
    };
  } catch (error) {
    console.error("Claude Agent Error:", error);
    return {
      agentName: 'Claude',
      signal: 'NEUTRAL',
      confidence: 0,
      reasoning: 'Error during analysis.',
    };
  }
}

// Placeholders for other agents
export async function runGPT4oAgent(asset: string, timeframe: string, data: any): Promise<AgentResult> {
  try {
    const response = await fetch('/api/gpt4o-analyze', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ asset, timeframe, data })
    });
    
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    
    const result = await response.json();
    return {
      agentName: 'GPT4o',
      signal: result.signal || 'NEUTRAL',
      confidence: result.confidence || 50,
      reasoning: result.reasoning || 'No reasoning provided.',
      keyLevels: result.keyLevels
    };
  } catch (error) {
    console.error("GPT-4o Agent Error:", error);
    return {
      agentName: 'GPT4o',
      signal: 'NEUTRAL',
      confidence: 0,
      reasoning: 'Error during analysis.',
    };
  }
}

export async function runGLMAgent(asset: string, timeframe: string, data: any): Promise<AgentResult> {
  try {
    const response = await fetch('/api/glm-analyze', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ asset, timeframe, data })
    });
    
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    
    const result = await response.json();
    return {
      agentName: 'GLM',
      signal: result.signal || 'NEUTRAL',
      confidence: result.confidence || 50,
      reasoning: result.reasoning || 'No reasoning provided.',
      keyLevels: result.keyLevels
    };
  } catch (error) {
    console.error("GLM Agent Error:", error);
    return {
      agentName: 'GLM',
      signal: 'NEUTRAL',
      confidence: 0,
      reasoning: 'Error during analysis.',
    };
  }
}

export async function runGrokAgent(asset: string, timeframe: string, data: any): Promise<AgentResult> {
  try {
    const response = await fetch('/api/grok-analyze', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ asset, timeframe, data })
    });
    
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    
    const result = await response.json();
    return {
      agentName: 'Grok',
      signal: result.signal || 'NEUTRAL',
      confidence: result.confidence || 50,
      reasoning: result.reasoning || 'No reasoning provided.',
      keyLevels: result.keyLevels
    };
  } catch (error) {
    console.error("Grok Agent Error:", error);
    return {
      agentName: 'Grok',
      signal: 'NEUTRAL',
      confidence: 0,
      reasoning: 'Error during analysis.',
    };
  }
}

export async function runEnsembleAnalysis(asset: string, timeframe: string, data: any): Promise<EnsembleResult> {
  const [gemini, claude, gpt4o, glm, grok] = await Promise.all([
    runGeminiAgent(asset, timeframe, data),
    runClaudeAgent(asset, timeframe, data),
    runGPT4oAgent(asset, timeframe, data),
    runGLMAgent(asset, timeframe, data),
    runGrokAgent(asset, timeframe, data)
  ]);

  const agents = [gemini, claude, gpt4o, glm, grok];
  
  let totalScore = 0;
  let totalWeight = 0;

  agents.forEach(agent => {
    if (agent.confidence > 0) {
      const weight = AGENT_WEIGHTS[agent.agentName as keyof typeof AGENT_WEIGHTS] || 0;
      const signalValue = agent.signal === 'BUY' ? 1 : agent.signal === 'SELL' ? -1 : 0;
      
      totalScore += signalValue * (agent.confidence / 100) * weight;
      totalWeight += weight;
    }
  });

  const normalizedScore = totalWeight > 0 ? totalScore / totalWeight : 0;
  
  let finalSignal: 'BUY' | 'SELL' | 'NEUTRAL' = 'NEUTRAL';
  if (normalizedScore > 0.2) finalSignal = 'BUY';
  else if (normalizedScore < -0.2) finalSignal = 'SELL';

  const consensusScore = Math.abs(normalizedScore) * 100;

  const tradingPlan = `Ensemble consensus is ${finalSignal} with ${(consensusScore || 0).toFixed(1)}% confidence. 
  Gemini suggests ${gemini.signal}, Claude suggests ${claude.signal}. 
  Consider entry around current levels with strict risk management.`;

  return {
    finalSignal,
    consensusScore,
    agents,
    tradingPlan
  };
}
