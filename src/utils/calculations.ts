import { ProcessStep, LineSettings, LineKPIs } from '../types/vsm';

/**
 * Calculates net available working seconds per hour or shift
 */
export function getNetAvailableSecondsPerHour(settings: LineSettings): number {
  const totalShiftSeconds = settings.shiftHours * 3600;
  const breakSeconds = settings.plannedDowntimeMinutes * 60;
  const netShiftSeconds = Math.max(1, totalShiftSeconds - breakSeconds);
  const netSecondsPerHour = netShiftSeconds / settings.shiftHours;
  return netSecondsPerHour;
}

/**
 * Calculates Takt Time based on target UPH and net operating efficiency
 * TT = Net Available Time (sec) / Target Output
 */
export function calculateTaktTime(settings: LineSettings): number {
  if (settings.targetUPH <= 0) return 0;
  const netSecondsPerHour = getNetAvailableSecondsPerHour(settings);
  // Real industrial takt time considering actual net working time
  return Number((netSecondsPerHour / settings.targetUPH).toFixed(1));
}

/**
 * Effective cycle time considers parallel stations (e.g. 2 Foaming fixtures halve the station pace)
 */
export function getEffectiveCycleTime(step: ProcessStep): number {
  const stations = Math.max(1, step.parallelStations || 1);
  return Number((step.cycleTime / stations).toFixed(1));
}

/**
 * Full line KPI calculation
 */
export function calculateLineKPIs(steps: ProcessStep[], settings: LineSettings): LineKPIs {
  const taktTime = calculateTaktTime(settings);

  let totalCycleTime = 0;
  let totalEffectiveCT = 0;
  let totalValueAddedTime = 0;
  let totalNonValueAddedTime = 0;
  let totalWIP = 0;
  let totalOperators = 0;

  let bottleneckStep: ProcessStep | null = null;
  let bottleneckEffectiveCT = 0;

  steps.forEach((step) => {
    const effCT = getEffectiveCycleTime(step);
    totalCycleTime += step.cycleTime;
    totalEffectiveCT += effCT;
    totalValueAddedTime += step.valueAddedTime;
    totalNonValueAddedTime += step.nonValueAddedTime;
    totalWIP += step.wipBefore;
    totalOperators += step.operators;

    if (effCT > bottleneckEffectiveCT) {
      bottleneckEffectiveCT = effCT;
      bottleneckStep = step;
    }
  });

  // Line Balance Efficiency = Sum(Eff CT) / (Num Stations * Max Eff CT) * 100
  const n = steps.length;
  const lineBalanceEfficiency =
    n > 0 && bottleneckEffectiveCT > 0
      ? Number(((totalEffectiveCT / (n * bottleneckEffectiveCT)) * 100).toFixed(1))
      : 0;

  const balanceDelay = Number((100 - lineBalanceEfficiency).toFixed(1));

  // Max achievable UPH based on bottleneck pace
  const netSecondsPerHour = getNetAvailableSecondsPerHour(settings);
  const maxAchievableUPH =
    bottleneckEffectiveCT > 0
      ? Math.floor(netSecondsPerHour / bottleneckEffectiveCT)
      : 0;

  const uphGap = maxAchievableUPH - settings.targetUPH;

  // Production Lead Time = (Total WIP * Takt Time) + Total Process Time
  const inventoryLeadTimeSec = totalWIP * taktTime;
  const totalLeadTimeSec = Math.round(inventoryLeadTimeSec + totalEffectiveCT);

  const netShiftSeconds = Math.max(1, settings.shiftHours * 3600 - settings.plannedDowntimeMinutes * 60);
  const dailyWorkSeconds = netShiftSeconds * settings.shiftsPerDay;
  const totalLeadTimeDays = Number((totalLeadTimeSec / dailyWorkSeconds).toFixed(2));

  // Process Cycle Efficiency (PCE) = VA / PLT * 100
  const processCycleEfficiency =
    totalLeadTimeSec > 0
      ? Number(((totalValueAddedTime / totalLeadTimeSec) * 100).toFixed(2))
      : 0;

  const operatorProductivity =
    totalOperators > 0 ? Number((settings.targetUPH / totalOperators).toFixed(2)) : 0;

  return {
    taktTime,
    bottleneckStep,
    bottleneckEffectiveCT,
    totalCycleTime,
    totalEffectiveCT: Number(totalEffectiveCT.toFixed(1)),
    totalValueAddedTime,
    totalNonValueAddedTime,
    totalWIP,
    totalLeadTimeSec,
    totalLeadTimeDays,
    processCycleEfficiency,
    lineBalanceEfficiency,
    balanceDelay,
    maxAchievableUPH,
    targetUPH: settings.targetUPH,
    uphGap,
    totalOperators,
    operatorProductivity,
  };
}

/**
 * Format seconds to standard mm:ss or s
 */
export function formatTime(seconds: number): string {
  if (seconds < 60) return `${seconds.toFixed(0)}s`;
  const mins = Math.floor(seconds / 60);
  const remSec = Math.round(seconds % 60);
  return `${mins}m ${remSec}s`;
}

/**
 * Formats lead time to days, hours, or minutes
 */
export function formatLeadTime(seconds: number, settings: LineSettings): string {
  const netShiftSeconds = Math.max(1, settings.shiftHours * 3600 - settings.plannedDowntimeMinutes * 60);
  const dailyWorkSeconds = netShiftSeconds * settings.shiftsPerDay;
  
  if (seconds >= dailyWorkSeconds) {
    const days = (seconds / dailyWorkSeconds).toFixed(1);
    return `${days} วัน (Days)`;
  }
  if (seconds >= 3600) {
    const hours = (seconds / 3600).toFixed(1);
    return `${hours} ชม. (Hrs)`;
  }
  const mins = Math.round(seconds / 60);
  return `${mins} นาที (Mins)`;
}
