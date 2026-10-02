export interface ProcessStep {
  id: string;
  stepNumber: number;
  name: string;
  nameTh: string;
  category: 'forming' | 'insulation' | 'piping' | 'assembly' | 'testing' | 'packaging';
  cycleTime: number; // in seconds (Total per unit for the operation)
  valueAddedTime: number; // VA in seconds
  nonValueAddedTime: number; // NVA in seconds
  changeoverTime: number; // C/O in minutes
  uptime: number; // in %
  scrapRate: number; // in %
  operators: number; // Number of operators
  parallelStations: number; // Number of parallel machines/fixtures (e.g. 2 foaming jigs)
  wipBefore: number; // Work In Progress units in buffer before this station
  wipMaxLimit?: number; // Kanban buffer limit
  equipment: string;
  descriptionTh: string;
  descriptionEn: string;
  kaizenBursts: KaizenBurst[];
}

export interface KaizenBurst {
  id: string;
  title: string;
  titleTh: string;
  wasteType: 'Overproduction' | 'Waiting' | 'Transportation' | 'Overprocessing' | 'Inventory' | 'Motion' | 'Defects';
  wasteTypeTh: string;
  potentialReductionSec: number;
  potentialCostThb?: number;
  recommendation: string;
  recommendationTh: string;
  implemented: boolean;
}

export interface LineSettings {
  targetUPH: number; // Units Per Hour target (e.g. 60)
  shiftHours: number; // Hours per shift (e.g. 8)
  shiftsPerDay: number; // e.g. 2
  plannedDowntimeMinutes: number; // Lunch/break/briefing minutes per shift (e.g. 40)
  workingDaysPerMonth: number; // e.g. 24
  customerDemandPerDay?: number;
  refrigerantType: 'R600a (Isobutane)' | 'R134a' | 'R290 (Propane)';
  lineName: string;
}

export interface LineKPIs {
  taktTime: number; // in seconds
  bottleneckStep: ProcessStep | null;
  bottleneckEffectiveCT: number; // Max effective cycle time in seconds
  totalCycleTime: number; // Sum of all cycle times
  totalEffectiveCT: number; // Sum of effective CT (CT / parallelStations)
  totalValueAddedTime: number; // Sum of VA
  totalNonValueAddedTime: number; // Sum of NVA
  totalWIP: number; // Total units in buffers
  totalLeadTimeSec: number; // Production Lead Time (WIP * TT + Process Time)
  totalLeadTimeDays: number; // Production Lead Time in working days/shifts
  processCycleEfficiency: number; // PCE = (VA / PLT) * 100%
  lineBalanceEfficiency: number; // LBE = Sum(Eff CT) / (NumStations * Max Eff CT) * 100%
  balanceDelay: number; // 100 - LBE
  maxAchievableUPH: number; // 3600 / Bottleneck CT
  targetUPH: number;
  uphGap: number; // maxAchievableUPH - targetUPH
  totalOperators: number;
  operatorProductivity: number; // UPH per operator
}

export interface SimulationState {
  isRunning: boolean;
  speed: number; // 1x, 2x, 5x, 10x
  elapsedSeconds: number;
  totalProduced: number;
  currentActualUPH: number;
  wipBuffers: Record<string, number>; // stepId -> current wip count
  stationStatus: Record<string, 'processing' | 'blocked' | 'starved' | 'idle'>;
  activeBottlenecks: string[];
}

export type ViewMode = 'vsm' | 'yamazumi' | 'bottleneck' | 'simulation' | 'kaizen' | 'manager';
export type Language = 'th' | 'en';
