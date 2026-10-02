import React from 'react';
import { 
  Activity, 
  AlertTriangle, 
  CheckCircle2, 
  Clock, 
  Gauge, 
  Layers, 
  Play, 
  Pause, 
  RotateCcw, 
  Settings, 
  Sliders, 
  TrendingUp, 
  FileText,
  Languages,
  Wrench,
  Plus
} from 'lucide-react';
import { LineKPIs, LineSettings, SimulationState, ViewMode, Language } from '../types/vsm';
import { formatTime } from '../utils/calculations';

interface HeaderProps {
  settings: LineSettings;
  kpis: LineKPIs;
  currentView: ViewMode;
  onViewChange: (view: ViewMode) => void;
  simulation: SimulationState;
  onToggleSimulation: () => void;
  onResetSimulation: () => void;
  onOpenSettings: () => void;
  onOpenReport: () => void;
  onAddNewStep?: () => void;
  language: Language;
  onToggleLanguage: () => void;
  activePreset: string;
  onSelectPreset: (presetKey: 'currentState' | 'balancedState' | 'highSpeedState') => void;
}

export const Header: React.FC<HeaderProps> = ({
  settings,
  kpis,
  currentView,
  onViewChange,
  simulation,
  onToggleSimulation,
  onResetSimulation,
  onOpenSettings,
  onOpenReport,
  onAddNewStep,
  language,
  onToggleLanguage,
  activePreset,
  onSelectPreset,
}) => {
  const isBottleneckCritical = kpis.bottleneckEffectiveCT > kpis.taktTime;
  const th = language === 'th';

  return (
    <header className="bg-slate-900 border-b border-slate-800 sticky top-0 z-40 shadow-xl">
      {/* Top Bar: Title & Global Actions */}
      <div className="max-w-7xl mx-auto px-4 py-2.5 flex flex-wrap items-center justify-between gap-3 border-b border-slate-800/80">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-700 flex items-center justify-center shadow-lg shadow-cyan-500/20 text-white font-bold">
            <Activity className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
                RefrigLine VSM
                <span className="text-xs px-2 py-0.5 rounded-full font-medium bg-cyan-950 text-cyan-400 border border-cyan-800/60">
                  Lean Optimizer
                </span>
              </h1>
              {isBottleneckCritical ? (
                <span className="flex items-center gap-1 text-xs px-2.5 py-0.5 rounded-full font-semibold bg-rose-950/80 text-rose-300 border border-rose-800/80 animate-pulse">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  {th ? 'คอขวดเกิน Takt Time!' : 'Bottleneck Exceeds TT!'}
                </span>
              ) : (
                <span className="flex items-center gap-1 text-xs px-2.5 py-0.5 rounded-full font-semibold bg-emerald-950/80 text-emerald-300 border border-emerald-800/80">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  {th ? 'สายการผลิตสมดุล (Paced)' : 'Line Balanced'}
                </span>
              )}
            </div>
            <p className="text-xs text-slate-400 truncate max-w-md">
              {th 
                ? 'แผนผัง Value Stream Mapping & คำนวณ Takt Time, Cycle Time, คอขวดสายผลิตตู้เย็น' 
                : 'Refrigeration Production Line VSM, Takt Time vs Cycle Time & Real-time Bottleneck'}
            </p>
          </div>
        </div>

        {/* Preset Selector & Quick Tools */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Quick Add Step Button */}
          {onAddNewStep && (
            <button
              onClick={onAddNewStep}
              className="flex items-center gap-1 text-xs px-3 py-1.5 rounded-lg font-bold bg-cyan-600 hover:bg-cyan-500 text-white shadow-md shadow-cyan-900/40 transition"
              title={th ? 'เพิ่มขั้นตอนใหม่ในสายการผลิต' : 'Add new workstation'}
            >
              <Plus className="w-3.5 h-3.5" />
              <span>{th ? 'เพิ่มขั้นตอน' : 'Add Step'}</span>
            </button>
          )}

          <div className="flex items-center bg-slate-950/80 p-0.5 rounded-lg border border-slate-800">
            <button
              onClick={() => onSelectPreset('currentState')}
              className={`text-xs px-2.5 py-1.5 rounded-md font-medium transition-all ${
                activePreset === 'currentState'
                  ? 'bg-rose-600/90 text-white shadow'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
              title={th ? 'สภาวะปัจจุบัน (คอขวดสูง)' : 'Current State (Bottlenecks)'}
            >
              {th ? '1. ปัจจุบัน' : '1. Current'}
            </button>
            <button
              onClick={() => onSelectPreset('balancedState')}
              className={`text-xs px-2.5 py-1.5 rounded-md font-medium transition-all ${
                activePreset === 'balancedState'
                  ? 'bg-emerald-600/90 text-white shadow'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
              title={th ? 'สภาวะอนาคต (สมดุล 60 UPH)' : 'Kaizen Balanced (60 UPH)'}
            >
              {th ? '2. สมดุล' : '2. Balanced'}
            </button>
            <button
              onClick={() => onSelectPreset('highSpeedState')}
              className={`text-xs px-2.5 py-1.5 rounded-md font-medium transition-all ${
                activePreset === 'highSpeedState'
                  ? 'bg-blue-600/90 text-white shadow'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
              title={th ? 'สายไฮสปีดอัตโนมัติ (75 UPH)' : 'High Speed (75 UPH)'}
            >
              {th ? '3. ไฮสปีด' : '3. High Speed'}
            </button>
          </div>

          {/* Target Settings Button */}
          <button
            onClick={onOpenSettings}
            className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg font-medium bg-slate-800 text-slate-200 hover:bg-slate-700 border border-slate-700 transition"
          >
            <Settings className="w-3.5 h-3.5 text-cyan-400" />
            <span>{th ? 'ตั้งเป้า UPH / กะ' : 'Target Settings'}</span>
          </button>

          {/* Export Report Button */}
          <button
            onClick={onOpenReport}
            className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg font-medium bg-slate-800 text-slate-200 hover:bg-slate-700 border border-slate-700 transition"
          >
            <FileText className="w-3.5 h-3.5 text-amber-400" />
            <span>{th ? 'รายงานสรุป' : 'Export Report'}</span>
          </button>

          {/* Language Toggle */}
          <button
            onClick={onToggleLanguage}
            className="flex items-center gap-1 text-xs px-2.5 py-1.5 rounded-lg font-semibold bg-slate-800 text-slate-300 hover:bg-slate-700 border border-slate-700 transition"
            title="Toggle Language (ภาษาไทย / English)"
          >
            <Languages className="w-3.5 h-3.5 text-indigo-400" />
            <span>{language.toUpperCase()}</span>
          </button>
        </div>
      </div>

      {/* Real-time KPI Ribbon */}
      <div className="bg-slate-950/60 border-b border-slate-800/80 px-4 py-2">
        <div className="max-w-7xl mx-auto grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2 text-xs">
          {/* Target UPH vs Max Achievable */}
          <div className="bg-slate-900/90 rounded-lg p-2 border border-slate-800/90 flex flex-col justify-between">
            <span className="text-slate-400 flex items-center justify-between font-medium">
              <span>{th ? 'เป้าหมาย vs ขีดจำกัด' : 'Target vs Capacity'}</span>
              <Gauge className="w-3.5 h-3.5 text-cyan-400" />
            </span>
            <div className="mt-1 flex items-baseline gap-1.5">
              <span className="text-base font-bold text-white">{kpis.targetUPH}</span>
              <span className="text-slate-400">/</span>
              <span className={`text-base font-bold ${kpis.maxAchievableUPH >= kpis.targetUPH ? 'text-emerald-400' : 'text-rose-400 font-extrabold'}`}>
                {kpis.maxAchievableUPH}
              </span>
              <span className="text-[10px] text-slate-400">UPH</span>
            </div>
            <div className="text-[10px] text-slate-400 mt-0.5 truncate">
              {kpis.uphGap >= 0 ? (
                <span className="text-emerald-400 font-medium">+{kpis.uphGap} UPH {th ? 'เกินเป้า' : 'surplus'}</span>
              ) : (
                <span className="text-rose-400 font-medium">{kpis.uphGap} UPH {th ? 'ตกเป้า!' : 'shortfall!'}</span>
              )}
            </div>
          </div>

          {/* Takt Time (TT) */}
          <div className="bg-slate-900/90 rounded-lg p-2 border border-slate-800/90 flex flex-col justify-between">
            <span className="text-slate-400 flex items-center justify-between font-medium">
              <span>Takt Time (TT)</span>
              <Clock className="w-3.5 h-3.5 text-blue-400" />
            </span>
            <div className="mt-1 flex items-baseline gap-1">
              <span className="text-base font-bold text-cyan-300">{kpis.taktTime}</span>
              <span className="text-[10px] text-slate-400">{th ? 'วินาที/เครื่อง' : 'sec/unit'}</span>
            </div>
            <div className="text-[10px] text-slate-400 truncate">
              {th ? 'ความเร็วตามความต้องการลูกค้า' : 'Demand pace required'}
            </div>
          </div>

          {/* Bottleneck Station & Cycle Time */}
          <div className={`rounded-lg p-2 border flex flex-col justify-between ${
            isBottleneckCritical
              ? 'bg-rose-950/40 border-rose-800/70 shadow-inner'
              : 'bg-slate-900/90 border-slate-800/90'
          }`}>
            <span className="text-slate-400 flex items-center justify-between font-medium">
              <span className={isBottleneckCritical ? 'text-rose-300 font-semibold' : ''}>
                {th ? 'จุดคอขวด (Bottleneck)' : 'Bottleneck Station'}
              </span>
              <AlertTriangle className={`w-3.5 h-3.5 ${isBottleneckCritical ? 'text-rose-400 animate-bounce' : 'text-amber-400'}`} />
            </span>
            <div className="mt-1 flex items-baseline gap-1">
              <span className={`text-base font-bold ${isBottleneckCritical ? 'text-rose-300' : 'text-amber-300'}`}>
                {kpis.bottleneckEffectiveCT}s
              </span>
              <span className="text-[10px] text-slate-400">
                (Op {kpis.bottleneckStep?.stepNumber})
              </span>
            </div>
            <div className="text-[10px] truncate text-slate-400">
              {kpis.bottleneckStep ? (th ? kpis.bottleneckStep.nameTh : kpis.bottleneckStep.name) : '-'}
            </div>
          </div>

          {/* Line Balance Efficiency (LBE) */}
          <div className="bg-slate-900/90 rounded-lg p-2 border border-slate-800/90 flex flex-col justify-between">
            <span className="text-slate-400 flex items-center justify-between font-medium">
              <span>{th ? 'สมดุลสายผลิต (LBE)' : 'Line Balance (LBE)'}</span>
              <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
            </span>
            <div className="mt-1 flex items-baseline gap-1">
              <span className={`text-base font-bold ${
                kpis.lineBalanceEfficiency >= 85 ? 'text-emerald-400' : kpis.lineBalanceEfficiency >= 70 ? 'text-amber-400' : 'text-rose-400'
              }`}>
                {kpis.lineBalanceEfficiency}%
              </span>
              <span className="text-[10px] text-slate-400">
                (Loss {kpis.balanceDelay}%)
              </span>
            </div>
            <div className="text-[10px] text-slate-400 truncate">
              {kpis.lineBalanceEfficiency >= 85 ? (th ? 'ดีเยี่ยม (Lean World-Class)' : 'World-Class') : (th ? 'สูญเสียความสมดุล' : 'Balance loss')}
            </div>
          </div>

          {/* Total Lead Time (PLT) & WIP */}
          <div className="bg-slate-900/90 rounded-lg p-2 border border-slate-800/90 flex flex-col justify-between">
            <span className="text-slate-400 flex items-center justify-between font-medium">
              <span>{th ? 'Lead Time รวม (PLT)' : 'Total Lead Time'}</span>
              <Layers className="w-3.5 h-3.5 text-indigo-400" />
            </span>
            <div className="mt-1 flex items-baseline gap-1">
              <span className="text-base font-bold text-indigo-300">
                {formatTime(kpis.totalLeadTimeSec)}
              </span>
              <span className="text-[10px] text-slate-400">
                ({kpis.totalLeadTimeDays}d)
              </span>
            </div>
            <div className="text-[10px] text-slate-400 truncate">
              WIP {kpis.totalWIP} {th ? 'เครื่องในระบบ' : 'units in buffers'}
            </div>
          </div>

          {/* Process Cycle Efficiency (PCE) & Operators */}
          <div className="bg-slate-900/90 rounded-lg p-2 border border-slate-800/90 flex flex-col justify-between">
            <span className="text-slate-400 flex items-center justify-between font-medium">
              <span>{th ? 'ประสิทธิภาพ VA (PCE)' : 'VA Efficiency (PCE)'}</span>
              <Activity className="w-3.5 h-3.5 text-teal-400" />
            </span>
            <div className="mt-1 flex items-baseline gap-1">
              <span className="text-base font-bold text-teal-300">
                {kpis.processCycleEfficiency}%
              </span>
              <span className="text-[10px] text-slate-400">
                ({kpis.totalOperators} OPs)
              </span>
            </div>
            <div className="text-[10px] text-slate-400 truncate">
              VA {kpis.totalValueAddedTime}s / NVA {kpis.totalNonValueAddedTime}s
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs & Simulation Bar */}
      <div className="max-w-7xl mx-auto px-4 py-2 flex flex-wrap items-center justify-between gap-3">
        {/* View Mode Tabs */}
        <nav className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800">
          <button
            onClick={() => onViewChange('vsm')}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              currentView === 'vsm'
                ? 'bg-cyan-600 text-white shadow-md shadow-cyan-600/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>{th ? '1. ผังกระบวนการ VSM' : '1. VSM Process Flow'}</span>
          </button>

          <button
            onClick={() => onViewChange('yamazumi')}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              currentView === 'yamazumi'
                ? 'bg-cyan-600 text-white shadow-md shadow-cyan-600/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
            }`}
          >
            <TrendingUp className="w-3.5 h-3.5" />
            <span>{th ? '2. กราฟ Yamazumi (CT vs TT)' : '2. Yamazumi Bar Chart'}</span>
          </button>

          <button
            onClick={() => onViewChange('bottleneck')}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              currentView === 'bottleneck'
                ? 'bg-rose-600 text-white shadow-md shadow-rose-600/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
            }`}
          >
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>{th ? '3. วิเคราะห์คอขวด (Bottleneck)' : '3. Bottleneck Analysis'}</span>
          </button>

          <button
            onClick={() => onViewChange('simulation')}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              currentView === 'simulation'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
            }`}
          >
            <Play className="w-3.5 h-3.5" />
            <span>{th ? '4. จำลองการไหล Real-Time' : '4. Live Simulation'}</span>
          </button>

          <button
            onClick={() => onViewChange('kaizen')}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              currentView === 'kaizen'
                ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
            }`}
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>{th ? '5. ไคเซ็นปรับปรุง' : '5. Kaizen'}</span>
          </button>

          <button
            onClick={() => onViewChange('manager')}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              currentView === 'manager'
                ? 'bg-amber-600 text-white shadow-md shadow-amber-600/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
            }`}
          >
            <Wrench className="w-3.5 h-3.5 text-amber-400" />
            <span>{th ? '6. จัดการข้อมูลขั้นตอนทั้งหมด' : '6. Process Manager'}</span>
          </button>
        </nav>

        {/* Live Simulation Controls */}
        <div className="flex items-center gap-2 bg-slate-950 px-3 py-1.5 rounded-xl border border-slate-800">
          <div className="flex items-center gap-1.5">
            <span className={`w-2 h-2 rounded-full ${simulation.isRunning ? 'bg-emerald-400 animate-ping' : 'bg-slate-500'}`} />
            <span className="text-xs font-medium text-slate-300">
              {th ? 'จำลองการไหล:' : 'Flow Sim:'}
            </span>
          </div>

          <button
            onClick={onToggleSimulation}
            className={`flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-lg font-bold transition ${
              simulation.isRunning
                ? 'bg-amber-600/90 text-white hover:bg-amber-500'
                : 'bg-emerald-600 text-white hover:bg-emerald-500 shadow-md shadow-emerald-600/30'
            }`}
          >
            {simulation.isRunning ? (
              <>
                <Pause className="w-3 h-3" />
                <span>{th ? 'หยุดชั่วคราว' : 'Pause'}</span>
              </>
            ) : (
              <>
                <Play className="w-3 h-3 fill-current" />
                <span>{th ? 'เริ่มจำลอง' : 'Run Live'}</span>
              </>
            )}
          </button>

          <button
            onClick={onResetSimulation}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
            title={th ? 'รีเซ็ตการจำลอง' : 'Reset Simulation'}
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>

          <div className="text-[11px] text-slate-400 pl-1 border-l border-slate-800">
            {th ? 'ผลิตแล้ว:' : 'Units:'} <span className="font-bold text-white">{simulation.totalProduced}</span>
          </div>
        </div>
      </div>
    </header>
  );
};
