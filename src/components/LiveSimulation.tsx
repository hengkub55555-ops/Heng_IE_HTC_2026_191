import React, { useState, useEffect } from 'react';
import { 
  Play, 
  Pause, 
  RotateCcw, 
  Activity, 
  AlertTriangle, 
  CheckCircle2, 
  Clock, 
  Gauge, 
  Sliders, 
  Layers, 
  TrendingUp,
  Cpu,
  Zap
} from 'lucide-react';
import { ProcessStep, LineSettings, LineKPIs, SimulationState, Language } from '../types/vsm';
import { getEffectiveCycleTime, formatTime } from '../utils/calculations';

interface LiveSimulationProps {
  steps: ProcessStep[];
  settings: LineSettings;
  kpis: LineKPIs;
  simulation: SimulationState;
  onToggleSimulation: () => void;
  onResetSimulation: () => void;
  onSpeedChange: (speed: number) => void;
  language: Language;
}

export const LiveSimulation: React.FC<LiveSimulationProps> = ({
  steps,
  settings,
  kpis,
  simulation,
  onToggleSimulation,
  onResetSimulation,
  onSpeedChange,
  language,
}) => {
  const th = language === 'th';
  const [stationTimers, setStationTimers] = useState<Record<string, number>>({});

  // Helper to get status color
  const getStatusBadge = (status: 'processing' | 'blocked' | 'starved' | 'idle') => {
    switch (status) {
      case 'processing':
        return {
          bg: 'bg-emerald-950/80 text-emerald-300 border-emerald-800',
          dot: 'bg-emerald-400 animate-ping',
          labelTh: 'กำลังแปรรูป',
          labelEn: 'Processing',
        };
      case 'blocked':
        return {
          bg: 'bg-rose-950/80 text-rose-300 border-rose-800',
          dot: 'bg-rose-500 animate-pulse',
          labelTh: 'ติดขัด (Blocked)',
          labelEn: 'Blocked',
        };
      case 'starved':
        return {
          bg: 'bg-amber-950/80 text-amber-300 border-amber-800',
          dot: 'bg-amber-400',
          labelTh: 'ขาดชิ้นงาน (Starved)',
          labelEn: 'Starved',
        };
      default:
        return {
          bg: 'bg-slate-800 text-slate-400 border-slate-700',
          dot: 'bg-slate-500',
          labelTh: 'รอรอบ',
          labelEn: 'Idle',
        };
    }
  };

  return (
    <div className="space-y-6">
      {/* Simulation Command Center Bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-indigo-600/20 text-indigo-400 border border-indigo-500/30">
              <Cpu className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                {th ? 'ระบบจำลองการไหลของสายการผลิตแบบ Real-Time' : 'Real-Time Production Flow Simulator'}
                <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full font-bold uppercase tracking-wider ${
                  simulation.isRunning ? 'bg-emerald-950 text-emerald-300 border border-emerald-800' : 'bg-slate-800 text-slate-400'
                }`}>
                  {simulation.isRunning ? 'LIVE RUNNING' : 'PAUSED'}
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                {th 
                  ? 'จำลองการเคลื่อนที่ของตู้เย็นบนสายพาน การสะสมของ WIP หน้าจุดคอขวด และสถานีที่ขาดชิ้นงาน (Starvation)' 
                  : 'Live discrete-event flow simulation demonstrating buffer buildup before bottlenecks & starved stations'}
              </p>
            </div>
          </div>
        </div>

        {/* Playback Controls & Speed Multipliers */}
        <div className="flex items-center gap-2.5 flex-wrap">
          <div className="flex items-center bg-slate-950 p-1 rounded-xl border border-slate-800">
            <span className="text-xs text-slate-400 px-2 font-mono">{th ? 'ความเร็ว:' : 'Speed:'}</span>
            {[1, 2, 5, 10].map((s) => (
              <button
                key={s}
                onClick={() => onSpeedChange(s)}
                className={`px-2.5 py-1 rounded-lg text-xs font-mono font-bold transition ${
                  simulation.speed === s
                    ? 'bg-indigo-600 text-white shadow'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {s}x
              </button>
            ))}
          </div>

          <button
            onClick={onToggleSimulation}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition shadow-lg ${
              simulation.isRunning
                ? 'bg-amber-600 hover:bg-amber-500 text-white shadow-amber-950/60'
                : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-950/60'
            }`}
          >
            {simulation.isRunning ? (
              <>
                <Pause className="w-4 h-4" />
                <span>{th ? 'หยุดชั่วคราว' : 'Pause'}</span>
              </>
            ) : (
              <>
                <Play className="w-4 h-4 fill-current" />
                <span>{th ? 'เริ่มจำลองการผลิต' : 'Start Simulation'}</span>
              </>
            )}
          </button>

          <button
            onClick={onResetSimulation}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700 transition border border-slate-700"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>{th ? 'รีเซ็ต' : 'Reset'}</span>
          </button>
        </div>
      </div>

      {/* Live Metrics Ticker Banner */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="bg-slate-950 border border-slate-800 p-3.5 rounded-xl shadow">
          <span className="text-slate-400 text-xs flex items-center justify-between">
            <span>{th ? 'ผลผลิตสะสม (Units Produced)' : 'Total Units Out'}</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          </span>
          <div className="mt-1 flex items-baseline gap-1.5">
            <span className="text-2xl font-bold font-mono text-white">
              {simulation.totalProduced}
            </span>
            <span className="text-xs text-slate-400">{th ? 'เครื่อง' : 'units'}</span>
          </div>
          <span className="text-[10px] text-slate-500">
            {th ? 'เวลาจำลองที่ผ่านไป: ' : 'Elapsed sim time: '} {formatTime(simulation.elapsedSeconds)}
          </span>
        </div>

        <div className="bg-slate-950 border border-slate-800 p-3.5 rounded-xl shadow">
          <span className="text-slate-400 text-xs flex items-center justify-between">
            <span>{th ? 'อัตราผลิตจริง (Actual Run UPH)' : 'Actual Pace (UPH)'}</span>
            <Gauge className="w-4 h-4 text-cyan-400" />
          </span>
          <div className="mt-1 flex items-baseline gap-1.5">
            <span className={`text-2xl font-bold font-mono ${
              simulation.currentActualUPH >= settings.targetUPH ? 'text-emerald-400' : 'text-rose-400'
            }`}>
              {simulation.currentActualUPH}
            </span>
            <span className="text-xs text-slate-400">/ {settings.targetUPH} UPH</span>
          </div>
          <span className="text-[10px] text-slate-400">
            {simulation.currentActualUPH >= settings.targetUPH 
              ? (th ? '✓ ทันตาม Takt Time' : 'On track with Takt') 
              : (th ? '⚠ ตกเป้าเนื่องจากคอขวด' : 'Lagging behind target')}
          </span>
        </div>

        <div className="bg-slate-950 border border-slate-800 p-3.5 rounded-xl shadow">
          <span className="text-slate-400 text-xs flex items-center justify-between">
            <span>{th ? 'จุดคอขวดที่แอคทีฟ (Active Bottleneck)' : 'Active Bottleneck'}</span>
            <AlertTriangle className="w-4 h-4 text-rose-400" />
          </span>
          <div className="mt-1 flex items-baseline gap-1.5">
            <span className="text-lg font-bold font-mono text-rose-300 truncate">
              {kpis.bottleneckStep ? `Op ${kpis.bottleneckStep.stepNumber}` : 'None'}
            </span>
            <span className="text-xs text-slate-400">({kpis.bottleneckEffectiveCT}s)</span>
          </div>
          <span className="text-[10px] text-slate-400 truncate block">
            {kpis.bottleneckStep ? (th ? kpis.bottleneckStep.nameTh : kpis.bottleneckStep.name) : '-'}
          </span>
        </div>

        <div className="bg-slate-950 border border-slate-800 p-3.5 rounded-xl shadow">
          <span className="text-slate-400 text-xs flex items-center justify-between">
            <span>{th ? 'WIP สะสมรวม (Total In-Line WIP)' : 'Total WIP in Line'}</span>
            <Layers className="w-4 h-4 text-indigo-400" />
          </span>
          <div className="mt-1 flex items-baseline gap-1.5">
            <span className="text-2xl font-bold font-mono text-indigo-300">
              {Object.values(simulation.wipBuffers).reduce((a, b) => a + b, 0)}
            </span>
            <span className="text-xs text-slate-400">{th ? 'เครื่อง' : 'units'}</span>
          </div>
          <span className="text-[10px] text-slate-500">
            Lead Time: {formatTime(Object.values(simulation.wipBuffers).reduce((a, b) => a + b, 0) * kpis.taktTime)}
          </span>
        </div>
      </div>

      {/* Visual Live Conveyor Line Display */}
      <div className="bg-slate-950 border border-slate-800 rounded-2xl p-6 shadow-2xl relative overflow-x-auto blueprint-grid">
        <div className="min-w-[1200px] space-y-8">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h3 className="text-xs font-bold text-slate-300 tracking-wider uppercase flex items-center gap-2">
              <Activity className="w-4 h-4 text-cyan-400" />
              <span>{th ? 'ภาพจำลองสถานะการไหลบนสายพานประกอบตู้เย็น (Assembly Conveyor Line)' : 'Assembly Line Conveyor Visualizer'}</span>
            </h3>
            <div className="flex items-center gap-4 text-xs font-mono">
              <span className="flex items-center gap-1.5 text-emerald-400">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                {th ? 'กำลังผลิต (Processing)' : 'Processing'}
              </span>
              <span className="flex items-center gap-1.5 text-rose-400">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
                {th ? 'ติดขัด (Blocked)' : 'Blocked'}
              </span>
              <span className="flex items-center gap-1.5 text-amber-400">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                {th ? 'ขาดชิ้นงาน (Starved)' : 'Starved'}
              </span>
            </div>
          </div>

          {/* Sequential Workstations with Conveyor Linkages & WIP Buffers */}
          <div className="grid grid-cols-5 gap-4">
            {steps.map((step, idx) => {
              const effCT = getEffectiveCycleTime(step);
              const isBottleneck = effCT > kpis.taktTime;
              const currentWIP = simulation.wipBuffers[step.id] ?? step.wipBefore;
              const status = simulation.stationStatus[step.id] || (isBottleneck ? 'processing' : 'idle');
              const badge = getStatusBadge(status);

              return (
                <div 
                  key={step.id} 
                  className={`bg-slate-900/90 border-2 rounded-xl p-3.5 flex flex-col justify-between shadow-lg relative transition-all ${
                    isBottleneck
                      ? 'border-rose-600/90 bg-rose-950/20'
                      : status === 'blocked'
                      ? 'border-rose-800/80'
                      : status === 'starved'
                      ? 'border-amber-800/80'
                      : 'border-slate-800 hover:border-slate-700'
                  }`}
                >
                  {/* Top Status Header */}
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-950 font-bold text-cyan-400">
                        Op {step.stepNumber}
                      </span>
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold border flex items-center gap-1.5 ${badge.bg}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${badge.dot}`} />
                        {th ? badge.labelTh : badge.labelEn}
                      </span>
                    </div>

                    <h4 className="text-xs font-bold text-white line-clamp-1" title={th ? step.nameTh : step.name}>
                      {th ? step.nameTh : step.name}
                    </h4>
                  </div>

                  {/* Visual Conveyor Machine Graphic */}
                  <div className="my-3 py-2 bg-slate-950 rounded-lg border border-slate-800/80 flex flex-col items-center justify-center relative overflow-hidden">
                    {/* Refrigerator Icon Box */}
                    <div className="flex items-center gap-2">
                      <div className={`w-10 h-14 rounded-md border-2 flex flex-col justify-between p-1 shadow-inner relative transition-transform ${
                        simulation.isRunning && status === 'processing' ? 'scale-105 shadow-cyan-500/20' : ''
                      } ${
                        isBottleneck 
                          ? 'bg-rose-950/60 border-rose-500 text-rose-300' 
                          : 'bg-cyan-950/40 border-cyan-500/70 text-cyan-300'
                      }`}>
                        {/* Upper freezer compartment line */}
                        <div className="w-full h-4 border-b border-dashed border-cyan-400/40 flex items-center justify-end px-0.5">
                          <span className="w-1 h-1 rounded-full bg-cyan-400" />
                        </div>
                        {/* Lower cooler compartment */}
                        <div className="w-full flex-1 flex items-center justify-end px-0.5">
                          <span className="w-1 h-2 rounded-sm bg-cyan-400" />
                        </div>
                      </div>

                      {/* Station details */}
                      <div className="text-[10px] font-mono space-y-0.5">
                        <div className="text-slate-400">
                          CT: <span className="font-bold text-white">{step.cycleTime}s</span>
                        </div>
                        <div className="text-slate-400">
                          Eff: <span className={isBottleneck ? 'text-rose-400 font-bold' : 'text-cyan-400'}>{effCT}s</span>
                        </div>
                        <div className="text-slate-500">
                          {step.parallelStations} {th ? 'จิ๊ก' : 'bays'}
                        </div>
                      </div>
                    </div>

                    {/* Progress Bar under machine */}
                    <div className="w-full px-2 mt-2">
                      <div className="h-1.5 w-full bg-slate-900 rounded-full overflow-hidden border border-slate-800">
                        <div 
                          className={`h-full transition-all duration-300 ${
                            isBottleneck ? 'bg-rose-500' : 'bg-cyan-500'
                          }`}
                          style={{
                            width: simulation.isRunning ? '75%' : '0%',
                            animation: simulation.isRunning ? 'pulse 1.5s infinite' : 'none',
                          }}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Buffer Counter before this station */}
                  <div className="bg-slate-950/80 p-2 rounded-lg border border-slate-800/80 flex items-center justify-between text-[11px] font-mono">
                    <span className="text-slate-400">{th ? 'คิวรอหน้าสถานี (WIP):' : 'Queue Buffer:'}</span>
                    <span className={`font-bold px-1.5 py-0.5 rounded ${
                      currentWIP > 20
                        ? 'bg-rose-950 text-rose-300 border border-rose-800 animate-pulse'
                        : 'text-amber-300'
                    }`}>
                      {currentWIP} {th ? 'เครื่อง' : 'units'}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
