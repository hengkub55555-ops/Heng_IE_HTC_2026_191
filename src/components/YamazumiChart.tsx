import React, { useState } from 'react';
import { 
  TrendingUp, 
  AlertTriangle, 
  CheckCircle2, 
  Sliders, 
  Plus, 
  Minus, 
  Sparkles, 
  HelpCircle,
  RefreshCw
} from 'lucide-react';
import { ProcessStep, LineSettings, LineKPIs, Language } from '../types/vsm';
import { getEffectiveCycleTime } from '../utils/calculations';

interface YamazumiChartProps {
  steps: ProcessStep[];
  settings: LineSettings;
  kpis: LineKPIs;
  language: Language;
  onUpdateStep: (updatedStep: ProcessStep) => void;
  onSelectStep: (step: ProcessStep) => void;
  onAutoBalance: () => void;
}

export const YamazumiChart: React.FC<YamazumiChartProps> = ({
  steps,
  settings,
  kpis,
  language,
  onUpdateStep,
  onSelectStep,
  onAutoBalance,
}) => {
  const [selectedStationId, setSelectedStationId] = useState<string>(steps[0]?.id || '');
  const th = language === 'th';

  const selectedStation = steps.find((s) => s.id === selectedStationId) || steps[0];
  const maxBarValue = Math.max(...steps.map((s) => getEffectiveCycleTime(s)), kpis.taktTime, 120);

  // Quick Action: Add/Remove parallel station
  const handleParallelChange = (step: ProcessStep, delta: number) => {
    const newCount = Math.max(1, Math.min(5, step.parallelStations + delta));
    onUpdateStep({
      ...step,
      parallelStations: newCount,
    });
  };

  // Quick Action: Trim NVA by percentage
  const handleCutNVA = (step: ProcessStep, percent: number) => {
    const reduction = Math.round(step.nonValueAddedTime * (percent / 100));
    const newNVA = Math.max(0, step.nonValueAddedTime - reduction);
    const newCT = step.valueAddedTime + newNVA;
    onUpdateStep({
      ...step,
      nonValueAddedTime: newNVA,
      cycleTime: newCT,
    });
  };

  return (
    <div className="space-y-6">
      {/* Top Summary Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-cyan-600/20 text-cyan-400 border border-cyan-500/30">
              <TrendingUp className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                {th ? 'แผนผัง Yamazumi & สมดุลสายการผลิต (Line Balancing Chart)' : 'Yamazumi Line Balancing Chart'}
                <span className="text-xs font-mono font-medium px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
                  Cycle Time (CT) vs Takt Time (TT)
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                {th 
                  ? 'วิเคราะห์เวลาการทำงานเทียบกับ Takt Time แยกสัดส่วน Value-Added (VA) และ Non-Value-Added (NVA)'
                  : 'Workstation loading breakdown comparing effective Cycle Time against customer Takt Time'}
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={onAutoBalance}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white shadow-lg shadow-emerald-900/40 transition"
          >
            <Sparkles className="w-4 h-4" />
            <span>{th ? 'ปรับสมดุลสายการผลิตอัตโนมัติ (Auto Balance)' : 'Auto Balance Line'}</span>
          </button>
        </div>
      </div>

      {/* Main Chart Area */}
      <div className="bg-slate-950 border border-slate-800 rounded-2xl p-6 shadow-2xl relative">
        {/* Legend */}
        <div className="flex flex-wrap items-center justify-between gap-3 mb-6 pb-4 border-b border-slate-800/80">
          <div className="flex items-center gap-4 text-xs">
            <div className="flex items-center gap-2">
              <div className="w-3.5 h-3.5 rounded bg-emerald-500 shadow-sm" />
              <span className="text-slate-300 font-medium">Value-Added (VA)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3.5 h-3.5 rounded bg-amber-500/90 shadow-sm" />
              <span className="text-slate-300 font-medium">Non-Value-Added (NVA) / ความสูญเปล่า</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-5 h-0.5 border-t-2 border-dashed border-rose-500" />
              <span className="text-rose-400 font-bold font-mono">Takt Time = {kpis.taktTime}s</span>
            </div>
          </div>

          <div className="flex items-center gap-3 text-xs font-mono">
            <span className="text-slate-400">
              LBE: <span className="text-emerald-400 font-bold">{kpis.lineBalanceEfficiency}%</span>
            </span>
            <span className="text-slate-400">
              Balance Loss: <span className="text-rose-400 font-bold">{kpis.balanceDelay}%</span>
            </span>
            <span className="text-slate-400">
              {th ? 'จำนวนสถานีขั้นต่ำตามทฤษฎี:' : 'Theoretical Min Stations:'}{' '}
              <span className="text-cyan-300 font-bold">
                {Math.ceil(kpis.totalEffectiveCT / kpis.taktTime)} {th ? 'สถานี' : 'stations'}
              </span>
            </span>
          </div>
        </div>

        {/* SVG / HTML Bar Chart Grid */}
        <div className="relative pt-6 pb-4 overflow-x-auto">
          {/* Takt Time Line overlay across the chart */}
          {(() => {
            const chartHeight = 320; // in px
            const taktLineBottom = (kpis.taktTime / maxBarValue) * chartHeight;
            return (
              <div 
                className="absolute left-10 right-4 z-20 pointer-events-none flex items-center"
                style={{ bottom: `${taktLineBottom + 64}px` }}
              >
                <div className="w-full border-t-2 border-dashed border-rose-500/90 relative">
                  <span className="absolute -top-3.5 right-0 text-[10px] font-mono font-bold bg-rose-950 text-rose-300 px-2 py-0.5 rounded border border-rose-800 shadow">
                    TAKT TIME ({kpis.taktTime}s)
                  </span>
                </div>
              </div>
            );
          })()}

          {/* Bar Columns Container */}
          <div className="flex items-end justify-between gap-3 min-w-[900px] h-[360px] pl-10 pr-4 pb-12 border-b border-l border-slate-800">
            {steps.map((step) => {
              const effCT = getEffectiveCycleTime(step);
              const isBottleneck = effCT > kpis.taktTime;
              const isSelected = selectedStation?.id === step.id;
              const chartHeight = 280; // px

              // Proportional heights
              const totalHeightPx = Math.max(16, (effCT / maxBarValue) * chartHeight);
              const vaFraction = step.valueAddedTime / Math.max(1, step.cycleTime);
              const vaHeightPx = totalHeightPx * vaFraction;
              const nvaHeightPx = totalHeightPx - vaHeightPx;

              return (
                <div 
                  key={step.id}
                  onClick={() => {
                    setSelectedStationId(step.id);
                    onSelectStep(step);
                  }}
                  className={`flex-1 flex flex-col items-center justify-end h-full group cursor-pointer transition-all ${
                    isSelected ? 'opacity-100' : 'hover:opacity-90'
                  }`}
                >
                  {/* Top Label (Total Eff CT) */}
                  <div className="mb-2 text-center">
                    <span className={`text-[11px] font-mono font-bold px-1.5 py-0.5 rounded ${
                      isBottleneck
                        ? 'bg-rose-950 text-rose-300 border border-rose-800 animate-pulse'
                        : isSelected
                        ? 'bg-cyan-950 text-cyan-300 border border-cyan-800'
                        : 'text-slate-300'
                    }`}>
                      {effCT}s
                    </span>
                    {step.parallelStations > 1 && (
                      <span className="block text-[9px] font-mono text-emerald-400">
                        x{step.parallelStations} jigs
                      </span>
                    )}
                  </div>

                  {/* Stacked Vertical Bar */}
                  <div 
                    className={`w-14 rounded-t-lg overflow-hidden flex flex-col justify-end transition-all relative ${
                      isSelected ? 'ring-2 ring-cyan-400 shadow-xl shadow-cyan-950' : ''
                    } ${
                      isBottleneck ? 'border-t-2 border-x-2 border-rose-500' : 'border border-slate-700/60'
                    }`}
                    style={{ height: `${totalHeightPx}px` }}
                  >
                    {/* NVA Segment (Top) */}
                    <div 
                      className="w-full bg-gradient-to-t from-amber-600 to-amber-500 flex items-center justify-center transition-all"
                      style={{ height: `${nvaHeightPx}px` }}
                      title={`NVA: ${(step.nonValueAddedTime / step.parallelStations).toFixed(1)}s`}
                    >
                      {nvaHeightPx > 18 && (
                        <span className="text-[9px] font-mono font-bold text-slate-950">
                          {(step.nonValueAddedTime / step.parallelStations).toFixed(0)}s
                        </span>
                      )}
                    </div>

                    {/* VA Segment (Bottom) */}
                    <div 
                      className="w-full bg-gradient-to-t from-emerald-600 to-emerald-400 flex items-center justify-center transition-all"
                      style={{ height: `${vaHeightPx}px` }}
                      title={`VA: ${(step.valueAddedTime / step.parallelStations).toFixed(1)}s`}
                    >
                      {vaHeightPx > 18 && (
                        <span className="text-[9px] font-mono font-bold text-slate-950">
                          {(step.valueAddedTime / step.parallelStations).toFixed(0)}s
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Bottom Label (Station Name & Number) */}
                  <div className="mt-3 text-center w-full">
                    <span className="text-[10px] font-mono font-bold text-cyan-400 block">
                      Op {step.stepNumber}
                    </span>
                    <span className="text-[10px] text-slate-400 block truncate max-w-[80px] mx-auto" title={th ? step.nameTh : step.name}>
                      {th ? step.nameTh : step.name}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Interactive Station Tuner & Balancing Controller */}
      {selectedStation && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-cyan-600/20 text-cyan-400 border border-cyan-500/30">
                <Sliders className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[10px] font-mono text-cyan-400 font-bold">
                  {th ? 'เครื่องมือปรับสมดุลสถานีงาน' : 'Workstation Balance Tuner'} • Op {selectedStation.stepNumber}
                </span>
                <h3 className="text-sm font-bold text-white">
                  {th ? selectedStation.nameTh : selectedStation.name}
                </h3>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {getEffectiveCycleTime(selectedStation) > kpis.taktTime ? (
                <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-950 text-rose-300 border border-rose-800 text-xs font-bold animate-pulse">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  <span>
                    {th ? 'เกิน Takt Time: ' : 'Exceeds Takt: '} 
                    +{(getEffectiveCycleTime(selectedStation) - kpis.taktTime).toFixed(1)}s
                  </span>
                </div>
              ) : (
                <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-800 text-xs font-semibold">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>{th ? 'เวลาผ่านเกณฑ์ Takt Time' : 'Within Takt Time'}</span>
                </div>
              )}
            </div>
          </div>

          {/* Quick Adjustment Controls */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
            {/* Parallel Stations / Jigs control */}
            <div className="bg-slate-950/80 p-3.5 rounded-xl border border-slate-800 space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-slate-300 font-semibold">
                  {th ? 'จำนวนจิ๊ก/เครื่องคู่ขนาน:' : 'Parallel Fixtures/Bays:'}
                </span>
                <span className="font-mono text-cyan-400 font-bold text-sm">
                  {selectedStation.parallelStations} {th ? 'สถานี' : 'stations'}
                </span>
              </div>
              <p className="text-[11px] text-slate-400">
                {th ? 'เพิ่มจิ๊กทำงานขนานกันเพื่อลดรอบเวลาสถานีลงทันที (เช่น จิ๊กฉีดโฟม 2 ตัว)' : 'Run identical fixtures in parallel to halve effective cycle time.'}
              </p>
              <div className="flex items-center gap-2 pt-1">
                <button
                  onClick={() => handleParallelChange(selectedStation, -1)}
                  disabled={selectedStation.parallelStations <= 1}
                  className="flex-1 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-white font-bold flex items-center justify-center gap-1 transition"
                >
                  <Minus className="w-3.5 h-3.5" />
                  <span>{th ? 'ลดสถานี (-1)' : '-1 Jig'}</span>
                </button>
                <button
                  onClick={() => handleParallelChange(selectedStation, 1)}
                  disabled={selectedStation.parallelStations >= 4}
                  className="flex-1 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 disabled:opacity-40 text-white font-bold flex items-center justify-center gap-1 transition shadow-lg shadow-cyan-900/40"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>{th ? 'เพิ่มสถานีคู่ขนาน (+1)' : '+1 Parallel'}</span>
                </button>
              </div>
            </div>

            {/* Reduce Non-Value Added (NVA) Kaizen */}
            <div className="bg-slate-950/80 p-3.5 rounded-xl border border-slate-800 space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-slate-300 font-semibold">
                  {th ? 'ตัดความสูญเปล่า (Trim NVA):' : 'Eliminate Waste (NVA):'}
                </span>
                <span className="font-mono text-amber-400 font-bold">
                  {selectedStation.nonValueAddedTime}s NVA
                </span>
              </div>
              <p className="text-[11px] text-slate-400">
                {th ? 'ปรับปรุง 5S, Quick Clamp, ลดการเดินหยิบชิ้นงาน, ปลอกสายไว' : 'Quick wins via ergonomics, pneumatic quick-clamps, pre-assembly.'}
              </p>
              <div className="flex items-center gap-2 pt-1">
                <button
                  onClick={() => handleCutNVA(selectedStation, 25)}
                  disabled={selectedStation.nonValueAddedTime <= 2}
                  className="flex-1 py-1.5 rounded-lg bg-amber-600/90 hover:bg-amber-500 disabled:opacity-40 text-white font-bold transition"
                >
                  {th ? 'ลด NVA 25%' : 'Trim 25%'}
                </button>
                <button
                  onClick={() => handleCutNVA(selectedStation, 50)}
                  disabled={selectedStation.nonValueAddedTime <= 2}
                  className="flex-1 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 disabled:opacity-40 text-slate-950 font-bold transition shadow-lg"
                >
                  {th ? 'ลด NVA 50%' : 'Trim 50%'}
                </button>
              </div>
            </div>

            {/* Manual Cycle Time Slider */}
            <div className="bg-slate-950/80 p-3.5 rounded-xl border border-slate-800 space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-slate-300 font-semibold">
                  {th ? 'ปรับเวลา Cycle Time รวม:' : 'Cycle Time Slider:'}
                </span>
                <span className="font-mono text-cyan-300 font-bold">
                  {selectedStation.cycleTime}s (Eff: {getEffectiveCycleTime(selectedStation)}s)
                </span>
              </div>
              <input
                type="range"
                min="20"
                max="140"
                step="1"
                value={selectedStation.cycleTime}
                onChange={(e) => {
                  const newTotal = Number(e.target.value);
                  const ratio = selectedStation.valueAddedTime / Math.max(1, selectedStation.cycleTime);
                  const newVA = Math.round(newTotal * ratio);
                  const newNVA = newTotal - newVA;
                  onUpdateStep({
                    ...selectedStation,
                    cycleTime: newTotal,
                    valueAddedTime: newVA,
                    nonValueAddedTime: newNVA,
                  });
                }}
                className="w-full accent-cyan-500 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-400">
                <span>20s</span>
                <span className="text-cyan-400 font-bold">Target TT: {kpis.taktTime}s</span>
                <span>140s</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
