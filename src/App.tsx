import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { 
  LineSettings, 
  ProcessStep, 
  SimulationState, 
  ViewMode, 
  Language 
} from './types/vsm';
import { 
  DEFAULT_LINE_SETTINGS, 
  INITIAL_PROCESS_STEPS, 
  PRESET_SCENARIOS 
} from './data/defaultRefrigLine';
import { 
  calculateLineKPIs, 
  getEffectiveCycleTime 
} from './utils/calculations';
import { Header } from './components/Header';
import { VSMCanvas } from './components/VSMCanvas';
import { YamazumiChart } from './components/YamazumiChart';
import { BottleneckAnalysis } from './components/BottleneckAnalysis';
import { LiveSimulation } from './components/LiveSimulation';
import { KaizenOptimizer } from './components/KaizenOptimizer';
import { ProcessManagerView } from './components/ProcessManagerView';
import { TargetSettingsModal } from './components/TargetSettingsModal';
import { ReportModal } from './components/ReportModal';
import { StepDetailModal } from './components/StepDetailModal';

export default function App() {
  // Load saved state or use initial defaults
  const [settings, setSettings] = useState<LineSettings>(() => {
    try {
      const saved = localStorage.getItem('refrigline_settings');
      return saved ? JSON.parse(saved) : DEFAULT_LINE_SETTINGS;
    } catch {
      return DEFAULT_LINE_SETTINGS;
    }
  });

  const [steps, setSteps] = useState<ProcessStep[]>(() => {
    try {
      const saved = localStorage.getItem('refrigline_steps');
      return saved ? JSON.parse(saved) : INITIAL_PROCESS_STEPS;
    } catch {
      return INITIAL_PROCESS_STEPS;
    }
  });

  const [currentView, setCurrentView] = useState<ViewMode>('vsm');
  const [language, setLanguage] = useState<Language>('th');
  const [activePreset, setActivePreset] = useState<string>('currentState');
  
  // Modals state
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);
  const [isReportOpen, setIsReportOpen] = useState<boolean>(false);
  const [selectedStep, setSelectedStep] = useState<ProcessStep | null>(null);
  const [isStepModalOpen, setIsStepModalOpen] = useState<boolean>(false);

  // Save changes to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('refrigline_steps', JSON.stringify(steps));
      localStorage.setItem('refrigline_settings', JSON.stringify(settings));
    } catch (e) {
      console.warn('LocalStorage save failed:', e);
    }
  }, [steps, settings]);

  // Real-time calculated KPIs
  const kpis = useMemo(() => {
    return calculateLineKPIs(steps, settings);
  }, [steps, settings]);

  // Live Discrete-event Simulation State
  const [simulation, setSimulation] = useState<SimulationState>(() => ({
    isRunning: false,
    speed: 2,
    elapsedSeconds: 0,
    totalProduced: 0,
    currentActualUPH: 0,
    wipBuffers: steps.reduce((acc, s) => ({ ...acc, [s.id]: s.wipBefore }), {}),
    stationStatus: steps.reduce((acc, s) => ({ ...acc, [s.id]: 'processing' }), {}),
    activeBottlenecks: [],
  }));

  // Sync simulation WIP buffers if steps change
  useEffect(() => {
    setSimulation((prev) => ({
      ...prev,
      wipBuffers: steps.reduce((acc, s) => ({
        ...acc,
        [s.id]: prev.wipBuffers[s.id] ?? s.wipBefore,
      }), {}),
      currentActualUPH: kpis.maxAchievableUPH,
      activeBottlenecks: kpis.bottleneckStep ? [kpis.bottleneckStep.id] : [],
    }));
  }, [steps, kpis]);

  // Simulation loop ticker
  useEffect(() => {
    if (!simulation.isRunning) return;

    const intervalMs = 1000 / simulation.speed;
    const interval = setInterval(() => {
      setSimulation((prev) => {
        const nextElapsed = prev.elapsedSeconds + 1;
        const bottleneckCT = Math.max(1, kpis.bottleneckEffectiveCT);
        
        // Units produced based on bottleneck output pace
        const unitsProducedThisSecond = 1 / bottleneckCT;
        const newTotalProduced = prev.totalProduced + unitsProducedThisSecond;
        
        // Dynamic WIP accumulation:
        const newWip: Record<string, number> = { ...prev.wipBuffers };
        const newStatus: Record<string, 'processing' | 'blocked' | 'starved' | 'idle'> = {};

        steps.forEach((step, idx) => {
          const effCT = getEffectiveCycleTime(step);
          const isBottleneck = kpis.bottleneckStep?.id === step.id;

          if (isBottleneck) {
            newStatus[step.id] = 'processing';
            if (Math.random() < 0.2) {
              newWip[step.id] = Math.min(80, (newWip[step.id] || 0) + 1);
            }
          } else if (effCT < bottleneckCT) {
            if (idx < (steps.findIndex((s) => s.id === kpis.bottleneckStep?.id) ?? 999)) {
              newStatus[step.id] = (newWip[step.id] || 0) > 30 ? 'blocked' : 'processing';
            } else {
              newStatus[step.id] = (newWip[step.id] || 0) <= 2 ? 'starved' : 'processing';
            }
          } else {
            newStatus[step.id] = 'processing';
          }
        });

        const actualRate = Math.round((newTotalProduced / Math.max(1, nextElapsed)) * 3600);

        return {
          ...prev,
          elapsedSeconds: nextElapsed,
          totalProduced: Math.floor(newTotalProduced),
          currentActualUPH: Math.min(kpis.maxAchievableUPH, Math.max(1, actualRate || kpis.maxAchievableUPH)),
          wipBuffers: newWip,
          stationStatus: newStatus,
        };
      });
    }, intervalMs);

    return () => clearInterval(interval);
  }, [simulation.isRunning, simulation.speed, kpis, steps]);

  // Preset Handler
  const handleSelectPreset = useCallback((presetKey: 'currentState' | 'balancedState' | 'highSpeedState') => {
    setActivePreset(presetKey);
    const preset = PRESET_SCENARIOS[presetKey];
    if (preset) {
      setSteps(preset.steps);
      if (presetKey === 'highSpeedState') {
        setSettings((prev) => ({ ...prev, targetUPH: 75 }));
      } else {
        setSettings((prev) => ({ ...prev, targetUPH: 60 }));
      }
    }
  }, []);

  // Update a single step
  const handleUpdateStep = useCallback((updatedStep: ProcessStep) => {
    setSteps((prev) => prev.map((s) => (s.id === updatedStep.id ? updatedStep : s)));
    setSelectedStep((prev) => (prev?.id === updatedStep.id ? updatedStep : prev));
  }, []);

  // Add a new step to the production line
  const handleAddStep = useCallback(() => {
    const maxOp = steps.reduce((max, s) => Math.max(max, s.stepNumber), 0);
    const newStepNumber = maxOp + 10;
    const newStep: ProcessStep = {
      id: `op-custom-${Date.now()}`,
      stepNumber: newStepNumber,
      name: `New Workstation Op ${newStepNumber}`,
      nameTh: `สถานีงาน Op ${newStepNumber}`,
      category: 'assembly',
      cycleTime: 46,
      valueAddedTime: 38,
      nonValueAddedTime: 8,
      changeoverTime: 5,
      uptime: 96,
      scrapRate: 0.4,
      operators: 2,
      parallelStations: 1,
      wipBefore: 12,
      wipMaxLimit: 20,
      equipment: 'Manual Workbench & Air Tools',
      descriptionTh: 'ขั้นตอนการทำงานที่สร้างขึ้นใหม่ในสายการผลิต',
      descriptionEn: 'Newly added refrigeration line workstation',
      kaizenBursts: [],
    };
    setSteps((prev) => [...prev, newStep]);
    setSelectedStep(newStep);
    setIsStepModalOpen(true);
  }, [steps]);

  // Delete a step
  const handleDeleteStep = useCallback((stepId: string) => {
    setSteps((prev) => prev.filter((s) => s.id !== stepId));
    if (selectedStep?.id === stepId) {
      setSelectedStep(null);
      setIsStepModalOpen(false);
    }
  }, [selectedStep]);

  // Duplicate a step
  const handleDuplicateStep = useCallback((step: ProcessStep) => {
    const duplicated: ProcessStep = {
      ...step,
      id: `op-${step.stepNumber}-copy-${Date.now()}`,
      stepNumber: step.stepNumber + 5,
      name: `${step.name} (Copy)`,
      nameTh: `${step.nameTh} (สำเนา)`,
      kaizenBursts: step.kaizenBursts.map((k) => ({
        ...k,
        id: `${k.id}-copy-${Date.now()}`,
      })),
    };
    setSteps((prev) => {
      const index = prev.findIndex((s) => s.id === step.id);
      const updated = [...prev];
      updated.splice(index + 1, 0, duplicated);
      return updated;
    });
  }, []);

  // Reorder steps (move up / down)
  const handleMoveStep = useCallback((index: number, direction: 'up' | 'down') => {
    setSteps((prev) => {
      const targetIndex = direction === 'up' ? index - 1 : index + 1;
      if (targetIndex < 0 || targetIndex >= prev.length) return prev;
      const updated = [...prev];
      const temp = updated[index];
      updated[index] = updated[targetIndex];
      updated[targetIndex] = temp;
      return updated;
    });
  }, []);

  // Reset to default refrigeration template
  const handleResetToDefault = useCallback(() => {
    setSteps(INITIAL_PROCESS_STEPS);
    setSettings(DEFAULT_LINE_SETTINGS);
    setActivePreset('currentState');
    try {
      localStorage.removeItem('refrigline_steps');
      localStorage.removeItem('refrigline_settings');
    } catch {}
  }, []);

  // Import JSON steps
  const handleImportSteps = useCallback((imported: ProcessStep[]) => {
    setSteps(imported);
  }, []);

  // Apply or toggle a Kaizen burst
  const handleApplyKaizen = useCallback((stepId: string, kaizenId: string) => {
    setSteps((prev) =>
      prev.map((step) => {
        if (step.id !== stepId) return step;

        const updatedBursts = step.kaizenBursts.map((k) => {
          if (k.id !== kaizenId) return k;
          const nextImplemented = !k.implemented;
          return { ...k, implemented: nextImplemented };
        });

        const targetKaizen = step.kaizenBursts.find((k) => k.id === kaizenId);
        if (!targetKaizen) return step;

        const willImplement = !targetKaizen.implemented;
        const reduction = targetKaizen.potentialReductionSec;
        
        let newNVA = step.nonValueAddedTime;
        let newCT = step.cycleTime;
        let newParallel = step.parallelStations;

        if (targetKaizen.title.includes('Dual') || targetKaizen.titleTh.includes('คู่ขนาน')) {
          newParallel = willImplement ? 2 : 1;
        } else {
          newNVA = willImplement 
            ? Math.max(2, step.nonValueAddedTime - reduction) 
            : step.nonValueAddedTime + reduction;
          newCT = step.valueAddedTime + newNVA;
        }

        return {
          ...step,
          parallelStations: newParallel,
          nonValueAddedTime: newNVA,
          cycleTime: newCT,
          kaizenBursts: updatedBursts,
        };
      })
    );
  }, []);

  // One-click Auto Balance Line
  const handleAutoBalance = useCallback(() => {
    const targetTT = kpis.taktTime;
    setSteps((prev) =>
      prev.map((step) => {
        let effCT = getEffectiveCycleTime(step);
        let parallel = step.parallelStations;
        let nva = step.nonValueAddedTime;
        let va = step.valueAddedTime;
        let ct = step.cycleTime;

        if (effCT > targetTT) {
          if (step.cycleTime > targetTT * 1.5) {
            parallel = Math.ceil(step.cycleTime / (targetTT * 0.95));
          } else {
            const neededTrim = step.cycleTime - Math.floor(targetTT * 0.95);
            nva = Math.max(3, nva - neededTrim);
            ct = va + nva;
          }
        }

        return {
          ...step,
          parallelStations: parallel,
          nonValueAddedTime: nva,
          cycleTime: ct,
          wipBefore: Math.min(step.wipBefore, 12),
          kaizenBursts: step.kaizenBursts.map((k) => ({ ...k, implemented: true })),
        };
      })
    );
  }, [kpis.taktTime]);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col antialiased">
      {/* Application Navigation Header */}
      <Header
        settings={settings}
        kpis={kpis}
        currentView={currentView}
        onViewChange={setCurrentView}
        simulation={simulation}
        onToggleSimulation={() => setSimulation((prev) => ({ ...prev, isRunning: !prev.isRunning }))}
        onResetSimulation={() => setSimulation((prev) => ({
          ...prev,
          isRunning: false,
          elapsedSeconds: 0,
          totalProduced: 0,
          wipBuffers: steps.reduce((acc, s) => ({ ...acc, [s.id]: s.wipBefore }), {}),
        }))}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onOpenReport={() => setIsReportOpen(true)}
        onAddNewStep={handleAddStep}
        language={language}
        onToggleLanguage={() => setLanguage((prev) => (prev === 'th' ? 'en' : 'th'))}
        activePreset={activePreset}
        onSelectPreset={handleSelectPreset}
      />

      {/* Main View Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 py-6">
        {currentView === 'vsm' && (
          <VSMCanvas
            steps={steps}
            settings={settings}
            kpis={kpis}
            language={language}
            selectedStepId={selectedStep?.id || null}
            onSelectStep={(step) => {
              setSelectedStep(step);
              setIsStepModalOpen(true);
            }}
            onApplyKaizen={handleApplyKaizen}
            onAddNewStep={handleAddStep}
          />
        )}

        {currentView === 'yamazumi' && (
          <YamazumiChart
            steps={steps}
            settings={settings}
            kpis={kpis}
            language={language}
            onUpdateStep={handleUpdateStep}
            onSelectStep={(step) => {
              setSelectedStep(step);
              setIsStepModalOpen(true);
            }}
            onAutoBalance={handleAutoBalance}
          />
        )}

        {currentView === 'bottleneck' && (
          <BottleneckAnalysis
            steps={steps}
            settings={settings}
            kpis={kpis}
            language={language}
            onApplyPreset={handleSelectPreset}
            onUpdateStep={handleUpdateStep}
          />
        )}

        {currentView === 'simulation' && (
          <LiveSimulation
            steps={steps}
            settings={settings}
            kpis={kpis}
            simulation={simulation}
            onToggleSimulation={() => setSimulation((prev) => ({ ...prev, isRunning: !prev.isRunning }))}
            onResetSimulation={() => setSimulation((prev) => ({
              ...prev,
              isRunning: false,
              elapsedSeconds: 0,
              totalProduced: 0,
              wipBuffers: steps.reduce((acc, s) => ({ ...acc, [s.id]: s.wipBefore }), {}),
            }))}
            onSpeedChange={(speed) => setSimulation((prev) => ({ ...prev, speed }))}
            language={language}
          />
        )}

        {currentView === 'kaizen' && (
          <KaizenOptimizer
            steps={steps}
            settings={settings}
            kpis={kpis}
            language={language}
            onUpdateStep={handleUpdateStep}
            onApplyKaizen={handleApplyKaizen}
            onResetToBaseline={() => handleSelectPreset('currentState')}
            onApplyAllKaizen={() => handleSelectPreset('balancedState')}
          />
        )}

        {currentView === 'manager' && (
          <ProcessManagerView
            steps={steps}
            settings={settings}
            kpis={kpis}
            language={language}
            onUpdateStep={handleUpdateStep}
            onAddStep={handleAddStep}
            onDeleteStep={handleDeleteStep}
            onDuplicateStep={handleDuplicateStep}
            onMoveStep={handleMoveStep}
            onOpenStepDetail={(step) => {
              setSelectedStep(step);
              setIsStepModalOpen(true);
            }}
            onResetToDefault={handleResetToDefault}
            onImportSteps={handleImportSteps}
          />
        )}
      </main>

      {/* Target Settings Modal */}
      <TargetSettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        settings={settings}
        onSave={(newSettings) => setSettings(newSettings)}
        language={language}
      />

      {/* Executive Printable Report Modal */}
      <ReportModal
        isOpen={isReportOpen}
        onClose={() => setIsReportOpen(false)}
        steps={steps}
        settings={settings}
        kpis={kpis}
        language={language}
      />

      {/* Workstation Detail & Tune Modal (Full CRUD & Kaizen editor) */}
      <StepDetailModal
        step={selectedStep}
        isOpen={isStepModalOpen}
        onClose={() => setIsStepModalOpen(false)}
        onSave={handleUpdateStep}
        onDelete={handleDeleteStep}
        onDuplicate={handleDuplicateStep}
        settings={settings}
        kpis={kpis}
        language={language}
      />
    </div>
  );
}
