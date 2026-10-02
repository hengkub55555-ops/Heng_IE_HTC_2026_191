import React, { useState } from 'react';
import { 
  Plus, 
  Trash2, 
  Copy, 
  ArrowUp, 
  ArrowDown, 
  Edit3, 
  Download, 
  Upload, 
  RotateCcw, 
  CheckCircle2, 
  AlertTriangle, 
  Sparkles, 
  Sliders, 
  Layers, 
  Search,
  Filter
} from 'lucide-react';
import { ProcessStep, LineSettings, LineKPIs, Language } from '../types/vsm';
import { getEffectiveCycleTime } from '../utils/calculations';

interface ProcessManagerViewProps {
  steps: ProcessStep[];
  settings: LineSettings;
  kpis: LineKPIs;
  language: Language;
  onUpdateStep: (updatedStep: ProcessStep) => void;
  onAddStep: () => void;
  onDeleteStep: (stepId: string) => void;
  onDuplicateStep: (step: ProcessStep) => void;
  onMoveStep: (index: number, direction: 'up' | 'down') => void;
  onOpenStepDetail: (step: ProcessStep) => void;
  onResetToDefault: () => void;
  onImportSteps: (importedSteps: ProcessStep[]) => void;
}

export const ProcessManagerView: React.FC<ProcessManagerViewProps> = ({
  steps,
  settings,
  kpis,
  language,
  onUpdateStep,
  onAddStep,
  onDeleteStep,
  onDuplicateStep,
  onMoveStep,
  onOpenStepDetail,
  onResetToDefault,
  onImportSteps,
}) => {
  const th = language === 'th';
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState<string>('all');

  const filteredSteps = steps.filter((step) => {
    const matchesSearch = 
      step.nameTh.toLowerCase().includes(searchQuery.toLowerCase()) ||
      step.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      step.equipment.toLowerCase().includes(searchQuery.toLowerCase()) ||
      `op ${step.stepNumber}`.includes(searchQuery.toLowerCase());
    const matchesCategory = filterCategory === 'all' || step.category === filterCategory;
    return matchesSearch && matchesCategory;
  });

  const handleExportJSON = () => {
    const dataStr = JSON.stringify(steps, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Refrigeration_Process_Steps_${Date.now()}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        if (Array.isArray(parsed) && parsed.length > 0) {
          onImportSteps(parsed);
          alert(th ? `นำเข้าข้อมูลกระบวนการสำเร็จ ${parsed.length} ขั้นตอน` : `Successfully imported ${parsed.length} process steps!`);
        }
      } catch (err) {
        alert(th ? 'รูปแบบไฟล์ JSON ไม่ถูกต้อง' : 'Invalid JSON file format');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner & Action Controls */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-cyan-600/20 text-cyan-400 border border-cyan-500/30">
              <Sliders className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                {th ? 'ศูนย์จัดการและแก้ไขข้อมูลกระบวนการทั้งหมด' : 'Process Master Data Manager'}
                <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-full bg-slate-800 text-cyan-300 border border-slate-700">
                  {steps.length} {th ? 'ขั้นตอน' : 'stations'}
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                {th 
                  ? 'แก้ไขชื่อ รอบเวลา CT, VA/NVA, เพิ่ม/ลดสถานี, สลับลำดับ และจัดการจิ๊กคู่ขนานได้ทันทีบนหน้าเว็บ' 
                  : 'Full CRUD & reordering of all refrigeration line operations directly in the web browser'}
              </p>
            </div>
          </div>
        </div>

        {/* Global Toolbar */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={onAddStep}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-cyan-600 hover:bg-cyan-500 text-white shadow-lg shadow-cyan-900/40 transition"
          >
            <Plus className="w-4 h-4" />
            <span>{th ? '+ เพิ่มขั้นตอนใหม่' : '+ Add New Step'}</span>
          </button>

          <label className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-slate-800 text-slate-200 hover:bg-slate-700 border border-slate-700 transition cursor-pointer">
            <Upload className="w-3.5 h-3.5 text-cyan-400" />
            <span>{th ? 'นำเข้า JSON' : 'Import JSON'}</span>
            <input type="file" accept=".json" onChange={handleFileUpload} className="hidden" />
          </label>

          <button
            onClick={handleExportJSON}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-slate-800 text-slate-200 hover:bg-slate-700 border border-slate-700 transition"
          >
            <Download className="w-3.5 h-3.5 text-emerald-400" />
            <span>{th ? 'ส่งออก JSON' : 'Export JSON'}</span>
          </button>

          <button
            onClick={() => {
              if (window.confirm(th ? 'ต้องการรีเซ็ตข้อมูลกระบวนการทั้งหมดกลับเป็นค่าเริ่มต้นสายตู้เย็นหรือไม่?' : 'Reset all steps to standard refrigeration template?')) {
                onResetToDefault();
              }
            }}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium text-slate-400 hover:text-white hover:bg-slate-800 border border-slate-800 transition"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>{th ? 'รีเซ็ตข้อมูล' : 'Reset'}</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-900/80 border border-slate-800 p-3 rounded-xl">
        <div className="flex items-center gap-2 flex-1 max-w-md">
          <div className="relative w-full">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder={th ? 'ค้นหาชื่อขั้นตอน, หมายเลข Op, หรือเครื่องจักร...' : 'Search station name, Op number, machine...'}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-9 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
            />
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs">
          <Filter className="w-3.5 h-3.5 text-slate-400" />
          <span className="text-slate-400">{th ? 'หมวดหมู่:' : 'Category:'}</span>
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none"
          >
            <option value="all">{th ? 'ทั้งหมด (All Categories)' : 'All'}</option>
            <option value="forming">{th ? 'ขึ้นรูปตัวถัง (Forming)' : 'Forming'}</option>
            <option value="insulation">{th ? 'ฉีดโฟม PU (Insulation)' : 'Insulation'}</option>
            <option value="assembly">{th ? 'ประกอบทั่วไป (Assembly)' : 'Assembly'}</option>
            <option value="piping">{th ? 'ระบบท่อ/เชื่อม/เติมน้ำยา (Piping)' : 'Piping'}</option>
            <option value="testing">{th ? 'ทดสอบสุญญากาศ/ไฟฟ้า (Testing)' : 'Testing'}</option>
            <option value="packaging">{th ? 'บรรจุหีบห่อ (Packaging)' : 'Packaging'}</option>
          </select>
        </div>
      </div>

      {/* Spreadsheet Matrix Table */}
      <div className="bg-slate-950 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs font-mono text-left">
            <thead className="bg-slate-900 border-b border-slate-800 text-slate-400 font-semibold">
              <tr>
                <th className="p-3 w-12 text-center">{th ? 'ลำดับ' : 'Order'}</th>
                <th className="p-3 w-16">Op #</th>
                <th className="p-3 min-w-[200px]">{th ? 'ชื่อขั้นตอน (ไทย / อังกฤษ)' : 'Station Name'}</th>
                <th className="p-3 text-center w-20">{th ? 'CT (วิ)' : 'CT (s)'}</th>
                <th className="p-3 text-center w-20">{th ? 'VA (วิ)' : 'VA (s)'}</th>
                <th className="p-3 text-center w-20">{th ? 'NVA (วิ)' : 'NVA (s)'}</th>
                <th className="p-3 text-center w-20">{th ? 'จิ๊กคู่ขนาน' : 'Jigs'}</th>
                <th className="p-3 text-center w-24">Eff CT</th>
                <th className="p-3 text-center w-16">{th ? 'คน' : 'OPs'}</th>
                <th className="p-3 text-center w-16">WIP</th>
                <th className="p-3 text-center w-28">{th ? 'สถานะเทียบ TT' : 'Status vs TT'}</th>
                <th className="p-3 text-right pr-4 min-w-[120px]">{th ? 'จัดการ' : 'Actions'}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/70 bg-slate-950/40">
              {filteredSteps.map((step, index) => {
                const originalIndex = steps.findIndex((s) => s.id === step.id);
                const effCT = getEffectiveCycleTime(step);
                const isBottleneck = effCT > kpis.taktTime;

                return (
                  <tr 
                    key={step.id} 
                    className={`hover:bg-slate-900/60 transition ${isBottleneck ? 'bg-rose-950/15' : ''}`}
                  >
                    {/* Order & Reorder buttons */}
                    <td className="p-2 text-center">
                      <div className="flex items-center justify-center gap-0.5">
                        <button
                          onClick={() => onMoveStep(originalIndex, 'up')}
                          disabled={originalIndex === 0}
                          className="p-1 rounded text-slate-500 hover:text-white disabled:opacity-20 transition"
                          title={th ? 'เลื่อนขึ้น' : 'Move Up'}
                        >
                          <ArrowUp className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => onMoveStep(originalIndex, 'down')}
                          disabled={originalIndex === steps.length - 1}
                          className="p-1 rounded text-slate-500 hover:text-white disabled:opacity-20 transition"
                          title={th ? 'เลื่อนลง' : 'Move Down'}
                        >
                          <ArrowDown className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>

                    {/* Op Number */}
                    <td className="p-2">
                      <input
                        type="number"
                        value={step.stepNumber}
                        onChange={(e) => onUpdateStep({ ...step, stepNumber: Number(e.target.value) })}
                        className="w-14 bg-slate-900 border border-slate-800 rounded px-1.5 py-1 text-center text-cyan-400 font-bold focus:outline-none focus:border-cyan-500"
                      />
                    </td>

                    {/* Station Name */}
                    <td className="p-2">
                      <input
                        type="text"
                        value={step.nameTh}
                        onChange={(e) => onUpdateStep({ ...step, nameTh: e.target.value })}
                        className="w-full bg-slate-900 border border-slate-800 rounded px-2 py-1 text-xs text-white font-sans font-medium focus:outline-none focus:border-cyan-500"
                        placeholder="ชื่อภาษาไทย"
                      />
                      <input
                        type="text"
                        value={step.name}
                        onChange={(e) => onUpdateStep({ ...step, name: e.target.value })}
                        className="w-full bg-slate-900/60 border border-slate-800/80 rounded px-2 py-0.5 text-[11px] text-slate-400 font-sans mt-1 focus:outline-none"
                        placeholder="English Name"
                      />
                    </td>

                    {/* Cycle Time */}
                    <td className="p-2 text-center">
                      <input
                        type="number"
                        min="1"
                        max="240"
                        value={step.cycleTime}
                        onChange={(e) => {
                          const val = Math.max(1, Number(e.target.value));
                          const ratio = step.valueAddedTime / Math.max(1, step.cycleTime);
                          const va = Math.round(val * ratio);
                          const nva = val - va;
                          onUpdateStep({
                            ...step,
                            cycleTime: val,
                            valueAddedTime: va,
                            nonValueAddedTime: nva,
                          });
                        }}
                        className="w-16 bg-slate-900 border border-slate-800 rounded px-1.5 py-1 text-center text-white font-bold focus:outline-none focus:border-cyan-500"
                      />
                    </td>

                    {/* VA */}
                    <td className="p-2 text-center">
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
                        className="w-16 bg-slate-900 border border-slate-800 rounded px-1.5 py-1 text-center text-emerald-400 font-bold focus:outline-none"
                      />
                    </td>

                    {/* NVA */}
                    <td className="p-2 text-center font-bold text-amber-400">
                      {step.nonValueAddedTime}s
                    </td>

                    {/* Parallel Jigs */}
                    <td className="p-2 text-center">
                      <select
                        value={step.parallelStations}
                        onChange={(e) => onUpdateStep({ ...step, parallelStations: Number(e.target.value) })}
                        className="bg-slate-900 border border-slate-800 rounded px-1.5 py-1 text-white font-bold focus:outline-none"
                      >
                        {[1, 2, 3, 4, 5, 6].map((n) => (
                          <option key={n} value={n}>{n}x</option>
                        ))}
                      </select>
                    </td>

                    {/* Eff CT */}
                    <td className="p-2 text-center">
                      <span className={`px-2 py-0.5 rounded font-bold text-xs ${
                        isBottleneck ? 'bg-rose-950 text-rose-300 border border-rose-800 animate-pulse' : 'text-cyan-300'
                      }`}>
                        {effCT}s
                      </span>
                    </td>

                    {/* Operators */}
                    <td className="p-2 text-center">
                      <input
                        type="number"
                        min="1"
                        max="10"
                        value={step.operators}
                        onChange={(e) => onUpdateStep({ ...step, operators: Number(e.target.value) })}
                        className="w-12 bg-slate-900 border border-slate-800 rounded px-1 py-1 text-center text-indigo-300 font-bold focus:outline-none"
                      />
                    </td>

                    {/* WIP */}
                    <td className="p-2 text-center">
                      <input
                        type="number"
                        min="0"
                        max="150"
                        value={step.wipBefore}
                        onChange={(e) => onUpdateStep({ ...step, wipBefore: Number(e.target.value) })}
                        className="w-14 bg-slate-900 border border-slate-800 rounded px-1 py-1 text-center text-amber-300 font-bold focus:outline-none"
                      />
                    </td>

                    {/* Status vs TT */}
                    <td className="p-2 text-center">
                      {isBottleneck ? (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-rose-950 text-rose-300 border border-rose-800 inline-flex items-center gap-1">
                          <AlertTriangle className="w-2.5 h-2.5" />
                          +{((effCT - kpis.taktTime)).toFixed(1)}s (คอขวด)
                        </span>
                      ) : (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800 inline-flex items-center gap-1">
                          <CheckCircle2 className="w-2.5 h-2.5" />
                          OK
                        </span>
                      )}
                    </td>

                    {/* Actions */}
                    <td className="p-2 text-right pr-4">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => onOpenStepDetail(step)}
                          className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-cyan-400 hover:text-white transition"
                          title={th ? 'แก้ไขละเอียด / จัดการ Kaizen' : 'Full Edit & Kaizen'}
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>

                        <button
                          onClick={() => onDuplicateStep(step)}
                          className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition"
                          title={th ? 'ทำซ้ำขั้นตอนนี้' : 'Duplicate Step'}
                        >
                          <Copy className="w-3.5 h-3.5" />
                        </button>

                        <button
                          onClick={() => {
                            if (window.confirm(th ? `ยืนยันการลบ "${step.nameTh}" ออกจากสายการผลิต?` : `Delete step "${step.name}"?`)) {
                              onDeleteStep(step.id);
                            }
                          }}
                          className="p-1.5 rounded-lg bg-slate-800 hover:bg-rose-900/80 text-rose-400 hover:text-white transition"
                          title={th ? 'ลบขั้นตอนนี้' : 'Delete Step'}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
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
