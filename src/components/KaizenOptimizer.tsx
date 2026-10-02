import React from 'react';
import { 
  Sliders, 
  Sparkles, 
  TrendingUp, 
  Check, 
  Layers, 
  Clock, 
  ArrowRight, 
  DollarSign, 
  Users, 
  RotateCcw,
  CheckCircle2,
  AlertTriangle
} from 'lucide-react';
import { ProcessStep, LineSettings, LineKPIs, Language } from '../types/vsm';
import { calculateLineKPIs, getEffectiveCycleTime, formatTime, formatLeadTime } from '../utils/calculations';
import { INITIAL_PROCESS_STEPS } from '../data/defaultRefrigLine';

interface KaizenOptimizerProps {
  steps: ProcessStep[];
  settings: LineSettings;
  kpis: LineKPIs;
  language: Language;
  onUpdateStep: (updatedStep: ProcessStep) => void;
  onApplyKaizen: (stepId: string, kaizenId: string) => void;
  onResetToBaseline: () => void;
  onApplyAllKaizen: () => void;
}

export const KaizenOptimizer: React.FC<KaizenOptimizerProps> = ({
  steps,
  settings,
  kpis,
  language,
  onUpdateStep,
  onApplyKaizen,
  onResetToBaseline,
  onApplyAllKaizen,
}) => {
  const th = language === 'th';

  // Baseline KPIs for comparison (Initial unoptimized state)
  const baselineKPIs = calculateLineKPIs(INITIAL_PROCESS_STEPS, settings);

  // Delta calculations
  const uphDelta = kpis.maxAchievableUPH - baselineKPIs.maxAchievableUPH;
  const lbeDelta = Number((kpis.lineBalanceEfficiency - baselineKPIs.lineBalanceEfficiency).toFixed(1));
  const leadTimeReductionHours = Number(((baselineKPIs.totalLeadTimeSec - kpis.totalLeadTimeSec) / 3600).toFixed(1));
  const wipReduction = baselineKPIs.totalWIP - kpis.totalWIP;

  // Flatten all Kaizen items
  const allKaizens = steps.flatMap((step) =>
    step.kaizenBursts.map((k) => ({
      ...k,
      stepId: step.id,
      stepNumber: step.stepNumber,
      stepName: th ? step.nameTh : step.name,
    }))
  );

  const implementedCount = allKaizens.filter((k) => k.implemented).length;
  const totalKaizens = allKaizens.length;

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-emerald-600/20 text-emerald-400 border border-emerald-500/30">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                {th ? 'ศูนย์ปรับปรุงไคเซ็น & เปรียบเทียบผลลัพธ์ (Kaizen Optimizer)' : 'Kaizen Optimizer & What-If Sandbox'}
                <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-800">
                  {implementedCount}/{totalKaizens} {th ? 'ไคเซ็นที่นำไปใช้' : 'Active Kaizens'}
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                {th 
                  ? 'จำลองผลลัพธ์ก่อน-หลังปรับปรุงสายการผลิตตู้เย็น ทดลองแก้ปัญหาคอขวดและตัดความสูญเปล่า NVA' 
                  : 'Simulate before-and-after Kaizen interventions, eliminate 7 wastes, and observe real-time productivity surge'}
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={onResetToBaseline}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700 transition border border-slate-700"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>{th ? 'รีเซ็ตกลับสภาวะเริ่มต้น' : 'Reset to Baseline'}</span>
          </button>

          <button
            onClick={onApplyAllKaizen}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-900/40 transition"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>{th ? 'เปิดใช้งาน Kaizen ทั้งหมด (Apply All)' : 'Apply All Kaizens'}</span>
          </button>
        </div>
      </div>

      {/* Before vs After Impact Delta Card */}
      <div className="bg-slate-950 border border-slate-800 rounded-2xl p-6 shadow-2xl space-y-4">
        <h3 className="text-sm font-bold text-white flex items-center justify-between">
          <span className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-emerald-400" />
            <span>{th ? 'เปรียบเทียบผลลัพธ์: สภาวะก่อนปรับปรุง vs สภาวะปัจจุบัน' : 'Performance Delta: Baseline vs Current State'}</span>
          </span>
          <span className="text-xs font-mono text-cyan-400">
            Target Pace: {settings.targetUPH} UPH ({kpis.taktTime}s)
          </span>
        </h3>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {/* Max UPH Delta */}
          <div className="bg-slate-900/90 border border-slate-800 p-4 rounded-xl space-y-1">
            <span className="text-slate-400 text-xs">{th ? 'กำลังการผลิตสูงสุด (Max UPH):' : 'Max Capacity (UPH):'}</span>
            <div className="flex items-baseline gap-2">
              <span className="text-sm text-slate-400 line-through font-mono">{baselineKPIs.maxAchievableUPH}</span>
              <ArrowRight className="w-3 h-3 text-slate-500" />
              <span className="text-2xl font-bold font-mono text-emerald-400">{kpis.maxAchievableUPH}</span>
              <span className="text-xs text-slate-400">UPH</span>
            </div>
            <div className="text-[11px] font-bold text-emerald-400 font-mono">
              {uphDelta >= 0 ? `+${uphDelta} UPH (${((uphDelta / baselineKPIs.maxAchievableUPH) * 100).toFixed(0)}% เพิ่มขึ้น)` : `${uphDelta} UPH`}
            </div>
          </div>

          {/* Line Balance Efficiency Delta */}
          <div className="bg-slate-900/90 border border-slate-800 p-4 rounded-xl space-y-1">
            <span className="text-slate-400 text-xs">{th ? 'สมดุลสายการผลิต (LBE):' : 'Line Balance (LBE):'}</span>
            <div className="flex items-baseline gap-2">
              <span className="text-sm text-slate-400 line-through font-mono">{baselineKPIs.lineBalanceEfficiency}%</span>
              <ArrowRight className="w-3 h-3 text-slate-500" />
              <span className="text-2xl font-bold font-mono text-cyan-300">{kpis.lineBalanceEfficiency}%</span>
            </div>
            <div className="text-[11px] font-bold font-mono text-cyan-400">
              {lbeDelta >= 0 ? `+${lbeDelta}% Balance Gain` : `${lbeDelta}%`}
            </div>
          </div>

          {/* Total Lead Time Reduction */}
          <div className="bg-slate-900/90 border border-slate-800 p-4 rounded-xl space-y-1">
            <span className="text-slate-400 text-xs">{th ? 'Lead Time รวม (PLT):' : 'Total Lead Time:'}</span>
            <div className="flex items-baseline gap-2">
              <span className="text-sm text-slate-400 line-through font-mono">{formatTime(baselineKPIs.totalLeadTimeSec)}</span>
              <ArrowRight className="w-3 h-3 text-slate-500" />
              <span className="text-2xl font-bold font-mono text-indigo-300">{formatTime(kpis.totalLeadTimeSec)}</span>
            </div>
            <div className="text-[11px] font-bold font-mono text-indigo-400">
              {leadTimeReductionHours > 0 ? `ลดเวลาได้ ${leadTimeReductionHours} ชม.` : 'คงที่'}
            </div>
          </div>

          {/* Total WIP Inventory Reduction */}
          <div className="bg-slate-900/90 border border-slate-800 p-4 rounded-xl space-y-1">
            <span className="text-slate-400 text-xs">{th ? 'WIP สะสมในสายผลิต:' : 'Work In Progress (WIP):'}</span>
            <div className="flex items-baseline gap-2">
              <span className="text-sm text-slate-400 line-through font-mono">{baselineKPIs.totalWIP}</span>
              <ArrowRight className="w-3 h-3 text-slate-500" />
              <span className="text-2xl font-bold font-mono text-teal-300">{kpis.totalWIP}</span>
              <span className="text-xs text-slate-400">{th ? 'เครื่อง' : 'units'}</span>
            </div>
            <div className="text-[11px] font-bold font-mono text-teal-400">
              {wipReduction > 0 ? `ลดกองสต็อก -${wipReduction} เครื่อง` : 'ไม่มีการลด'}
            </div>
          </div>
        </div>
      </div>

      {/* Kaizen Bursts Action Plan Checklist */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
        <h3 className="text-sm font-bold text-white flex items-center justify-between">
          <span className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span>{th ? 'รายการกิจกรรมไคเซ็นเฉพาะสายผลิตตู้เย็น (Kaizen Action Items)' : 'Refrigeration Kaizen Action Plan'}</span>
          </span>
          <span className="text-xs text-slate-400">
            {th ? '*คลิกถูกเพื่อเปิด/ปิดผลลัพธ์ของแต่ละข้อ' : '*Toggle checkbox to simulate impact'}
          </span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {allKaizens.map((kaizen) => (
            <div
              key={kaizen.id}
              onClick={() => onApplyKaizen(kaizen.stepId, kaizen.id)}
              className={`p-3.5 rounded-xl border-2 transition-all cursor-pointer flex items-start gap-3 ${
                kaizen.implemented
                  ? 'bg-emerald-950/40 border-emerald-600/80 shadow-md shadow-emerald-950/40'
                  : 'bg-slate-950/70 border-slate-800 hover:border-slate-700'
              }`}
            >
              {/* Checkbox */}
              <div className={`w-5 h-5 rounded-md flex items-center justify-center shrink-0 mt-0.5 border transition ${
                kaizen.implemented
                  ? 'bg-emerald-600 border-emerald-500 text-white'
                  : 'bg-slate-900 border-slate-700'
              }`}>
                {kaizen.implemented && <Check className="w-3.5 h-3.5 stroke-[3]" />}
              </div>

              {/* Kaizen content */}
              <div className="flex-1 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono text-cyan-400 font-bold">
                    Op {kaizen.stepNumber} • {kaizen.stepName}
                  </span>
                  <span className="text-[10px] font-mono font-bold text-emerald-400 bg-emerald-950 px-2 py-0.5 rounded border border-emerald-800">
                    -{kaizen.potentialReductionSec}s CT
                  </span>
                </div>

                <h4 className="text-xs font-bold text-white leading-snug">
                  {th ? kaizen.titleTh : kaizen.title}
                </h4>

                <p className="text-[11px] text-slate-400 leading-relaxed">
                  {th ? kaizen.recommendationTh : kaizen.recommendation}
                </p>

                <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1">
                  <span>Waste: <strong className="text-rose-400">{th ? kaizen.wasteTypeTh : kaizen.wasteType}</strong></span>
                  {kaizen.potentialCostThb && (
                    <span>Est. Cost: <strong className="text-slate-300 font-mono">฿{kaizen.potentialCostThb.toLocaleString()}</strong></span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Detailed Workstation Parameter Editor */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
        <h3 className="text-sm font-bold text-white flex items-center gap-2">
          <Sliders className="w-4 h-4 text-cyan-400" />
          <span>{th ? 'ตารางแก้ไขและปรับจูนพารามิเตอร์แต่ละขั้นตอน (Workstation Parameter Tuning)' : 'Workstation Parameters Tuning Matrix'}</span>
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-xs font-mono text-left">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400">
                <th className="pb-2">Op</th>
                <th className="pb-2">{th ? 'กระบวนการ' : 'Process'}</th>
                <th className="pb-2 text-center">CT (s)</th>
                <th className="pb-2 text-center">VA (s)</th>
                <th className="pb-2 text-center">NVA (s)</th>
                <th className="pb-2 text-center">{th ? 'จิ๊ก/แท่น' : 'Fixtures'}</th>
                <th className="pb-2 text-center">{th ? 'คน' : 'OPs'}</th>
                <th className="pb-2 text-center">WIP</th>
                <th className="pb-2 text-right">Eff CT</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {steps.map((step) => {
                const effCT = getEffectiveCycleTime(step);
                const isBottleneck = effCT > kpis.taktTime;

                return (
                  <tr key={step.id} className="hover:bg-slate-800/40 transition">
                    <td className="py-2 text-cyan-400 font-bold">Op {step.stepNumber}</td>
                    <td className="py-2 font-sans font-medium text-white">
                      {th ? step.nameTh : step.name}
                    </td>
                    <td className="py-2 text-center">
                      <input
                        type="number"
                        min="5"
                        max="240"
                        value={step.cycleTime}
                        onChange={(e) => {
                          const val = Number(e.target.value);
                          onUpdateStep({
                            ...step,
                            cycleTime: val,
                            valueAddedTime: Math.min(val, step.valueAddedTime),
                            nonValueAddedTime: Math.max(0, val - step.valueAddedTime),
                          });
                        }}
                        className="w-14 bg-slate-950 border border-slate-800 rounded px-1.5 py-0.5 text-center text-white"
                      />
                    </td>
                    <td className="py-2 text-center">
                      <input
                        type="number"
                        min="0"
                        max={step.cycleTime}
                        value={step.valueAddedTime}
                        onChange={(e) => {
                          const val = Number(e.target.value);
                          onUpdateStep({
                            ...step,
                            valueAddedTime: val,
                            nonValueAddedTime: Math.max(0, step.cycleTime - val),
                          });
                        }}
                        className="w-14 bg-slate-950 border border-slate-800 rounded px-1.5 py-0.5 text-center text-emerald-400"
                      />
                    </td>
                    <td className="py-2 text-center text-amber-400 font-bold">
                      {step.nonValueAddedTime}s
                    </td>
                    <td className="py-2 text-center">
                      <select
                        value={step.parallelStations}
                        onChange={(e) => {
                          onUpdateStep({
                            ...step,
                            parallelStations: Number(e.target.value),
                          });
                        }}
                        className="bg-slate-950 border border-slate-800 rounded px-1.5 py-0.5 text-white"
                      >
                        {[1, 2, 3, 4].map((n) => (
                          <option key={n} value={n}>{n} แท่น</option>
                        ))}
                      </select>
                    </td>
                    <td className="py-2 text-center">
                      <input
                        type="number"
                        min="1"
                        max="10"
                        value={step.operators}
                        onChange={(e) => {
                          onUpdateStep({
                            ...step,
                            operators: Number(e.target.value),
                          });
                        }}
                        className="w-12 bg-slate-950 border border-slate-800 rounded px-1 py-0.5 text-center text-indigo-300"
                      />
                    </td>
                    <td className="py-2 text-center">
                      <input
                        type="number"
                        min="0"
                        max="100"
                        value={step.wipBefore}
                        onChange={(e) => {
                          onUpdateStep({
                            ...step,
                            wipBefore: Number(e.target.value),
                          });
                        }}
                        className="w-14 bg-slate-950 border border-slate-800 rounded px-1 py-0.5 text-center text-amber-300"
                      />
                    </td>
                    <td className="py-2 text-right">
                      <span className={`font-bold ${isBottleneck ? 'text-rose-400' : 'text-cyan-300'}`}>
                        {effCT}s
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
