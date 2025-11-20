import React, { useState } from 'react';
import GameCanvas from './components/GameCanvas';
import ControlPanel from './components/ControlPanel';
import { SimulationConfig, InteractionMode } from './types';
import { Info } from 'lucide-react';

const App: React.FC = () => {
  const [mode, setMode] = useState<InteractionMode>(InteractionMode.SEEK);
  const [config, setConfig] = useState<SimulationConfig>({
    boidCount: 150,
    perceptionRadius: 60,
    maxSpeed: 4,
    maxForce: 0.1,
    separationWeight: 2.0,
    alignmentWeight: 1.2,
    cohesionWeight: 1.0,
    targetWeight: 1.5,
    showPerception: false,
  });

  const [showIntro, setShowIntro] = useState(true);

  return (
    <div className="relative w-full h-screen bg-slate-900 overflow-hidden font-sans">
      {/* Main Canvas */}
      <div className="absolute inset-0 z-0">
        <GameCanvas config={config} mode={mode} />
      </div>

      {/* UI Overlay */}
      <ControlPanel 
        config={config} 
        setConfig={setConfig} 
        mode={mode} 
        setMode={setMode}
      />

      {/* HUD / Status */}
      <div className="absolute top-4 left-4 pointer-events-none">
        <h1 className="text-2xl font-bold text-white drop-shadow-lg tracking-wider opacity-80">
          BOIDS <span className="text-cyan-400 text-base font-light">SIMULATION</span>
        </h1>
        <p className="text-slate-400 text-xs mt-1 flex items-center gap-1">
          <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"/>
          System Normal
        </p>
      </div>

       {/* Intro Modal (Dismissible) */}
       {showIntro && (
        <div className="absolute bottom-4 left-4 z-50 bg-slate-800/90 border border-slate-600 p-4 rounded-lg max-w-md text-slate-200 shadow-xl backdrop-blur-sm animate-in fade-in slide-in-from-bottom-10">
          <div className="flex justify-between items-start mb-2">
            <h3 className="font-bold flex items-center gap-2 text-cyan-400">
              <Info size={18} />
              歡迎使用魚群模擬器
            </h3>
            <button 
              onClick={() => setShowIntro(false)}
              className="text-slate-400 hover:text-white text-sm"
            >
              ✕
            </button>
          </div>
          <p className="text-sm leading-relaxed text-slate-300">
            這是一個基於 Craig Reynolds 的 Boids 算法的模擬。
            您可以像 RTS 遊戲一樣控制魚群。
          </p>
          <ul className="text-xs mt-3 space-y-1 text-slate-400 list-disc list-inside">
            <li><strong className="text-emerald-400">引導模式 (RTS):</strong> 點擊或拖曳畫面設定目標點。</li>
            <li><strong className="text-rose-400">驅散模式:</strong> 滑鼠變成捕食者，驅趕魚群。</li>
            <li>使用右側面板調整演算法參數。</li>
          </ul>
        </div>
      )}
    </div>
  );
};

export default App;