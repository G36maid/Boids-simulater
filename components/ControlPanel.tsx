import React from 'react';
import { SimulationConfig, InteractionMode } from '../types';
import { Settings, MousePointer2, Target, AlertCircle } from 'lucide-react';

interface ControlPanelProps {
  config: SimulationConfig;
  setConfig: React.Dispatch<React.SetStateAction<SimulationConfig>>;
  mode: InteractionMode;
  setMode: (mode: InteractionMode) => void;
}

const ControlPanel: React.FC<ControlPanelProps> = ({ config, setConfig, mode, setMode }) => {
  const handleChange = (key: keyof SimulationConfig, value: number | boolean) => {
    setConfig((prev) => ({ ...prev, [key]: value }));
  };

  return (
    <div className="absolute top-4 right-4 w-80 bg-slate-900/90 backdrop-blur-md border border-slate-700 rounded-xl p-5 text-slate-200 shadow-2xl z-10 max-h-[90vh] overflow-y-auto scrollbar-hide">
      <div className="flex items-center gap-2 mb-4 pb-2 border-b border-slate-700">
        <Settings className="w-5 h-5 text-cyan-400" />
        <h2 className="text-lg font-bold text-white">參數控制台</h2>
      </div>

      {/* Interaction Modes */}
      <div className="mb-6">
        <label className="text-xs font-semibold text-slate-400 uppercase mb-2 block">滑鼠互動模式</label>
        <div className="grid grid-cols-3 gap-2">
          <button
            onClick={() => setMode(InteractionMode.NONE)}
            className={`flex flex-col items-center justify-center p-2 rounded-lg border transition-all ${
              mode === InteractionMode.NONE
                ? 'bg-slate-700 border-cyan-500 text-cyan-400'
                : 'bg-slate-800 border-transparent hover:bg-slate-700 text-slate-400'
            }`}
          >
            <MousePointer2 className="w-5 h-5 mb-1" />
            <span className="text-[10px]">無</span>
          </button>
          <button
            onClick={() => setMode(InteractionMode.SEEK)}
            className={`flex flex-col items-center justify-center p-2 rounded-lg border transition-all ${
              mode === InteractionMode.SEEK
                ? 'bg-slate-700 border-emerald-500 text-emerald-400'
                : 'bg-slate-800 border-transparent hover:bg-slate-700 text-slate-400'
            }`}
          >
            <Target className="w-5 h-5 mb-1" />
            <span className="text-[10px]">引導 (RTS)</span>
          </button>
          <button
            onClick={() => setMode(InteractionMode.SCATTER)}
            className={`flex flex-col items-center justify-center p-2 rounded-lg border transition-all ${
              mode === InteractionMode.SCATTER
                ? 'bg-slate-700 border-rose-500 text-rose-400'
                : 'bg-slate-800 border-transparent hover:bg-slate-700 text-slate-400'
            }`}
          >
            <AlertCircle className="w-5 h-5 mb-1" />
            <span className="text-[10px]">驅散</span>
          </button>
        </div>
        <p className="text-xs text-slate-500 mt-2 italic">
          {mode === InteractionMode.SEEK && "點擊畫面設定目標點，魚群將會游向該處。"}
          {mode === InteractionMode.SCATTER && "滑鼠變成捕食者，魚群將會躲避。"}
          {mode === InteractionMode.NONE && "自由游動。"}
        </p>
      </div>

      {/* Sliders */}
      <div className="space-y-5">
        <div>
          <div className="flex justify-between mb-1">
            <label className="text-sm font-medium text-cyan-300">魚群數量 (Boids)</label>
            <span className="text-xs text-slate-400">{config.boidCount}</span>
          </div>
          <input
            type="range"
            min="10"
            max="400"
            step="10"
            value={config.boidCount}
            onChange={(e) => handleChange('boidCount', Number(e.target.value))}
            className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-cyan-500"
          />
        </div>

        <div>
          <div className="flex justify-between mb-1">
            <label className="text-sm font-medium">分離權重 (Separation)</label>
            <span className="text-xs text-slate-400">{config.separationWeight.toFixed(1)}</span>
          </div>
          <input
            type="range"
            min="0"
            max="5"
            step="0.1"
            value={config.separationWeight}
            onChange={(e) => handleChange('separationWeight', Number(e.target.value))}
            className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-cyan-500"
          />
          <p className="text-[10px] text-slate-500 mt-1">避免擁擠碰撞</p>
        </div>

        <div>
          <div className="flex justify-between mb-1">
            <label className="text-sm font-medium">對齊權重 (Alignment)</label>
            <span className="text-xs text-slate-400">{config.alignmentWeight.toFixed(1)}</span>
          </div>
          <input
            type="range"
            min="0"
            max="5"
            step="0.1"
            value={config.alignmentWeight}
            onChange={(e) => handleChange('alignmentWeight', Number(e.target.value))}
            className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-cyan-500"
          />
          <p className="text-[10px] text-slate-500 mt-1">跟隨鄰居方向</p>
        </div>

        <div>
          <div className="flex justify-between mb-1">
            <label className="text-sm font-medium">凝聚權重 (Cohesion)</label>
            <span className="text-xs text-slate-400">{config.cohesionWeight.toFixed(1)}</span>
          </div>
          <input
            type="range"
            min="0"
            max="5"
            step="0.1"
            value={config.cohesionWeight}
            onChange={(e) => handleChange('cohesionWeight', Number(e.target.value))}
            className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-cyan-500"
          />
          <p className="text-[10px] text-slate-500 mt-1">向群體中心靠近</p>
        </div>

         <div>
          <div className="flex justify-between mb-1">
            <label className="text-sm font-medium text-emerald-300">目標跟隨 (Seek Target)</label>
            <span className="text-xs text-slate-400">{config.targetWeight.toFixed(1)}</span>
          </div>
          <input
            type="range"
            min="0"
            max="5"
            step="0.1"
            value={config.targetWeight}
            onChange={(e) => handleChange('targetWeight', Number(e.target.value))}
            className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-emerald-500"
          />
        </div>

        <div className="pt-4 border-t border-slate-700">
          <div className="flex justify-between mb-1">
            <label className="text-sm font-medium">最大速度 (Max Speed)</label>
            <span className="text-xs text-slate-400">{config.maxSpeed.toFixed(1)}</span>
          </div>
          <input
            type="range"
            min="1"
            max="10"
            step="0.5"
            value={config.maxSpeed}
            onChange={(e) => handleChange('maxSpeed', Number(e.target.value))}
            className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-slate-400"
          />
        </div>

        <div>
          <div className="flex justify-between mb-1">
            <label className="text-sm font-medium">感知半徑 (Radius)</label>
            <span className="text-xs text-slate-400">{config.perceptionRadius}</span>
          </div>
          <input
            type="range"
            min="20"
            max="200"
            step="5"
            value={config.perceptionRadius}
            onChange={(e) => handleChange('perceptionRadius', Number(e.target.value))}
            className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-slate-400"
          />
        </div>

        <div className="flex items-center justify-between pt-2">
          <label className="text-sm font-medium">顯示感知範圍</label>
          <div 
            onClick={() => handleChange('showPerception', !config.showPerception)}
            className={`w-10 h-6 rounded-full cursor-pointer transition-colors relative ${config.showPerception ? 'bg-cyan-600' : 'bg-slate-700'}`}
          >
             <div className={`absolute top-1 left-1 bg-white w-4 h-4 rounded-full transition-transform ${config.showPerception ? 'translate-x-4' : ''}`} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ControlPanel;