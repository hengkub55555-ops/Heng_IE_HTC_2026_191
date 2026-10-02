import React from 'react';
import { 
  AlertTriangle, 
  TrendingDown, 
  TrendingUp, 
  CheckCircle2, 
  Zap, 
  ArrowRight, 
  Clock, 
  DollarSign, 
  Flame, 
  Wind, 
  ShieldAlert, 
  Sparkles,
  Layers,
  Users
} from 'lucide-react';
import { ProcessStep, LineSettings, LineKPIs, Language } from '../types/vsm';
import { getEffectiveCycleTime, formatTime } from '../utils/calculations';

interface BottleneckAnalysisProps {
  steps: ProcessStep[];
  settings: LineSettings;
  kpis: LineKPIs;
  language: Language;
  onApplyPreset: (presetKey: 'currentState' | 'balancedState' | 'highSpeedState') => void;
  onUpdateStep: (updatedStep: ProcessStep) => void;
}

export const BottleneckAnalysis: React.FC<BottleneckAnalysisProps> = ({
  steps,
  settings,
  kpis,
  language,
  onApplyPreset,
  onUpdateStep,
}) => {
  const th = language === 'th';
  const bottleneck = kpis.bottleneckStep;
  const isBottleneckCritical = kpis.bottleneckEffectiveCT > kpis.taktTime;
  const timeExcess = bottleneck ? (kpis.bottleneckEffectiveCT - kpis.taktTime).toFixed(1) : '0';

  // Financial impact calculation (assume ~5,000 THB per refrigerator wholesale)
  const unitPriceThb = 5500;
  const netHoursPerDay = (settings.shiftHours - settings.plannedDowntimeMinutes / 60) * settings.shiftsPerDay;
  const lostUnitsPerHour = Math.max(0, settings.targetUPH - kpis.maxAchievableUPH);
  const lostUnitsPerDay = Math.round(lostUnitsPerHour * netHoursPerDay);
  const lostValuePerDay = lostUnitsPerDay * unitPriceThb;
  const lostValuePerMonth = lostValuePerDay * settings.workingDaysPerMonth;

  // Rank all stations by Effective Cycle Time descending
  const sortedStations = [...steps].sort((a, b) => getEffectiveCycleTime(b) - getEffectiveCycleTime(a));

  // Quick 1-click bottleneck fix:
  const handleSolvePrimaryBottleneck = () => {
    if (!bottleneck) return;
    if (bottleneck.parallelStations === 1 && bottleneck.cycleTime > kpis.taktTime) {
      // Double the parallel fixtures (Lean standard practice for long cure / vacuum steps)
      onUpdateStep({
        ...bottleneck,
        parallelStations: 2,
        nonValueAddedTime: Math.max(4, Math.round(bottleneck.nonValueAddedTime * 0.7)),
        wipBefore: 12,
        kaizenBursts: bottleneck.kaizenBursts.map((k) => ({ ...k, implemented: true })),
      });
    } else {
      // Shave NVA and optimize
      onUpdateStep({
        ...bottleneck,
        nonValueAddedTime: Math.max(2, Math.round(bottleneck.nonValueAddedTime * 0.5)),
        cycleTime: Math.round(bottleneck.valueAddedTime * 0.9 + bottleneck.nonValueAddedTime * 0.5),
        kaizenBursts: bottleneck.kaizenBursts.map((k) => ({ ...k, implemented: true })),
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Hero Bottleneck Diagnosis Card */}
      <div className={`rounded-2xl p-6 border shadow-2xl relative overflow-hidden ${
        isBottleneckCritical
          ? 'bg-gradient-to-br from-rose-950/80 via-slate-900 to-slate-950 border-rose-600/80 shadow-rose-950/50'
          : 'bg-gradient-to-br from-emerald-950/60 via-slate-900 to-slate-950 border-emerald-600/80 shadow-emerald-950/50'
      }`}>
        <div className="flex flex-wrap items-start justify-between gap-4 relative z-10">
          <div className="flex items-start gap-3.5">
            <div className={`p-3 rounded-2xl border flex items-center justify-center ${
              isBottleneckCritical
                ? 'bg-rose-600 text-white border-rose-400 shadow-lg shadow-rose-600/40 animate-pulse'
                : 'bg-emerald-600 text-white border-emerald-400 shadow-lg'
            }`}>
              <AlertTriangle className="w-7 h-7" />
            </div>
            <div>
              <span className={`text-xs font-mono font-bold uppercase tracking-wider ${
                isBottleneckCritical ? 'text-rose-400' : 'text-emerald-400'
              }`}>
                {isBottleneckCritical 
                  ? (th ? 'ตรวจพบคอขวดวิกฤต (CRITICAL BOTTLENECK DETECTED)' : 'CRITICAL BOTTLENECK DETECTED')
                  : (th ? 'สายการผลิตได้ดุล (LINE IS BALANCED)' : 'LINE IS PACED & BALANCED')}
              </span>
              <h2 className="text-xl font-black text-white tracking-tight mt-0.5">
                {bottleneck ? (
                  <>
                    Op {bottleneck.stepNumber}: {th ? bottleneck.nameTh : bottleneck.name}
                  </>
                ) : 'No Process Steps'}
              </h2>
              <p className="text-xs text-slate-300 mt-1 max-w-2xl leading-relaxed">
                {isBottleneckCritical ? (
                  th ? (
                    <>
                      สถานีนี้ใช้เวลา <span className="font-bold text-rose-300 font-mono text-sm">{kpis.bottleneckEffectiveCT} วินาที</span> ซึ่งช้ากว่า Takt Time ที่กำหนดไว้ (<span className="text-cyan-300 font-mono">{kpis.taktTime} วินาที</span>) ถึง <span className="font-bold text-rose-300 font-mono">+{timeExcess} วินาที</span> ส่งผลให้กำลังการผลิตสูงสุดถูกจำกัดไว้ที่เพียง <span className="font-bold text-rose-400 font-mono text-sm">{kpis.maxAchievableUPH} เครื่อง/ชม.</span> (ตกเป้าหมาย {settings.targetUPH} UPH)
                    </>
                  ) : (
                    <>
                      Station effective cycle time of <span className="font-bold text-rose-300 font-mono">{kpis.bottleneckEffectiveCT}s</span> exceeds required Takt Time (<span className="text-cyan-300 font-mono">{kpis.taktTime}s</span>) by <span className="font-bold text-rose-300 font-mono">+{timeExcess}s</span>, capping line output at <span className="font-bold text-rose-400 font-mono">{kpis.maxAchievableUPH} UPH</span> against target {settings.targetUPH} UPH.
                    </>
                  )
                ) : (
                  th ? (
                    'ทุกสถานีงานในสายผลิตตู้เย็นใช้เวลาต่ำกว่า Takt Time สามารถผลิตได้ทันตามจังหวะความต้องการของลูกค้าโดยไม่มีจุดสะดุด'
                  ) : (
                    'All manufacturing stations are paced below Takt Time. The production line flows continuously with minimal buffer queues.'
                  )
                )}
              </p>
            </div>
          </div>

          {/* Quick One-Click Kaizen Resolution Button */}
          {isBottleneckCritical && (
            <button
              onClick={handleSolvePrimaryBottleneck}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white shadow-xl shadow-emerald-950/80 transition transform hover:-translate-y-0.5"
            >
              <Sparkles className="w-4 h-4" />
              <span>{th ? 'ปลดล็อกคอขวดจุดนี้ทันที (1-Click Kaizen Fix)' : '1-Click Kaizen Fix'}</span>
            </button>
          )}
        </div>

        {/* Quantified Losses Grid */}
        {isBottleneckCritical && (
          <div className="mt-6 pt-5 border-t border-slate-800/80 grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="bg-slate-950/70 p-3 rounded-xl border border-slate-800">
              <span className="text-slate-400 text-[11px] block">{th ? 'ผลผลิตที่หายไปต่อชั่วโมง:' : 'Output Deficit / Hour:'}</span>
              <span className="text-base font-bold text-rose-400 font-mono">
                -{lostUnitsPerHour} {th ? 'เครื่อง/ชม.' : 'units/hr'}
              </span>
            </div>

            <div className="bg-slate-950/70 p-3 rounded-xl border border-slate-800">
              <span className="text-slate-400 text-[11px] block">{th ? 'ผลผลิตที่หายไปต่อวัน:' : 'Lost Production / Day:'}</span>
              <span className="text-base font-bold text-rose-400 font-mono">
                -{lostUnitsPerDay.toLocaleString()} {th ? 'เครื่อง/วัน' : 'units/day'}
              </span>
            </div>

            <div className="bg-slate-950/70 p-3 rounded-xl border border-slate-800">
              <span className="text-slate-400 text-[11px] block">{th ? 'มูลค่าโอกาสสูญเสียรายวัน:' : 'Daily Opportunity Loss:'}</span>
              <span className="text-base font-bold text-amber-400 font-mono">
                ฿{(lostValuePerDay / 1000000).toFixed(2)}M {th ? 'บาท/วัน' : 'THB/day'}
              </span>
            </div>

            <div className="bg-slate-950/70 p-3 rounded-xl border border-slate-800">
              <span className="text-slate-400 text-[11px] block">{th ? 'มูลค่าโอกาสสูญเสียรายเดือน:' : 'Monthly Opportunity Loss:'}</span>
              <span className="text-base font-bold text-rose-300 font-mono">
                ฿{(lostValuePerMonth / 1000000).toFixed(1)}M {th ? 'บาท/เดือน' : 'THB/month'}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Upstream & Downstream Line Balance Impact (Theory of Constraints - TOC) */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
        <h3 className="text-sm font-bold text-white flex items-center gap-2">
          <Layers className="w-4 h-4 text-cyan-400" />
          <span>{th ? 'ผลกระทบตามหลัก Theory of Constraints (TOC) ต่อสายการผลิต' : 'Theory of Constraints (TOC) Ripple Effect'}</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          {/* Upstream Blockage */}
          <div className="bg-slate-950/80 p-4 rounded-xl border border-amber-800/40 space-y-2">
            <div className="flex items-center gap-2 text-amber-400 font-bold">
              <ShieldAlert className="w-4 h-4" />
              <span>{th ? '1. สถานีก่อนหน้าถูกบล็อก (Blocked Upstream)' : '1. Blocked Upstream'}</span>
            </div>
            <p className="text-slate-300 leading-relaxed text-[11px]">
              {th 
                ? 'สถานีขึ้นรูปและประกอบโครงตู้ (Op 10, Op 20) ผลิตเสร็จเร็วกว่า แต่ไม่สามารถส่งชิ้นงานเข้าฉีดโฟมได้ ทำให้เกิดกองสต็อก WIP สะสมสูงเกินขนาด และพื้นที่หน้างานติดขัด'
                : 'Forming & pre-assembly stations finish faster but cannot transfer shells into foaming, causing massive WIP buffers and floor congestion.'}
            </p>
            <div className="bg-slate-900 p-2 rounded text-[10px] text-amber-300 font-mono">
              WIP ก่อนจุดคอขวด: {bottleneck?.wipBefore || 0} เครื่อง (รอคอย {formatTime((bottleneck?.wipBefore || 0) * kpis.taktTime)})
            </div>
          </div>

          {/* Bottleneck Constraint */}
          <div className="bg-slate-950/80 p-4 rounded-xl border border-rose-800/40 space-y-2">
            <div className="flex items-center gap-2 text-rose-400 font-bold">
              <AlertTriangle className="w-4 h-4" />
              <span>{th ? '2. จุดคอขวดควบคุมจังหวะ (Pace Setter)' : '2. Bottleneck Constraint'}</span>
            </div>
            <p className="text-slate-300 leading-relaxed text-[11px]">
              {th 
                ? 'ตามกฎ Drum-Buffer-Rope ของ Eliyahu M. Goldratt อัตราการไหลของทั้งโรงงานจะเร็วได้ไม่เกินสถานีที่ช้าที่สุด ไม่ว่าจะเร่งขั้นตอนอื่นมากแค่ไหนก็ไม่เพิ่มผลผลิต'
                : 'According to Goldratt’s Drum-Buffer-Rope, the line pacing is strictly throttled by the slowest station. Speeding up other stations only creates waste.'}
            </p>
            <div className="bg-slate-900 p-2 rounded text-[10px] text-rose-300 font-mono">
              Max Throughput: {kpis.maxAchievableUPH} UPH (Paced at {kpis.bottleneckEffectiveCT}s)
            </div>
          </div>

          {/* Downstream Starvation */}
          <div className="bg-slate-950/80 p-4 rounded-xl border border-blue-800/40 space-y-2">
            <div className="flex items-center gap-2 text-blue-400 font-bold">
              <Clock className="w-4 h-4" />
              <span>{th ? '3. สถานีถัดไปขาดชิ้นงาน (Starved Downstream)' : '3. Starved Downstream'}</span>
            </div>
            <p className="text-slate-300 leading-relaxed text-[11px]">
              {th 
                ? 'สถานีประกอบประตู เชื่อมท่อ และทดสอบ (Op 40 - Op 100) ต้องหยุดยืนรอชิ้นงาน เกิดการรอคอยสูญเปล่า (Waiting Waste) และต้นทุนแรงงานสูญเปล่า'
                : 'Downstream door fitting, brazing, charging, and packing lines frequently run dry and wait, generating labor loss and low OEE.'}
            </p>
            <div className="bg-slate-900 p-2 rounded text-[10px] text-blue-300 font-mono">
              Balance Delay / Loss: {kpis.balanceDelay}% ของเวลาสายผลิต
            </div>
          </div>
        </div>
      </div>

      {/* Refrigeration Engineering Root Cause & Solution Blueprint */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
        <h3 className="text-sm font-bold text-white flex items-center gap-2">
          <Zap className="w-4 h-4 text-amber-400" />
          <span>{th ? 'วิเคราะห์เชิงลึก: สาเหตุและทางแก้คอขวดเฉพาะสายผลิตตู้เย็น' : 'Refrigeration Engineering Root-Cause & Kaizen Playbook'}</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Focus 1: PU Foaming Process */}
          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2.5">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <div className="flex items-center gap-2 text-amber-400 font-bold text-xs">
                <Flame className="w-4 h-4" />
                <span>Op 30: การฉีดโฟมฉนวนกันความร้อน PU (PU Foaming & Curing)</span>
              </div>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-950 text-amber-300 border border-amber-800">
                รอบเวลาเดิม: 110s
              </span>
            </div>

            <div className="text-xs text-slate-300 space-y-1.5 leading-relaxed">
              <p className="text-slate-400">
                <strong className="text-white">ทำไมถึงช้า:</strong> สาร Polyol + Isocyanate ต้องใช้เวลาทำปฏิกิริยาเคมีขยายตัว (Chemical Gel & Curing time ~85-95 วินาที) ในแม่พิมพ์ควบคุมอุณหภูมิ 45-50°C เพื่อให้โฟมคงรูป ไม่บวมปูด
              </p>
              <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800 space-y-1">
                <span className="text-cyan-400 font-semibold block text-[11px]">ทางแก้ตามหลักวิศวกรรมลีน:</span>
                <ul className="text-[11px] text-slate-300 space-y-1 list-disc pl-4">
                  <li>
                    <strong className="text-emerald-400">Dual Jig / Carousel Fixtures:</strong> เพิ่มแม่พิมพ์จิ๊กฉีดเป็น 2 ชุดขนานกัน (สลับฉีดและบ่มตัว) ทำให้ Cycle Time ต่อเครื่องลดเหลือ <strong>55 วินาที</strong> ทันที!
                  </li>
                  <li>
                    <strong className="text-emerald-400">High-Reactivity Polyol Formulation:</strong> เลือกสูตรโฟม Fast-Cure ลดเวลาบ่มตัวลงได้อีก 10-15% โดยยังคงค่าความเป็นฉนวน (K-factor) ระดับสูง
                  </li>
                  <li>
                    <strong className="text-emerald-400">Pneumatic Quick-Clamps:</strong> เปลี่ยนตัวล็อกแม่พิมพ์มือหมุนเป็นระบบกระบอกสูบลมแบบวันทัช ประหยัดเวลาล็อก/ปลด 8 วินาที
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* Focus 2: Deep Vacuum & Leak Evacuation */}
          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2.5">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <div className="flex items-center gap-2 text-cyan-400 font-bold text-xs">
                <Wind className="w-4 h-4" />
                <span>Op 60: แวคคั่มสุญญากาศลึก & ทดสอบรอยรั่วฮีเลียม (Vacuum & Leak Test)</span>
              </div>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-800">
                รอบเวลาเดิม: 85s
              </span>
            </div>

            <div className="text-xs text-slate-300 space-y-1.5 leading-relaxed">
              <p className="text-slate-400">
                <strong className="text-white">ทำไมถึงช้า:</strong> การดูดความชื้นและอากาศในท่อทองแดงยาวของ Evaporator & Condenser ให้ต่ำกว่า 50 Microns ผ่านรูหัววาล์วขนาดเล็กมี Flow Conductance จำกัด
              </p>
              <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800 space-y-1">
                <span className="text-cyan-400 font-semibold block text-[11px]">ทางแก้ตามหลักวิศวกรรมลีน:</span>
                <ul className="text-[11px] text-slate-300 space-y-1 list-disc pl-4">
                  <li>
                    <strong className="text-emerald-400">Dual-Bay Vacuum Station:</strong> เพิ่มจุดแวคคั่มคู่ขนาน 2 แท่น ดูดพร้อมกัน 2 เครื่อง แบ่งรอบเวลาเหลือ <strong>42.5 วินาที</strong>
                  </li>
                  <li>
                    <strong className="text-emerald-400">Roots Vacuum Booster Pump:</strong> เสริมปั๊มสูญญากาศแบบ Roots Booster ช่วยเร่งการดึงแรงดันช่วง 760 Torr ถึง 1 Torr เร็วขึ้น 3 เท่า
                  </li>
                  <li>
                    <strong className="text-emerald-400">Helium Sniffer Chamber:</strong> ทดสอบรอยรั่วด้วยก๊าซฮีเลียมในแชมเบอร์ปิด แม่นยำกว่าการจุ่มน้ำสบู่ 100 เท่า และลดเวลาจาก 30s เหลือ 10s
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Station Ranking Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl">
        <h3 className="text-sm font-bold text-white mb-3 flex items-center justify-between">
          <span className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-cyan-400" />
            <span>{th ? 'ตารางจัดอันดับรอบเวลาทุกสถานี (Cycle Time Ranking)' : 'Station Cycle Time Ranking & Balance Ratio'}</span>
          </span>
          <span className="text-xs font-mono text-slate-400 font-normal">
            Takt Time: <strong className="text-cyan-400">{kpis.taktTime}s</strong>
          </span>
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400">
                <th className="pb-2 pl-2">#</th>
                <th className="pb-2">{th ? 'สถานีงาน' : 'Station'}</th>
                <th className="pb-2 text-right">Cycle Time</th>
                <th className="pb-2 text-center">{th ? 'จิ๊กคู่ขนาน' : 'Fixtures'}</th>
                <th className="pb-2 text-right">Effective CT</th>
                <th className="pb-2 text-center">{th ? 'สถานะเทียบ TT' : 'Status vs TT'}</th>
                <th className="pb-2 text-right">VA / NVA</th>
                <th className="pb-2 text-right pr-2">Max UPH</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {sortedStations.map((s, idx) => {
                const eff = getEffectiveCycleTime(s);
                const isOver = eff > kpis.taktTime;
                return (
                  <tr key={s.id} className={`hover:bg-slate-800/40 transition ${isOver ? 'bg-rose-950/20' : ''}`}>
                    <td className="py-2.5 pl-2 font-bold text-slate-500">#{idx + 1}</td>
                    <td className="py-2.5 font-sans font-medium text-white">
                      <span className="text-cyan-400 font-mono font-bold mr-1.5">Op {s.stepNumber}</span>
                      {th ? s.nameTh : s.name}
                    </td>
                    <td className="py-2.5 text-right text-slate-300">{s.cycleTime}s</td>
                    <td className="py-2.5 text-center">
                      <span className={`px-2 py-0.5 rounded text-[10px] ${s.parallelStations > 1 ? 'bg-emerald-950 text-emerald-300 border border-emerald-800' : 'text-slate-400'}`}>
                        {s.parallelStations}
                      </span>
                    </td>
                    <td className="py-2.5 text-right font-bold">
                      <span className={isOver ? 'text-rose-400 text-sm' : 'text-cyan-300'}>
                        {eff}s
                      </span>
                    </td>
                    <td className="py-2.5 text-center">
                      {isOver ? (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-rose-950 text-rose-300 border border-rose-800 inline-flex items-center gap-1">
                          <AlertTriangle className="w-2.5 h-2.5" />
                          +{(eff - kpis.taktTime).toFixed(1)}s (คอขวด)
                        </span>
                      ) : (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800 inline-flex items-center gap-1">
                          <CheckCircle2 className="w-2.5 h-2.5" />
                          -{(kpis.taktTime - eff).toFixed(1)}s
                        </span>
                      )}
                    </td>
                    <td className="py-2.5 text-right text-slate-400">
                      <span className="text-emerald-400">{s.valueAddedTime}s</span> / <span className="text-amber-400">{s.nonValueAddedTime}s</span>
                    </td>
                    <td className="py-2.5 text-right pr-2 font-bold text-slate-300">
                      {Math.floor((settings.shiftHours * 3600 - settings.plannedDowntimeMinutes * 60) / settings.shiftHours / eff)} UPH
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
