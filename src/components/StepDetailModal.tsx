import React, { useState, useEffect } from 'react';
import { 
  X, 
  Check, 
  Clock, 
  Users, 
  Layers, 
  AlertTriangle, 
  Sparkles, 
  CheckCircle2, 
  Trash2, 
  Copy, 
  Plus, 
  Wrench,
  Percent,
  TrendingDown,
  Info
} from 'lucide-react';
import { ProcessStep, KaizenBurst, LineSettings, LineKPIs, Language } from '../types/vsm';
import { getEffectiveCycleTime } from '../utils/calculations';

interface StepDetailModalProps {
  step: ProcessStep | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (step: ProcessStep) => void;
  onDelete?: (stepId: string) => void;
  onDuplicate?: (step: ProcessStep) => void;
  settings: LineSettings;
  kpis: LineKPIs;
  language: Language;
}

export const StepDetailModal: React.FC<StepDetailModalProps> = ({
  step,
  isOpen,
  onClose,
  onSave,
  onDelete,
  onDuplicate,
  settings,
  kpis,
  language,
}) => {
  if (!isOpen || !step) return null;
  const th = language === 'th';

  const [form, setForm] = useState<ProcessStep>({ ...step });
  const [activeTab, setActiveTab] = useState<'general' | 'time' | 'kaizen'>('general');
  const [showAddKaizen, setShowAddKaizen] = useState<boolean>(false);
  const [newKaizen, setNewKaizen] = useState<Partial<KaizenBurst>>({
    title: '',
    titleTh: '',
    wasteType: 'Motion',
    wasteTypeTh: 'การเคลื่อนไหวสูญเปล่า',
    potentialReductionSec: 5,
    potentialCostThb: 20000,
    recommendation: '',
    recommendationTh: '',
    implemented: false,
  });

  useEffect(() => {
    setForm({ ...step });
    setShowAddKaizen(false);
  }, [step]);

  const effCT = getEffectiveCycleTime(form);
  const isBottleneck = effCT > kpis.taktTime;

  // Handle total cycle time changes with automatic VA/NVA proportion
  const handleTotalCTChange = (newTotal: number) => {
    const safeTotal = Math.max(1, newTotal);
    const ratio = form.cycleTime > 0 ? form.valueAddedTime / form.cycleTime : 0.8;
    const newVA = Math.min(safeTotal, Math.round(safeTotal * ratio));
    const newNVA = Math.max(0, safeTotal - newVA);
    setForm({
      ...form,
      cycleTime: safeTotal,
      valueAddedTime: newVA,
      nonValueAddedTime: newNVA,
    });
  };

  const handleAddKaizen = () => {
    if (!newKaizen.titleTh && !newKaizen.title) return;
    const burst: KaizenBurst = {
      id: `kb-${form.id}-${Date.now()}`,
      title: newKaizen.title || newKaizen.titleTh || 'Kaizen Action',
      titleTh: newKaizen.titleTh || newKaizen.title || 'กิจกรรมไคเซ็น',
      wasteType: (newKaizen.wasteType as any) || 'Motion',
      wasteTypeTh: newKaizen.wasteTypeTh || 'ความสูญเปล่า',
      potentialReductionSec: Number(newKaizen.potentialReductionSec || 5),
      potentialCostThb: Number(newKaizen.potentialCostThb || 0),
      recommendation: newKaizen.recommendation || '',
      recommendationTh: newKaizen.recommendationTh || '',
      implemented: false,
    };

    setForm({
      ...form,
      kaizenBursts: [...form.kaizenBursts, burst],
    });

    setNewKaizen({
      title: '',
      titleTh: '',
      wasteType: 'Motion',
      wasteTypeTh: 'การเคลื่อนไหวสูญเปล่า',
      potentialReductionSec: 5,
      potentialCostThb: 20000,
      recommendation: '',
      recommendationTh: '',
      implemented: false,
    });
    setShowAddKaizen(false);
  };

  const handleDeleteKaizen = (id: string) => {
    setForm({
      ...form,
      kaizenBursts: form.kaizenBursts.filter((k) => k.id !== id),
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(form);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-2xl w-full p-4 sm:p-6 shadow-2xl space-y-4 max-h-[92vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-start justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-3">
            <span className="text-xs font-mono font-bold px-2.5 py-1 rounded-lg bg-cyan-950 text-cyan-300 border border-cyan-800">
              Op {form.stepNumber}
            </span>
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                {th ? form.nameTh : form.name}
              </h3>
              <p className="text-xs text-slate-400">
                {th ? 'แก้ไขข้อมูลกระบวนการทั้งหมดในสายการผลิต' : 'Edit all process parameters and Kaizen actions'}
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

        {/* Status Alert Banner */}
        <div className={`p-3 rounded-xl border text-xs flex items-center justify-between ${
          isBottleneck
            ? 'bg-rose-950/60 border-rose-700 text-rose-300'
            : 'bg-emerald-950/60 border-emerald-700 text-emerald-300'
        }`}>
          <div className="flex items-center gap-2">
            {isBottleneck ? <AlertTriangle className="w-4 h-4 text-rose-400" /> : <CheckCircle2 className="w-4 h-4 text-emerald-400" />}
            <span>
              {isBottleneck 
                ? (th ? `จุดนี้คือคอขวด! รอบเวลาเกิน Takt Time อยู่ +${(effCT - kpis.taktTime).toFixed(1)}s` : `Bottleneck! Exceeds Takt Time by +${(effCT - kpis.taktTime).toFixed(1)}s`)
                : (th ? `เวลาอยู่ในเกณฑ์ Takt Time (${kpis.taktTime}s)` : `Effective cycle time is within Takt Time (${kpis.taktTime}s)`)}
            </span>
          </div>
          <span className="font-mono font-bold text-xs">
            Eff CT: <strong className="text-sm underline">{effCT}s</strong> (Takt: {kpis.taktTime}s)
          </span>
        </div>

        {/* Sub-tabs */}
        <div className="flex items-center gap-1 border-b border-slate-800 pb-1">
          <button
            type="button"
            onClick={() => setActiveTab('general')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
              activeTab === 'general' ? 'bg-cyan-600 text-white shadow' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            {th ? '1. ข้อมูลทั่วไป & อุปกรณ์' : '1. General & Equipment'}
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('time')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
              activeTab === 'time' ? 'bg-cyan-600 text-white shadow' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            {th ? '2. รอบเวลา CT, VA/NVA & จิ๊ก' : '2. Cycle Time & Fixtures'}
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('kaizen')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition flex items-center gap-1.5 ${
              activeTab === 'kaizen' ? 'bg-cyan-600 text-white shadow' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>{th ? `3. ข้อเสนอ Kaizen (${form.kaizenBursts.length})` : `3. Kaizens (${form.kaizenBursts.length})`}</span>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          {/* TAB 1: GENERAL & EQUIPMENT */}
          {activeTab === 'general' && (
            <div className="space-y-3.5 animate-in fade-in duration-150">
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">
                    {th ? 'ลำดับขั้นตอน (Op #):' : 'Op Step #:'}
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="999"
                    value={form.stepNumber}
                    onChange={(e) => setForm({ ...form, stepNumber: Number(e.target.value) })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-white font-mono"
                    required
                  />
                </div>

                <div className="sm:col-span-3">
                  <label className="block text-slate-300 font-semibold mb-1">
                    {th ? 'หมวดหมู่กระบวนการ:' : 'Category:'}
                  </label>
                  <select
                    value={form.category}
                    onChange={(e) => setForm({ ...form, category: e.target.value as any })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-white"
                  >
                    <option value="forming">{th ? 'ขึ้นรูปตัวถัง/พลาสติก (Forming)' : 'Forming'}</option>
                    <option value="insulation">{th ? 'ฉีดโฟมฉนวนกันความร้อน PU (Insulation)' : 'Insulation / Foaming'}</option>
                    <option value="assembly">{th ? 'ประกอบโครงสร้างและประตู (Assembly)' : 'Assembly'}</option>
                    <option value="piping">{th ? 'ระบบท่อ เชื่อม และอัดน้ำยา (Piping & Charging)' : 'Piping & Gas Charging'}</option>
                    <option value="testing">{th ? 'ทดสอบสุญญากาศ ไฟฟ้า และความเย็น (Testing)' : 'Testing & Inspection'}</option>
                    <option value="packaging">{th ? 'บรรจุหีบห่อและติดฉลาก (Packaging)' : 'Packaging & Labeling'}</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  {th ? 'ชื่อขั้นตอนภาษาไทย:' : 'Process Name (Thai):'}
                </label>
                <input
                  type="text"
                  value={form.nameTh}
                  onChange={(e) => setForm({ ...form, nameTh: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-white font-medium"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  {th ? 'ชื่อขั้นตอนภาษาอังกฤษ:' : 'Process Name (English):'}
                </label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-white"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  {th ? 'เครื่องจักร / อุปกรณ์ประจำสถานี:' : 'Equipment / Machine Name:'}
                </label>
                <input
                  type="text"
                  value={form.equipment}
                  onChange={(e) => setForm({ ...form, equipment: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-slate-200"
                  placeholder="เช่น High-Pressure Polyol/Isocyanate Metering & Heated Mold"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  {th ? 'คำอธิบายกระบวนการ (รายละเอียดการทำงาน):' : 'Detailed Process Description:'}
                </label>
                <textarea
                  rows={2}
                  value={form.descriptionTh}
                  onChange={(e) => setForm({ ...form, descriptionTh: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-slate-200"
                  placeholder="รายละเอียดเนื้องาน วิธีการทำงาน ข้อควรระวัง..."
                />
              </div>
            </div>
          )}

          {/* TAB 2: TIME, VA, NVA, OPERATORS & JIGS */}
          {activeTab === 'time' && (
            <div className="space-y-4 animate-in fade-in duration-150">
              {/* Total Cycle Time Slider */}
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
                <div className="flex justify-between items-center">
                  <label className="font-bold text-slate-200">
                    {th ? 'รอบเวลารวมต่อชิ้น (Total Cycle Time - วินาที):' : 'Total Cycle Time (seconds):'}
                  </label>
                  <span className="text-cyan-400 font-mono font-bold text-base">
                    {form.cycleTime}s
                  </span>
                </div>
                <input
                  type="range"
                  min="5"
                  max="180"
                  value={form.cycleTime}
                  onChange={(e) => handleTotalCTChange(Number(e.target.value))}
                  className="w-full accent-cyan-500 cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-slate-500">
                  <span>5s</span>
                  <span className="text-cyan-400 font-bold">Takt Time: {kpis.taktTime}s</span>
                  <span>180s</span>
                </div>
              </div>

              {/* Value Added & Non Value Added */}
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                  <label className="font-semibold text-emerald-400 block mb-1">
                    Value-Added (VA - วินาที):
                  </label>
                  <input
                    type="number"
                    min="0"
                    max={form.cycleTime}
                    value={form.valueAddedTime}
                    onChange={(e) => {
                      const val = Number(e.target.value);
                      setForm({
                        ...form,
                        valueAddedTime: val,
                        nonValueAddedTime: Math.max(0, form.cycleTime - val),
                      });
                    }}
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 text-emerald-300 font-mono font-bold"
                  />
                  <span className="text-[10px] text-slate-400 mt-1 block">
                    {th ? 'เวลาแปรรูปที่มีมูลค่าจริง' : 'True transformative value time'}
                  </span>
                </div>

                <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                  <label className="font-semibold text-amber-400 block mb-1">
                    Non-Value-Added (NVA - วินาที):
                  </label>
                  <input
                    type="number"
                    min="0"
                    max={form.cycleTime}
                    value={form.nonValueAddedTime}
                    onChange={(e) => {
                      const val = Number(e.target.value);
                      setForm({
                        ...form,
                        nonValueAddedTime: val,
                        valueAddedTime: Math.max(0, form.cycleTime - val),
                      });
                    }}
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 text-amber-300 font-mono font-bold"
                  />
                  <span className="text-[10px] text-slate-400 mt-1 block">
                    {th ? 'ความสูญเปล่า รอคอย เดิน หยิบ' : 'Waste, handling, clamping'}
                  </span>
                </div>
              </div>

              {/* Parallel Stations & Operators */}
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                  <label className="font-semibold text-slate-300 block mb-1">
                    {th ? 'จำนวนจิ๊ก/แท่นคู่ขนาน:' : 'Parallel Stations / Jigs:'}
                  </label>
                  <select
                    value={form.parallelStations}
                    onChange={(e) => setForm({ ...form, parallelStations: Number(e.target.value) })}
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 text-white font-mono font-bold"
                  >
                    {[1, 2, 3, 4, 5, 6].map((n) => (
                      <option key={n} value={n}>
                        {n} {th ? 'แท่น' : 'bays'} (Eff CT: {(form.cycleTime / n).toFixed(1)}s)
                      </option>
                    ))}
                  </select>
                  <span className="text-[10px] text-emerald-400 mt-1 block">
                    {th ? `รอบเวลาหลังแบ่งจิ๊ก: ${(form.cycleTime / form.parallelStations).toFixed(1)}s` : `Pace: ${(form.cycleTime / form.parallelStations).toFixed(1)}s`}
                  </span>
                </div>

                <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                  <label className="font-semibold text-slate-300 block mb-1">
                    {th ? 'จำนวนพนักงาน (Operators):' : 'Operators Count:'}
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="10"
                    value={form.operators}
                    onChange={(e) => setForm({ ...form, operators: Number(e.target.value) })}
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 text-white font-mono"
                  />
                  <span className="text-[10px] text-slate-400 mt-1 block">
                    {th ? 'จำนวนคนประจำสถานี' : 'Assigned headcount'}
                  </span>
                </div>
              </div>

              {/* Buffer WIP & Quality */}
              <div className="grid grid-cols-3 gap-3">
                <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                  <label className="font-semibold text-slate-300 block mb-1">
                    {th ? 'WIP ก่อนสถานี:' : 'WIP Buffer:'}
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="150"
                    value={form.wipBefore}
                    onChange={(e) => setForm({ ...form, wipBefore: Number(e.target.value) })}
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1 text-white font-mono"
                  />
                </div>

                <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                  <label className="font-semibold text-slate-300 block mb-1">
                    {th ? 'Changeover (นาที):' : 'C/O (mins):'}
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="120"
                    value={form.changeoverTime}
                    onChange={(e) => setForm({ ...form, changeoverTime: Number(e.target.value) })}
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1 text-white font-mono"
                  />
                </div>

                <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                  <label className="font-semibold text-slate-300 block mb-1">
                    {th ? 'Uptime (%):' : 'Uptime (%):'}
                  </label>
                  <input
                    type="number"
                    min="50"
                    max="100"
                    value={form.uptime}
                    onChange={(e) => setForm({ ...form, uptime: Number(e.target.value) })}
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1 text-white font-mono"
                  />
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: KAIZEN BURSTS MANAGEMENT */}
          {activeTab === 'kaizen' && (
            <div className="space-y-3.5 animate-in fade-in duration-150">
              <div className="flex items-center justify-between">
                <span className="text-slate-300 font-semibold">
                  {th ? 'รายการกิจกรรมไคเซ็นประจำขั้นตอนนี้:' : 'Kaizen Bursts for this step:'}
                </span>
                <button
                  type="button"
                  onClick={() => setShowAddKaizen(!showAddKaizen)}
                  className="flex items-center gap-1 text-xs px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold transition shadow"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>{th ? '+ เพิ่มข้อเสนอ Kaizen' : '+ Add Kaizen'}</span>
                </button>
              </div>

              {/* Add Kaizen Form */}
              {showAddKaizen && (
                <div className="bg-slate-950 p-3.5 rounded-xl border border-emerald-600/70 space-y-2.5">
                  <h4 className="text-xs font-bold text-emerald-400 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>{th ? 'สร้างข้อเสนอแนะไคเซ็นใหม่' : 'Create New Kaizen Proposal'}</span>
                  </h4>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[11px] text-slate-400 mb-1">
                        {th ? 'ชื่อกิจกรรม Kaizen (ไทย):' : 'Kaizen Title (TH):'}
                      </label>
                      <input
                        type="text"
                        value={newKaizen.titleTh}
                        onChange={(e) => setNewKaizen({ ...newKaizen, titleTh: e.target.value })}
                        className="w-full bg-slate-900 border border-slate-800 rounded px-2.5 py-1 text-white text-xs"
                        placeholder="เช่น ติดตั้งแขนกลยกแผ่นเหล็ก"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] text-slate-400 mb-1">
                        {th ? 'ประเภทความสูญเปล่า (7 Wastes):' : 'Waste Type:'}
                      </label>
                      <select
                        value={newKaizen.wasteType}
                        onChange={(e) => setNewKaizen({ 
                          ...newKaizen, 
                          wasteType: e.target.value as any,
                          wasteTypeTh: e.target.value === 'Motion' ? 'การเคลื่อนไหวสูญเปล่า' : e.target.value === 'Waiting' ? 'การรอคอย' : 'กระบวนการเกินจำเป็น'
                        })}
                        className="w-full bg-slate-900 border border-slate-800 rounded px-2 py-1 text-white text-xs"
                      >
                        <option value="Waiting">Waiting (การรอคอย)</option>
                        <option value="Motion">Motion (การเคลื่อนไหว)</option>
                        <option value="Overprocessing">Overprocessing (กระบวนการเกินจำเป็น)</option>
                        <option value="Defects">Defects (ของเสีย/แก้งาน)</option>
                        <option value="Inventory">Inventory (สต็อกสะสม)</option>
                        <option value="Transportation">Transportation (การขนย้าย)</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[11px] text-slate-400 mb-1">
                        {th ? 'ลด Cycle Time ได้ (วินาที):' : 'Potential CT Reduction (s):'}
                      </label>
                      <input
                        type="number"
                        min="1"
                        max="60"
                        value={newKaizen.potentialReductionSec}
                        onChange={(e) => setNewKaizen({ ...newKaizen, potentialReductionSec: Number(e.target.value) })}
                        className="w-full bg-slate-900 border border-slate-800 rounded px-2 py-1 text-emerald-400 font-mono font-bold"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] text-slate-400 mb-1">
                        {th ? 'งบประมาณโดยประมาณ (บาท):' : 'Est. Cost (THB):'}
                      </label>
                      <input
                        type="number"
                        min="0"
                        step="1000"
                        value={newKaizen.potentialCostThb}
                        onChange={(e) => setNewKaizen({ ...newKaizen, potentialCostThb: Number(e.target.value) })}
                        className="w-full bg-slate-900 border border-slate-800 rounded px-2 py-1 text-white font-mono"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] text-slate-400 mb-1">
                      {th ? 'แนวทางวิธีแก้ไขเชิงลีน:' : 'Kaizen Recommendation Description:'}
                    </label>
                    <textarea
                      rows={2}
                      value={newKaizen.recommendationTh}
                      onChange={(e) => setNewKaizen({ ...newKaizen, recommendationTh: e.target.value })}
                      className="w-full bg-slate-900 border border-slate-800 rounded p-2 text-white text-xs"
                      placeholder="อธิบายวิธีการปรับปรุง เช่น ปรับ 5S, เปลี่ยนหัวต่อลม..."
                    />
                  </div>

                  <div className="flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => setShowAddKaizen(false)}
                      className="px-2.5 py-1 text-slate-400 hover:text-white"
                    >
                      {th ? 'ยกเลิก' : 'Cancel'}
                    </button>
                    <button
                      type="button"
                      onClick={handleAddKaizen}
                      className="px-3 py-1 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded"
                    >
                      {th ? 'บันทึก Kaizen' : 'Add to Step'}
                    </button>
                  </div>
                </div>
              )}

              {/* Kaizen list */}
              {form.kaizenBursts.length === 0 ? (
                <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 text-center text-slate-500">
                  {th ? 'ยังไม่มีข้อเสนอแนะไคเซ็นในขั้นตอนนี้ คลิก "+ เพิ่มข้อเสนอ Kaizen" ด้านบน' : 'No Kaizen bursts yet.'}
                </div>
              ) : (
                <div className="space-y-2">
                  {form.kaizenBursts.map((k) => (
                    <div
                      key={k.id}
                      className="bg-slate-950 p-3 rounded-xl border border-slate-800 flex items-start justify-between gap-3"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-white text-xs">
                            {th ? k.titleTh : k.title}
                          </span>
                          <span className="text-[10px] font-mono text-emerald-400 font-bold bg-emerald-950 px-1.5 py-0.5 rounded border border-emerald-800">
                            -{k.potentialReductionSec}s
                          </span>
                          <span className="text-[10px] text-rose-400">
                            ({th ? k.wasteTypeTh : k.wasteType})
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-400">
                          {th ? k.recommendationTh : k.recommendation}
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleDeleteKaizen(k.id)}
                        className="text-slate-500 hover:text-rose-400 p-1 transition"
                        title={th ? 'ลบ Kaizen นี้' : 'Delete Kaizen'}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Modal Footer with Actions */}
          <div className="flex flex-wrap items-center justify-between gap-2 pt-3 border-t border-slate-800">
            <div className="flex items-center gap-2">
              {onDelete && (
                <button
                  type="button"
                  onClick={() => {
                    if (window.confirm(th ? `ยืนยันการลบขั้นตอน "${form.nameTh}" ออกจากสายผลิตหรือไม่?` : `Delete step "${form.name}"?`)) {
                      onDelete(form.id);
                      onClose();
                    }
                  }}
                  className="flex items-center gap-1 text-xs px-3 py-1.5 rounded-lg text-rose-400 hover:text-white hover:bg-rose-950/80 border border-rose-800/60 transition"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>{th ? 'ลบขั้นตอนนี้' : 'Delete Step'}</span>
                </button>
              )}

              {onDuplicate && (
                <button
                  type="button"
                  onClick={() => {
                    onDuplicate(form);
                    onClose();
                  }}
                  className="flex items-center gap-1 text-xs px-3 py-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 border border-slate-700 transition"
                >
                  <Copy className="w-3.5 h-3.5" />
                  <span>{th ? 'ทำซ้ำ (Duplicate)' : 'Duplicate'}</span>
                </button>
              )}
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white rounded-lg transition"
              >
                {th ? 'ยกเลิก' : 'Cancel'}
              </button>
              <button
                type="submit"
                className="flex items-center gap-1.5 px-5 py-2 text-xs font-bold bg-cyan-600 hover:bg-cyan-500 text-white rounded-xl shadow-lg shadow-cyan-900/50 transition"
              >
                <Check className="w-4 h-4" />
                <span>{th ? 'บันทึกการเปลี่ยนแปลงทั้งหมด' : 'Save All Changes'}</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
