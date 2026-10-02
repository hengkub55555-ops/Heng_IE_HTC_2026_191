import React, { useState } from 'react';
import { 
  Building2, 
  Truck, 
  Cpu, 
  ArrowRight, 
  Zap, 
  AlertTriangle, 
  CheckCircle2, 
  Sparkles, 
  Users, 
  Layers, 
  Clock, 
  Check, 
  Info,
  Maximize2
} from 'lucide-react';
import { ProcessStep, LineSettings, LineKPIs, Language } from '../types/vsm';
import { getEffectiveCycleTime, formatTime, formatLeadTime } from '../utils/calculations';

interface VSMCanvasProps {
  steps: ProcessStep[];
  settings: LineSettings;
  kpis: LineKPIs;
  language: Language;
  onSelectStep: (step: ProcessStep) => void;
  selectedStepId: string | null;
  onApplyKaizen: (stepId: string, kaizenId: string) => void;
  onAddNewStep?: () => void;
}

export const VSMCanvas: React.FC<VSMCanvasProps> = ({
  steps,
  settings,
  kpis,
  language,
  onSelectStep,
  selectedStepId,
  onApplyKaizen,
  onAddNewStep,
}) => {
  const [activeKaizenModal, setActiveKaizenModal] = useState<{ step: ProcessStep; kaizen: any } | null>(null);
  const [highlightBottlenecksOnly, setHighlightBottlenecksOnly] = useState(false);
  const th = language === 'th';

  return (
    <div className="space-y-4">
      {/* VSM Toolbar / Guide */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-900/90 border border-slate-800 p-3 rounded-xl">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 text-xs text-slate-300">
            <span className="w-3 h-3 rounded-full bg-rose-500 inline-block animate-ping" />
            <span className="font-semibold text-rose-300">{th ? 'คอขวด (Eff CT > Takt Time)' : 'Bottleneck (Eff CT > TT)'}</span>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-slate-300">
            <span className="w-3 h-3 rounded-full bg-amber-400 inline-block" />
            <span className="text-amber-300">{th ? 'ใกล้เต็มขีดจำกัด (90-100% TT)' : 'Near Constraint (90-100%)'}</span>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-slate-300">
            <span className="w-3 h-3 rounded-full bg-emerald-400 inline-block" />
            <span className="text-emerald-300">{th ? 'ความเร็วตามเป้า (On Pace)' : 'Balanced'}</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {onAddNewStep && (
            <button
              onClick={onAddNewStep}
              className="text-xs px-3 py-1.5 rounded-lg font-bold bg-cyan-600 hover:bg-cyan-500 text-white shadow-md shadow-cyan-900/40 transition flex items-center gap-1"
            >
              <span>+</span>
              <span>{th ? 'เพิ่มขั้นตอนใหม่' : 'Add Station'}</span>
            </button>
          )}

          <button
            onClick={() => setHighlightBottlenecksOnly(!highlightBottlenecksOnly)}
            className={`text-xs px-3 py-1.5 rounded-lg font-semibold transition border ${
              highlightBottlenecksOnly
                ? 'bg-rose-600/90 text-white border-rose-500 shadow-md shadow-rose-900/50'
                : 'bg-slate-800 text-slate-300 border-slate-700 hover:text-white'
            }`}
          >
            {highlightBottlenecksOnly ? (th ? '✓ ไฮไลท์เฉพาะจุดคอขวด' : 'Highlighting Bottlenecks') : (th ? 'เน้นจุดคอขวด' : 'Highlight Bottlenecks')}
          </button>
          <span className="text-xs text-cyan-400/90 font-medium hidden sm:inline">
            {th ? '*คลิกที่กล่องเพื่อแก้ไขข้อมูล/เวลา/พารามิเตอร์' : '*Click station card to edit parameters'}
          </span>
        </div>
      </div>

      {/* Main VSM Canvas Container */}
      <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 blueprint-grid shadow-2xl overflow-x-auto min-h-[720px] relative">
        <div className="min-w-[1550px] space-y-6">

          {/* ================= TIER 1: SUPPLIERS, PRODUCTION CONTROL & CUSTOMERS ================= */}
          <div className="grid grid-cols-12 gap-4 items-center">
            
            {/* SUPPLIERS BOX */}
            <div className="col-span-3 bg-slate-900/90 border-2 border-slate-700 rounded-xl p-3.5 shadow-lg relative">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2 mb-2">
                <div className="flex items-center gap-2 text-cyan-400 font-bold text-xs">
                  <Building2 className="w-4 h-4" />
                  <span>{th ? 'ซัพพลายเออร์วัตถุดิบ (Suppliers)' : 'Material Suppliers'}</span>
                </div>
                <Truck className="w-4 h-4 text-slate-400" />
              </div>
              <ul className="text-[11px] text-slate-300 space-y-1">
                <li className="flex justify-between">
                  <span className="text-slate-400">• Steel Coils & HIPS Liner:</span>
                  <span className="font-mono text-cyan-300">รายสัปดาห์ (Weekly)</span>
                </li>
                <li className="flex justify-between">
                  <span className="text-slate-400">• PU Polyol & Isocyanate:</span>
                  <span className="font-mono text-cyan-300">ISO Tank (Bi-weekly)</span>
                </li>
                <li className="flex justify-between">
                  <span className="text-slate-400">• Refrigerant Gas R600a:</span>
                  <span className="font-mono text-cyan-300">Cylinder (Weekly)</span>
                </li>
                <li className="flex justify-between">
                  <span className="text-slate-400">• Compressors & Tubing:</span>
                  <span className="font-mono text-cyan-300">Daily Milk-run JIT</span>
                </li>
              </ul>
            </div>

            {/* ELECTRONIC INFO FLOW: SUPPLIERS <--> PRODUCTION CONTROL */}
            <div className="col-span-1 flex flex-col items-center justify-center text-indigo-400">
              <div className="flex items-center gap-1 text-[10px] font-mono text-slate-400 bg-slate-900/90 px-2 py-0.5 rounded border border-slate-800">
                <Zap className="w-3 h-3 text-indigo-400 fill-indigo-400" />
                <span>EDI / ERP</span>
              </div>
              <div className="w-full flex items-center justify-center my-1">
                <div className="h-[2px] w-full bg-gradient-to-r from-slate-700 via-indigo-500 to-slate-700" />
              </div>
              <span className="text-[9px] text-slate-400 text-center">30-day Forecast</span>
            </div>

            {/* PRODUCTION CONTROL (ERP / MRP / LINE DISPATCH) */}
            <div className="col-span-4 bg-gradient-to-b from-indigo-950/80 to-slate-900/90 border-2 border-indigo-700/80 rounded-xl p-3.5 shadow-xl relative text-center">
              <div className="flex items-center justify-center gap-2 text-indigo-300 font-bold text-xs mb-1">
                <Cpu className="w-4 h-4" />
                <span>{th ? 'ศูนย์ควบคุมการผลิต (Production Control / MES)' : 'Production Planning & Control (MES)'}</span>
              </div>
              <p className="text-[11px] text-slate-300">
                SAP ERP / MES Line Dispatching System
              </p>
              <div className="mt-2 grid grid-cols-3 gap-2 text-[10px] font-mono">
                <div className="bg-slate-950/80 p-1.5 rounded border border-slate-800">
                  <span className="text-slate-400 block">{th ? 'เป้า UPH' : 'Target UPH'}</span>
                  <span className="text-cyan-400 font-bold">{settings.targetUPH} UPH</span>
                </div>
                <div className="bg-slate-950/80 p-1.5 rounded border border-slate-800">
                  <span className="text-slate-400 block">Takt Time (TT)</span>
                  <span className="text-blue-400 font-bold">{kpis.taktTime}s</span>
                </div>
                <div className="bg-slate-950/80 p-1.5 rounded border border-slate-800">
                  <span className="text-slate-400 block">{th ? 'ใบสั่งผลิต' : 'Daily Pace'}</span>
                  <span className="text-emerald-400 font-bold">{settings.shiftsPerDay} กะ/วัน</span>
                </div>
              </div>
            </div>

            {/* ELECTRONIC INFO FLOW: PRODUCTION CONTROL <--> CUSTOMER */}
            <div className="col-span-1 flex flex-col items-center justify-center text-cyan-400">
              <div className="flex items-center gap-1 text-[10px] font-mono text-slate-400 bg-slate-900/90 px-2 py-0.5 rounded border border-slate-800">
                <Zap className="w-3 h-3 text-cyan-400 fill-cyan-400" />
                <span>EDI Orders</span>
              </div>
              <div className="w-full flex items-center justify-center my-1">
                <div className="h-[2px] w-full bg-gradient-to-r from-slate-700 via-cyan-500 to-slate-700" />
              </div>
              <span className="text-[9px] text-slate-400 text-center">Daily Orders</span>
            </div>

            {/* CUSTOMER / MARKET DEMAND BOX */}
            <div className="col-span-3 bg-slate-900/90 border-2 border-slate-700 rounded-xl p-3.5 shadow-lg">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2 mb-2">
                <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs">
                  <Building2 className="w-4 h-4" />
                  <span>{th ? 'ลูกค้า & ศูนย์กระจายสินค้า (Customer)' : 'Distribution & Retail Customers'}</span>
                </div>
                <Truck className="w-4 h-4 text-emerald-400" />
              </div>
              <ul className="text-[11px] text-slate-300 space-y-1">
                <li className="flex justify-between">
                  <span className="text-slate-400">• Demand:</span>
                  <span className="font-mono text-emerald-400 font-bold">~900 {th ? 'เครื่อง/วัน' : 'units/day'}</span>
                </li>
                <li className="flex justify-between">
                  <span className="text-slate-400">• Target Takt Pace:</span>
                  <span className="font-mono text-cyan-300 font-bold">{kpis.taktTime} วินาที/เครื่อง</span>
                </li>
                <li className="flex justify-between">
                  <span className="text-slate-400">• Delivery:</span>
                  <span className="font-mono text-slate-300">Daily Truckloads (3x/day)</span>
                </li>
              </ul>
            </div>

          </div>

          {/* INFORMATION DISPATCH LINES (From Planning down to Stations) */}
          <div className="relative py-1">
            <div className="h-0.5 w-full bg-gradient-to-r from-transparent via-indigo-500/50 to-transparent" />
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <span className="bg-slate-900 text-indigo-300 border border-indigo-700/60 text-[10px] px-3 py-0.5 rounded-full font-mono flex items-center gap-1.5 shadow">
                <ArrowRight className="w-3 h-3" />
                {th ? 'ตารางจ่ายงานอิเล็กทรอนิกส์ & ลำดับการประกอบรายวัน (Electronic Daily Dispatch / Kanban Pull)' : 'Electronic Daily Sequence Dispatch & Electronic Kanban Pull'}
              </span>
            </div>
          </div>

          {/* ================= TIER 2: MATERIAL FLOW & PROCESS BOXES ================= */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-slate-300 tracking-wider uppercase flex items-center gap-2">
                <Layers className="w-4 h-4 text-cyan-400" />
                <span>{th ? 'สายการผลิตตู้เย็น (Refrigeration Assembly Process Flow)' : 'Refrigeration Assembly Process Stream'}</span>
              </h3>
              <div className="text-[11px] text-slate-400 font-mono">
                Takt Time Baseline = <span className="text-cyan-400 font-bold">{kpis.taktTime}s</span>
              </div>
            </div>

            {/* Horizontal Process Stations Sequence */}
            <div className="flex items-stretch gap-2.5 pb-2">
              {steps.map((step, index) => {
                const effCT = getEffectiveCycleTime(step);
                const isBottleneck = effCT > kpis.taktTime;
                const isNearConstraint = !isBottleneck && effCT >= kpis.taktTime * 0.9;
                const isSelected = selectedStepId === step.id;
                const hasKaizen = step.kaizenBursts.length > 0;
                const isDimmed = highlightBottlenecksOnly && !isBottleneck;

                return (
                  <React.Fragment key={step.id}>
                    {/* INVENTORY BUFFER TRIANGLE (WIP before station) */}
                    <div className="flex flex-col items-center justify-center shrink-0 w-14">
                      {index > 0 && (
                        <div 
                          className={`flex flex-col items-center group transition-all ${
                            step.wipBefore > (step.wipMaxLimit || 25)
                              ? 'scale-105'
                              : ''
                          }`}
                        >
                          {/* Lean Yellow Inverted Triangle */}
                          <div 
                            className={`w-10 h-9 flex flex-col items-center justify-center relative cursor-help transition-all ${
                              step.wipBefore > (step.wipMaxLimit || 25)
                                ? 'bg-rose-950/80 border-2 border-rose-500 text-rose-300 shadow-lg shadow-rose-900/50 animate-pulse'
                                : 'bg-amber-950/60 border border-amber-500/70 text-amber-300'
                            }`}
                            style={{ clipPath: 'polygon(50% 100%, 0 0, 100% 0)' }}
                            title={`${th ? 'WIP ก่อนสถานี:' : 'WIP Buffer:'} ${step.wipBefore} ${th ? 'เครื่อง' : 'units'}`}
                          >
                            <span className="text-[11px] font-mono font-bold pt-0.5">
                              {step.wipBefore}
                            </span>
                          </div>

                          <span className="text-[9px] font-mono text-slate-400 mt-1 whitespace-nowrap">
                            WIP {step.wipBefore}
                          </span>
                          <span className="text-[8px] font-mono text-slate-500 whitespace-nowrap">
                            {formatTime(step.wipBefore * kpis.taktTime)}
                          </span>

                          {/* Lean Material Arrow */}
                          <div className="mt-1 flex items-center text-slate-600 group-hover:text-cyan-400 transition">
                            <ArrowRight className="w-3.5 h-3.5" />
                          </div>
                        </div>
                      )}
                    </div>

                    {/* PROCESS WORKSTATION BOX */}
                    <div 
                      onClick={() => onSelectStep(step)}
                      className={`relative shrink-0 w-44 rounded-xl border-2 transition-all cursor-pointer flex flex-col justify-between shadow-xl ${
                        isSelected
                          ? 'ring-2 ring-cyan-400 scale-[1.02]'
                          : ''
                      } ${
                        isBottleneck
                          ? 'bg-gradient-to-b from-rose-950/70 via-slate-900 to-slate-950 border-rose-600 shadow-rose-950/60'
                          : isNearConstraint
                          ? 'bg-gradient-to-b from-amber-950/50 via-slate-900 to-slate-950 border-amber-600/80'
                          : 'bg-slate-900/90 border-slate-700/80 hover:border-slate-500'
                      } ${isDimmed ? 'opacity-35 hover:opacity-90' : 'opacity-100'}`}
                    >
                      {/* Kaizen Burst Badge pinned to the top right */}
                      {hasKaizen && (
                        <div className="absolute -top-3.5 -right-3 z-20">
                          {step.kaizenBursts.map((kaizen) => (
                            <button
                              key={kaizen.id}
                              onClick={(e) => {
                                e.stopPropagation();
                                setActiveKaizenModal({ step, kaizen });
                              }}
                              className={`p-1.5 rounded-full flex items-center justify-center shadow-lg transition-transform hover:scale-125 ${
                                kaizen.implemented
                                  ? 'bg-emerald-600 text-white ring-2 ring-emerald-400'
                                  : 'bg-amber-500 text-slate-950 ring-2 ring-yellow-300 animate-pulse'
                              }`}
                              title={kaizen.implemented ? 'Kaizen Implemented!' : `Kaizen Burst: ${th ? kaizen.titleTh : kaizen.title}`}
                            >
                              <Sparkles className="w-3.5 h-3.5" />
                            </button>
                          ))}
                        </div>
                      )}

                      {/* Header of the Station */}
                      <div className="p-2 border-b border-slate-800 bg-slate-950/50 rounded-t-xl">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-800 text-cyan-400 font-bold">
                            Op {step.stepNumber}
                          </span>
                          {isBottleneck ? (
                            <span className="flex items-center gap-0.5 text-[9px] font-bold text-rose-400 bg-rose-950 px-1.5 py-0.5 rounded border border-rose-800">
                              <AlertTriangle className="w-2.5 h-2.5" />
                              คอขวด (+{(effCT - kpis.taktTime).toFixed(1)}s)
                            </span>
                          ) : isNearConstraint ? (
                            <span className="text-[9px] font-bold text-amber-400 bg-amber-950 px-1 py-0.5 rounded border border-amber-800">
                              แน่น 90%
                            </span>
                          ) : (
                            <span className="flex items-center gap-0.5 text-[9px] font-bold text-emerald-400">
                              <CheckCircle2 className="w-2.5 h-2.5" />
                              OK
                            </span>
                          )}
                        </div>

                        <h4 className="text-xs font-bold text-white mt-1 leading-snug line-clamp-2" title={th ? step.nameTh : step.name}>
                          {th ? step.nameTh : step.name}
                        </h4>
                      </div>

                      {/* Station Parameters Data Box (Standard Lean VSM Form) */}
                      <div className="p-2 space-y-1 text-[11px] font-mono">
                        <div className="flex justify-between items-center bg-slate-950/60 p-1 rounded border border-slate-800/80">
                          <span className="text-slate-400">Cycle Time:</span>
                          <div className="text-right">
                            <span className={`font-bold ${isBottleneck ? 'text-rose-400 text-xs' : 'text-cyan-300'}`}>
                              {step.cycleTime}s
                            </span>
                            {step.parallelStations > 1 && (
                              <span className="text-[10px] text-emerald-400 block font-normal">
                                eff: {effCT}s ({step.parallelStations} จิ๊ก)
                              </span>
                            )}
                          </div>
                        </div>

                        <div className="flex justify-between text-slate-400 text-[10px]">
                          <span>VA / NVA:</span>
                          <span className="text-slate-200">
                            <span className="text-emerald-400">{step.valueAddedTime}s</span> / <span className="text-amber-400">{step.nonValueAddedTime}s</span>
                          </span>
                        </div>

                        <div className="flex justify-between text-slate-400 text-[10px]">
                          <span>Uptime / C/O:</span>
                          <span className="text-slate-200">
                            {step.uptime}% / {step.changeoverTime}m
                          </span>
                        </div>

                        <div className="flex justify-between text-slate-400 text-[10px] border-t border-slate-800/60 pt-1">
                          <span className="flex items-center gap-1">
                            <Users className="w-3 h-3 text-indigo-400" />
                            {step.operators} คน
                          </span>
                          <span className="text-slate-400">
                            Scrap: <span className={step.scrapRate > 1 ? 'text-rose-400 font-bold' : 'text-slate-300'}>{step.scrapRate}%</span>
                          </span>
                        </div>
                      </div>

                      {/* Edit Badge / Click hint */}
                      <div className="px-2 pb-1.5 pt-0.5 flex items-center justify-between text-[10px] text-cyan-400/80 font-sans border-t border-slate-800/40">
                        <span className="flex items-center gap-1 group-hover:text-cyan-300">
                          <span>✏️</span> {th ? 'คลิกเพื่อแก้ไขข้อมูล' : 'Click to edit'}
                        </span>
                        <span className="font-mono text-slate-400">
                          WIP:{step.wipBefore}
                        </span>
                      </div>

                      {/* Quick Bottom Indicator Bar */}
                      <div className="h-1.5 w-full rounded-b-xl overflow-hidden bg-slate-950">
                        <div 
                          className={`h-full ${
                            isBottleneck ? 'bg-rose-500' : isNearConstraint ? 'bg-amber-400' : 'bg-emerald-500'
                          }`}
                          style={{ width: `${Math.min(100, (effCT / kpis.taktTime) * 100)}%` }}
                        />
                      </div>
                    </div>
                  </React.Fragment>
                );
              })}

              {/* End of line Add Step Button Card */}
              {onAddNewStep && (
                <div 
                  onClick={onAddNewStep}
                  className="shrink-0 w-36 rounded-xl border-2 border-dashed border-slate-700 hover:border-cyan-500/80 bg-slate-900/40 hover:bg-slate-900/80 cursor-pointer flex flex-col items-center justify-center p-4 transition-all group text-center self-stretch"
                >
                  <div className="w-9 h-9 rounded-full bg-slate-800 group-hover:bg-cyan-600/30 text-slate-400 group-hover:text-cyan-300 flex items-center justify-center mb-2 transition">
                    <span className="text-lg font-bold">+</span>
                  </div>
                  <span className="text-xs font-bold text-slate-300 group-hover:text-white transition">
                    {th ? 'เพิ่มขั้นตอน' : 'Add Station'}
                  </span>
                  <span className="text-[10px] text-slate-500 mt-1">
                    {th ? 'ต่อท้ายสายผลิต' : 'Append to line'}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* ================= TIER 3: LEADER-BOARD TIMELINE LADDER (LEAD TIME LADDER) ================= */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-3.5 shadow-lg mt-4">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-2 mb-2">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-cyan-400" />
                <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                  {th ? 'เส้นเวลาการไหลและเวลารอคอย (Lead Time Timeline Ladder)' : 'Production Lead Time Timeline Ladder'}
                </h4>
              </div>
              <div className="flex items-center gap-4 text-xs font-mono">
                <div>
                  <span className="text-slate-400">{th ? 'เวลารอใน WIP (Inventory LT): ' : 'Inventory Lead Time: '}</span>
                  <span className="text-amber-400 font-bold">{formatLeadTime(kpis.totalWIP * kpis.taktTime, settings)}</span>
                </div>
                <div>
                  <span className="text-slate-400">{th ? 'เวลาแปรรูปจริง (Process Time): ' : 'Processing Time: '}</span>
                  <span className="text-emerald-400 font-bold">{kpis.totalValueAddedTime}s</span>
                </div>
                <div>
                  <span className="text-slate-400">{th ? 'Lead Time รวม (PLT): ' : 'Total Lead Time (PLT): '}</span>
                  <span className="text-cyan-300 font-bold">{formatLeadTime(kpis.totalLeadTimeSec, settings)}</span>
                </div>
                <div className="bg-slate-950 px-2 py-0.5 rounded border border-slate-800">
                  <span className="text-slate-400">PCE: </span>
                  <span className="text-teal-400 font-bold">{kpis.processCycleEfficiency}%</span>
                </div>
              </div>
            </div>

            {/* Stepped Timeline Wave */}
            <div className="overflow-x-auto py-2">
              <div className="flex items-center text-[10px] font-mono text-slate-400">
                {steps.map((step, idx) => {
                  const invTime = step.wipBefore * kpis.taktTime;
                  return (
                    <div key={`ladder-${step.id}`} className="shrink-0 w-[148px] flex flex-col">
                      {/* Top Step: Inventory Waiting Time */}
                      <div className="border-t-2 border-amber-400/80 bg-amber-950/20 px-1 py-1 text-center text-amber-300 font-semibold truncate">
                        {idx === 0 ? 'Raw Mat' : `${step.wipBefore}u = ${formatTime(invTime)}`}
                      </div>
                      {/* Vertical line connection */}
                      <div className="w-full flex justify-end">
                        <div className="h-4 w-0.5 bg-slate-700" />
                      </div>
                      {/* Bottom Step: Value Added Cycle Time */}
                      <div className="border-b-2 border-emerald-400 bg-emerald-950/20 px-1 py-1 text-center text-emerald-300 font-bold truncate">
                        VA: {step.valueAddedTime}s
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* Kaizen Burst Detail Modal */}
      {activeKaizenModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-lg w-full p-5 shadow-2xl space-y-4">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/40">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[10px] font-mono uppercase tracking-wider text-amber-400 font-bold">
                    Kaizen Burst Action • Op {activeKaizenModal.step.stepNumber}
                  </span>
                  <h3 className="text-base font-bold text-white">
                    {th ? activeKaizenModal.kaizen.titleTh : activeKaizenModal.kaizen.title}
                  </h3>
                </div>
              </div>
              <button
                onClick={() => setActiveKaizenModal(null)}
                className="text-slate-400 hover:text-white p-1"
              >
                ✕
              </button>
            </div>

            <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-400">{th ? 'ประเภทความสูญเปล่า (7 Wastes):' : 'Waste Category:'}</span>
                <span className="font-semibold text-rose-400">
                  {th ? activeKaizenModal.kaizen.wasteTypeTh : activeKaizenModal.kaizen.wasteType}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">{th ? 'ศักยภาพการลดเวลา (Potential CT Reduction):' : 'Potential Reduction:'}</span>
                <span className="font-bold text-emerald-400">
                  -{activeKaizenModal.kaizen.potentialReductionSec} วินาที/เครื่อง
                </span>
              </div>
              {activeKaizenModal.kaizen.potentialCostThb && (
                <div className="flex justify-between">
                  <span className="text-slate-400">{th ? 'งบประมาณดำเนินการโดยประมาณ:' : 'Estimated Cost:'}</span>
                  <span className="font-mono text-cyan-300">
                    ฿{activeKaizenModal.kaizen.potentialCostThb.toLocaleString()} THB
                  </span>
                </div>
              )}
            </div>

            <div>
              <h4 className="text-xs font-semibold text-slate-300 mb-1">
                {th ? 'แนวทางการปรับปรุงเชิงวิศวกรรม (Lean Recommendation):' : 'Lean Engineering Solution:'}
              </h4>
              <p className="text-xs text-slate-300 bg-slate-950/70 p-3 rounded-xl border border-slate-800 leading-relaxed">
                {th ? activeKaizenModal.kaizen.recommendationTh : activeKaizenModal.kaizen.recommendation}
              </p>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
              <button
                onClick={() => setActiveKaizenModal(null)}
                className="px-4 py-2 text-xs text-slate-400 hover:text-white rounded-lg transition"
              >
                {th ? 'ปิด' : 'Close'}
              </button>
              <button
                onClick={() => {
                  onApplyKaizen(activeKaizenModal.step.id, activeKaizenModal.kaizen.id);
                  setActiveKaizenModal(null);
                }}
                className={`flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-xl transition shadow-lg ${
                  activeKaizenModal.kaizen.implemented
                    ? 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                    : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-900/50'
                }`}
              >
                <Check className="w-4 h-4" />
                <span>
                  {activeKaizenModal.kaizen.implemented
                    ? (th ? 'ยกเลิกการใช้ข้อนี้' : 'Revert Kaizen')
                    : (th ? 'จำลองการใช้ Kaizen นี้ทันที' : 'Apply Kaizen Now')}
                </span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
