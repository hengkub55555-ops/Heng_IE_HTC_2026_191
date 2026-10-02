import React, { useState } from 'react';
import { X, Calculator, Clock, Target, Check, HelpCircle } from 'lucide-react';
import { LineSettings, Language } from '../types/vsm';
import { getNetAvailableSecondsPerHour, calculateTaktTime } from '../utils/calculations';

interface TargetSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: LineSettings;
  onSave: (newSettings: LineSettings) => void;
  language: Language;
}

export const TargetSettingsModal: React.FC<TargetSettingsModalProps> = ({
  isOpen,
  onClose,
  settings,
  onSave,
  language,
}) => {
  const [form, setForm] = useState<LineSettings>({ ...settings });
  const th = language === 'th';

  if (!isOpen) return null;

  // Real-time calculation preview within the modal
  const netSecPerHour = getNetAvailableSecondsPerHour(form);
  const calculatedTT = calculateTaktTime(form);
  const netMinutesPerShift = form.shiftHours * 60 - form.plannedDowntimeMinutes;
  const netHoursPerShift = Number((netMinutesPerShift / 60).toFixed(2));
  const dailyTargetUnits = Math.round(form.targetUPH * netHoursPerShift * form.shiftsPerDay);
  const monthlyTargetUnits = Math.round(dailyTargetUnits * form.workingDaysPerMonth);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(form);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-700/80 rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-cyan-600/20 text-cyan-400 border border-cyan-500/30 flex items-center justify-center">
              <Calculator className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">
                {th ? 'กำหนดเป้าหมายการผลิต & คำนวณ Takt Time' : 'Production Targets & Takt Time Setup'}
              </h2>
              <p className="text-xs text-slate-400">
                {th ? 'เชื่อมโยงข้อมูล Target UPH, เวลาทำงาน และคำนวณ Takt Time อัตโนมัติ' : 'Configure UPH, shift schedules and auto-derive Takt Time'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-6">
          {/* Production Line Name */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              {th ? 'ชื่อสายการผลิต (Production Line Name)' : 'Line Name'}
            </label>
            <input
              type="text"
              value={form.lineName}
              onChange={(e) => setForm({ ...form, lineName: e.target.value })}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:border-cyan-500 transition"
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Target UPH */}
            <div className="bg-slate-950/70 p-4 rounded-xl border border-slate-800/80">
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-bold text-cyan-400 flex items-center gap-1.5">
                  <Target className="w-4 h-4" />
                  {th ? 'เป้าหมายผลผลิต (Target UPH)' : 'Target UPH'}
                </label>
                <span className="text-xs font-mono text-cyan-300 font-bold bg-cyan-950/70 px-2 py-0.5 rounded border border-cyan-800">
                  {form.targetUPH} เครื่อง/ชม.
                </span>
              </div>
              <p className="text-[11px] text-slate-400 mb-2">
                {th ? 'จำนวนตู้เย็นที่ต้องการผลิตต่อชั่วโมง (Units Per Hour)' : 'Required units per hour from line output'}
              </p>
              <input
                type="range"
                min="20"
                max="120"
                step="1"
                value={form.targetUPH}
                onChange={(e) => setForm({ ...form, targetUPH: Number(e.target.value) })}
                className="w-full accent-cyan-500 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-500 mt-1">
                <span>20 UPH</span>
                <span>60 UPH (Normal)</span>
                <span>90 UPH</span>
                <span>120 UPH</span>
              </div>
            </div>

            {/* Shift Hours & Break Times */}
            <div className="bg-slate-950/70 p-4 rounded-xl border border-slate-800/80 space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  {th ? 'ชั่วโมงทำงานต่อกะ (Shift Hours)' : 'Hours per Shift'}
                </label>
                <select
                  value={form.shiftHours}
                  onChange={(e) => setForm({ ...form, shiftHours: Number(e.target.value) })}
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-cyan-500"
                >
                  <option value={8}>8 {th ? 'ชั่วโมง (Standard Shift)' : 'Hours'}</option>
                  <option value={8.5}>8.5 {th ? 'ชั่วโมง' : 'Hours'}</option>
                  <option value={10}>10 {th ? 'ชั่วโมง (Extended/OT)' : 'Hours'}</option>
                  <option value={12}>12 {th ? 'ชั่วโมง (12h Shift)' : 'Hours'}</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  {th ? 'เวลาพัก/หยุดตามแผน (Planned Downtime - นาที/กะ)' : 'Planned Break (min/shift)'}
                </label>
                <input
                  type="number"
                  min="0"
                  max="120"
                  value={form.plannedDowntimeMinutes}
                  onChange={(e) => setForm({ ...form, plannedDowntimeMinutes: Number(e.target.value) })}
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-cyan-500"
                  placeholder="เช่น 40 นาที"
                />
                <span className="text-[10px] text-slate-500">
                  {th ? 'รวมเวลาพักเบรก 10-15 นาที, กิจกรรม 5S, ประชุมยามเช้า Morning Briefing' : 'Includes 2x breaks, 5S & daily standup'}
                </span>
              </div>
            </div>

            {/* Number of Shifts & Refrigerant */}
            <div className="bg-slate-950/70 p-4 rounded-xl border border-slate-800/80 space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  {th ? 'จำนวนกะทำงานต่อวัน (Shifts per Day)' : 'Shifts per Day'}
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[1, 2, 3].map((shiftNum) => (
                    <button
                      key={shiftNum}
                      type="button"
                      onClick={() => setForm({ ...form, shiftsPerDay: shiftNum })}
                      className={`py-1.5 rounded-lg text-xs font-semibold border transition ${
                        form.shiftsPerDay === shiftNum
                          ? 'bg-cyan-600 border-cyan-500 text-white'
                          : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
                      }`}
                    >
                      {shiftNum} {th ? 'กะ' : 'Shift'}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  {th ? 'สารทำความเย็นหลัก (Primary Refrigerant)' : 'Refrigerant Type'}
                </label>
                <select
                  value={form.refrigerantType}
                  onChange={(e) => setForm({ ...form, refrigerantType: e.target.value as any })}
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-cyan-500"
                >
                  <option value="R600a (Isobutane)">R600a (Isobutane - ประหยัดพลังงาน เป็นมิตรต่อสิ่งแวดล้อม)</option>
                  <option value="R134a">R134a (HFC Standard)</option>
                  <option value="R290 (Propane)">R290 (Propane Commercial Refrigeration)</option>
                </select>
              </div>
            </div>

            {/* Working days & Monthly demand */}
            <div className="bg-slate-950/70 p-4 rounded-xl border border-slate-800/80 space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  {th ? 'วันทำงานต่อเดือน (Working Days/Month)' : 'Working Days/Month'}
                </label>
                <input
                  type="number"
                  min="1"
                  max="31"
                  value={form.workingDaysPerMonth}
                  onChange={(e) => setForm({ ...form, workingDaysPerMonth: Number(e.target.value) })}
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div className="p-2.5 rounded-lg bg-slate-900/90 border border-slate-800 text-xs">
                <span className="text-slate-400 block text-[11px]">
                  {th ? 'ประมาณการกำลังการผลิตรายเดือน:' : 'Estimated Monthly Production:'}
                </span>
                <span className="text-sm font-bold text-emerald-400">
                  {monthlyTargetUnits.toLocaleString()} {th ? 'เครื่อง/เดือน' : 'units/mo'}
                </span>
                <span className="text-[10px] text-slate-500 block">
                  ({dailyTargetUnits.toLocaleString()} {th ? 'เครื่อง/วัน' : 'units/day'})
                </span>
              </div>
            </div>
          </div>

          {/* Mathematical Formula Preview Box */}
          <div className="bg-gradient-to-r from-cyan-950/40 to-blue-950/40 border border-cyan-800/60 rounded-xl p-4">
            <h3 className="text-xs font-bold text-cyan-300 flex items-center gap-1.5 mb-2">
              <Clock className="w-4 h-4" />
              {th ? 'สูตรคำนวณ Takt Time (TT) ทางวิศวกรรมลีน' : 'Lean Engineering Takt Time Derivation'}
            </h3>
            
            <div className="bg-slate-950/80 rounded-lg p-3 font-mono text-xs text-slate-300 space-y-1.5 border border-slate-800">
              <div className="flex justify-between items-center text-slate-400">
                <span>1. เวลาทำงานสุทธิ (Net Working Time/Shift):</span>
                <span className="text-white font-semibold">
                  ({form.shiftHours}h × 60m - {form.plannedDowntimeMinutes}m) = {netMinutesPerShift} นาที ({Math.round(netMinutesPerShift * 60)} วินาที)
                </span>
              </div>
              <div className="flex justify-between items-center text-slate-400">
                <span>2. เวลาทำงานสุทธิต่อชั่วโมง (Net Sec/Hour):</span>
                <span className="text-white font-semibold">{Math.round(netSecPerHour)} วินาที/ชม.</span>
              </div>
              <div className="flex justify-between items-center text-slate-400">
                <span>3. คำนวณ Takt Time (TT = Net Sec / Target UPH):</span>
                <span className="text-cyan-400 font-bold">
                  {Math.round(netSecPerHour)}s ÷ {form.targetUPH} UPH = <span className="text-lg text-cyan-300 underline font-extrabold">{calculatedTT}s</span> / เครื่อง
                </span>
              </div>
            </div>

            <p className="text-[11px] text-slate-400 mt-2 flex items-start gap-1">
              <HelpCircle className="w-3.5 h-3.5 text-cyan-400 shrink-0 mt-0.5" />
              <span>
                {th 
                  ? `ดังนั้น ทุกขั้นตอนในสายผลิตตู้เย็น จะต้องทำให้เสร็จไม่เกิน ${calculatedTT} วินาทีต่อเครื่อง หากขั้นตอนใดเกิน ${calculatedTT}s จะกลายเป็นจุดคอขวด (Bottleneck) ทันที`
                  : `Therefore, every workstation must maintain effective cycle time ≤ ${calculatedTT}s to meet customer takt pace without starvation or buffer explosion.`}
              </span>
            </p>
          </div>

          {/* Modal Footer Buttons */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white hover:bg-slate-800 transition"
            >
              {th ? 'ยกเลิก' : 'Cancel'}
            </button>
            <button
              type="submit"
              className="flex items-center gap-2 px-5 py-2 rounded-xl text-xs font-bold bg-cyan-600 hover:bg-cyan-500 text-white shadow-lg shadow-cyan-600/30 transition"
            >
              <Check className="w-4 h-4" />
              <span>{th ? 'บันทึกและปรับคำนวณผังใหม่' : 'Apply & Recalculate VSM'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
