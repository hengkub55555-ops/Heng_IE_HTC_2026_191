import React from 'react';
import { X, Printer, Download, CheckCircle2, AlertTriangle, Layers, Clock, TrendingUp, Sparkles } from 'lucide-react';
import { ProcessStep, LineSettings, LineKPIs, Language } from '../types/vsm';
import { formatTime, formatLeadTime, getEffectiveCycleTime } from '../utils/calculations';

interface ReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  steps: ProcessStep[];
  settings: LineSettings;
  kpis: LineKPIs;
  language: Language;
}

export const ReportModal: React.FC<ReportModalProps> = ({
  isOpen,
  onClose,
  steps,
  settings,
  kpis,
  language,
}) => {
  const th = language === 'th';
  if (!isOpen) return null;

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadJSON = () => {
    const reportData = {
      timestamp: new Date().toISOString(),
      settings,
      kpis,
      steps,
    };
    const blob = new Blob([JSON.stringify(reportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `RefrigLine_VSM_Report_${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-4xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Modal Action Bar */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/70">
          <div className="flex items-center gap-2">
            <h2 className="text-base font-bold text-white">
              {th ? 'รายงานสรุปผลการวิเคราะห์ Value Stream Mapping & Line Balancing' : 'VSM & Line Balancing Executive Report'}
            </h2>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleDownloadJSON}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-800 text-slate-200 hover:text-white border border-slate-700 transition"
            >
              <Download className="w-3.5 h-3.5 text-cyan-400" />
              <span>JSON</span>
            </button>
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-cyan-600 hover:bg-cyan-500 text-white transition shadow"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>{th ? 'พิมพ์รายงาน' : 'Print Report'}</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Report Body */}
        <div className="p-6 overflow-y-auto space-y-6 text-slate-200 print:text-black print:bg-white">
          {/* Header section */}
          <div className="border-b border-slate-800 pb-4">
            <div className="flex justify-between items-start">
              <div>
                <h1 className="text-xl font-bold text-white tracking-tight">
                  {settings.lineName}
                </h1>
                <p className="text-xs text-slate-400 mt-1">
                  Refrigeration Manufacturing Line Lean Optimization & Bottleneck Diagnostic
                </p>
              </div>
              <div className="text-right text-xs font-mono text-slate-400">
                <div>Date: {new Date().toLocaleDateString('th-TH')}</div>
                <div className="text-cyan-400 font-bold">Gas: {settings.refrigerantType}</div>
              </div>
            </div>
          </div>

          {/* Key Executive KPI Summary */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
            <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800">
              <span className="text-slate-400 block">Target vs Achieved UPH</span>
              <span className="text-xl font-bold text-white font-mono mt-1 block">
                {settings.targetUPH} <span className="text-slate-500">vs</span> <span className={kpis.maxAchievableUPH >= settings.targetUPH ? 'text-emerald-400' : 'text-rose-400'}>{kpis.maxAchievableUPH}</span>
              </span>
              <span className="text-[10px] text-slate-400">Takt Time: {kpis.taktTime}s</span>
            </div>

            <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800">
              <span className="text-slate-400 block">Line Balance Efficiency (LBE)</span>
              <span className="text-xl font-bold text-cyan-300 font-mono mt-1 block">
                {kpis.lineBalanceEfficiency}%
              </span>
              <span className="text-[10px] text-slate-400">Balance Loss: {kpis.balanceDelay}%</span>
            </div>

            <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800">
              <span className="text-slate-400 block">Production Lead Time (PLT)</span>
              <span className="text-xl font-bold text-indigo-300 font-mono mt-1 block">
                {formatLeadTime(kpis.totalLeadTimeSec, settings)}
              </span>
              <span className="text-[10px] text-slate-400">WIP: {kpis.totalWIP} units</span>
            </div>

            <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800">
              <span className="text-slate-400 block">Active Bottleneck</span>
              <span className="text-base font-bold text-rose-300 font-mono mt-1 block truncate">
                Op {kpis.bottleneckStep?.stepNumber} ({kpis.bottleneckEffectiveCT}s)
              </span>
              <span className="text-[10px] text-slate-400 truncate block">
                {kpis.bottleneckStep ? (th ? kpis.bottleneckStep.nameTh : kpis.bottleneckStep.name) : '-'}
              </span>
            </div>
          </div>

          {/* VSM Steps Table */}
          <div className="space-y-2">
            <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
              {th ? 'ตารางสรุปรอบเวลาทุกกระบวนการในสายการผลิต' : 'Process Steps VSM Matrix'}
            </h3>
            <div className="border border-slate-800 rounded-xl overflow-hidden">
              <table className="w-full text-xs font-mono text-left">
                <thead className="bg-slate-950 text-slate-400 border-b border-slate-800">
                  <tr>
                    <th className="p-2">Op</th>
                    <th className="p-2">{th ? 'ชื่อขั้นตอน' : 'Step Name'}</th>
                    <th className="p-2 text-right">Cycle Time</th>
                    <th className="p-2 text-center">Jigs</th>
                    <th className="p-2 text-right">Eff CT</th>
                    <th className="p-2 text-right">VA / NVA</th>
                    <th className="p-2 text-center">OPs</th>
                    <th className="p-2 text-center">WIP</th>
                    <th className="p-2 text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 bg-slate-900/60">
                  {steps.map((s) => {
                    const eff = getEffectiveCycleTime(s);
                    const isOver = eff > kpis.taktTime;
                    return (
                      <tr key={s.id} className={isOver ? 'bg-rose-950/20' : ''}>
                        <td className="p-2 text-cyan-400 font-bold">Op {s.stepNumber}</td>
                        <td className="p-2 font-sans text-white">{th ? s.nameTh : s.name}</td>
                        <td className="p-2 text-right">{s.cycleTime}s</td>
                        <td className="p-2 text-center">{s.parallelStations}</td>
                        <td className="p-2 text-right font-bold">
                          <span className={isOver ? 'text-rose-400' : 'text-slate-200'}>{eff}s</span>
                        </td>
                        <td className="p-2 text-right text-slate-400">
                          <span className="text-emerald-400">{s.valueAddedTime}s</span> / <span className="text-amber-400">{s.nonValueAddedTime}s</span>
                        </td>
                        <td className="p-2 text-center">{s.operators}</td>
                        <td className="p-2 text-center">{s.wipBefore}</td>
                        <td className="p-2 text-center">
                          {isOver ? (
                            <span className="text-[10px] text-rose-300 font-bold">Bottleneck</span>
                          ) : (
                            <span className="text-[10px] text-emerald-400">Balanced</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Action Recommendations */}
          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
            <h3 className="text-xs font-bold text-amber-400 flex items-center gap-1.5 uppercase">
              <Sparkles className="w-4 h-4" />
              <span>{th ? 'ข้อเสนอแนะเชิงกลยุทธ์ตามหลัก Lean Manufacturing' : 'Strategic Kaizen Recommendations'}</span>
            </h3>
            <ul className="text-xs text-slate-300 space-y-1.5 list-disc pl-4 leading-relaxed">
              <li>
                <strong>Takt Time Synchronization:</strong> รักษาเวลาของทุกสถานีให้อยู่ภายใน {kpis.taktTime} วินาที หากสายผลิตต้องการ {settings.targetUPH} UPH
              </li>
              <li>
                <strong>Dual Parallel Foaming Jigs:</strong> การฉีดโฟมฉนวนกันความร้อน PU เป็นปฏิกิริยาเคมีที่เร่งไม่ได้ ควรใช้แม่พิมพ์คู่ขนาน (Dual Jigs) สลับฉีดและบ่มตัว เพื่อลดเวลาสถานีลง 50%
              </li>
              <li>
                <strong>High-Volume Roots Vacuum System:</strong> ขั้นตอนการแวคคั่มท่อทองแดงควรเสริม Roots Booster เพื่อดึงสูญญากาศให้ถึง 50 Microns ภายใน 42 วินาที
              </li>
              <li>
                <strong>Kanban Pull Pacing:</strong> กำหนดลิมิตบัฟเฟอร์ WIP ไม่ให้เกิน 15-20 เครื่องต่อสถานี เพื่อป้องกัน Lead Time บวมและลดพื้นที่จัดเก็บบนโรงงาน
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};
