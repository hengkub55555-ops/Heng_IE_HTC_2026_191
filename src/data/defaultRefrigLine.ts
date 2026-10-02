import { ProcessStep, LineSettings } from '../types/vsm';

export const DEFAULT_LINE_SETTINGS: LineSettings = {
  lineName: 'สายการผลิตตู้เย็น 2 ประตู No-Frost (Refrigeration Main Line #2)',
  targetUPH: 60, // 60 units/hr = 1 unit every 60 seconds (adjusted by net time ~55s)
  shiftHours: 8,
  shiftsPerDay: 2,
  plannedDowntimeMinutes: 40, // 2 x 15m tea breaks + 10m briefing
  workingDaysPerMonth: 24,
  customerDemandPerDay: 900,
  refrigerantType: 'R600a (Isobutane)',
};

export const INITIAL_PROCESS_STEPS: ProcessStep[] = [
  {
    id: 'op10-forming',
    stepNumber: 10,
    name: 'Outer Cabinet & Liner Thermoforming',
    nameTh: 'ขึ้นรูปตัวถังเหล็กและไลเนอร์พลาสติก',
    category: 'forming',
    cycleTime: 48,
    valueAddedTime: 40,
    nonValueAddedTime: 8,
    changeoverTime: 15,
    uptime: 94,
    scrapRate: 0.8,
    operators: 2,
    parallelStations: 1,
    wipBefore: 25,
    wipMaxLimit: 30,
    equipment: 'Automated Roll Former & Vacuum Thermoformer',
    descriptionTh: 'ตัดพับขึ้นรูปแผ่นเหล็กเคลือบสีด้านนอก และขึ้นรูปสุญญากาศ Liner พลาสติก HIPS ด้านในตู้',
    descriptionEn: 'Roll-forming prepainted steel outer shell & vacuum thermoforming inner plastic liner',
    kaizenBursts: [
      {
        id: 'kb-10-1',
        title: 'Auto-feed Sheet Feeder',
        titleTh: 'ติดตั้งระบบป้อนแผ่นเหล็กอัตโนมัติ',
        wasteType: 'Motion',
        wasteTypeTh: 'การเคลื่อนไหวสูญเปล่า',
        potentialReductionSec: 4,
        potentialCostThb: 120000,
        recommendation: 'Replace manual sheet lifting with pneumatic suction destacker to save 4s handling time.',
        recommendationTh: 'เปลี่ยนจากการยกแผ่นเหล็กด้วยมือเป็นระบบดูดแผ่นสุญญากาศ ลดเวลาหยิบชิ้นงานลง 4 วินาที',
        implemented: false,
      }
    ],
  },
  {
    id: 'op20-preassembly',
    stepNumber: 20,
    name: 'Cabinet Pre-Assembly & Tape Masking',
    nameTh: 'ประกอบชิ้นส่วนเบื้องต้นและติดเทปกันโฟมรั่ว',
    category: 'assembly',
    cycleTime: 52,
    valueAddedTime: 36,
    nonValueAddedTime: 16,
    changeoverTime: 5,
    uptime: 98,
    scrapRate: 0.4,
    operators: 3,
    parallelStations: 1,
    wipBefore: 18,
    wipMaxLimit: 25,
    equipment: 'Pre-assembly Fixture Table & Pneumatic Riveters',
    descriptionTh: 'ประกอบแผ่นหลัง ติดท่อ Suction tube ติดเทปอลูมิเนียมและเทปซีลขอบกันโฟมทะลัก',
    descriptionEn: 'Mount back panel, insert suction pipe, apply aluminum foil tape & foam sealing tape',
    kaizenBursts: [
      {
        id: 'kb-20-1',
        title: 'Pre-cut Foam Sealing Gaskets',
        titleTh: 'ใช้โฟมซีลตัดสำเร็จรูปพร้อมแถบกาวดึงง่าย',
        wasteType: 'Overprocessing',
        wasteTypeTh: 'กระบวนการเกินความจำเป็น',
        potentialReductionSec: 8,
        potentialCostThb: 35000,
        recommendation: 'Use die-cut adhesive foam gaskets instead of manually cutting roll tape.',
        recommendationTh: 'สั่งโฟมซีลไดคัทสำเร็จรูป ลดเวลาวัดและใช้กรรไกรตัดเทป ประหยัดเวลา 8 วินาที',
        implemented: false,
      }
    ],
  },
  {
    id: 'op30-foaming',
    stepNumber: 30,
    name: 'Polyurethane (PU) Foam High-Pressure Injection & Curing',
    nameTh: 'ฉีดโฟมฉนวนกันความร้อน PU และอบบ่มตัวในจิ๊ก',
    category: 'insulation',
    cycleTime: 110, // Severe bottleneck when single fixture!
    valueAddedTime: 95, // Chemical reaction & cure
    nonValueAddedTime: 15, // Clamping, nozzle insertion, unclamp
    changeoverTime: 20,
    uptime: 92,
    scrapRate: 1.5,
    operators: 3,
    parallelStations: 1, // Single fixture = 110s CT! If 2 parallel fixtures -> 55s
    wipBefore: 45, // Heavy buffer pileup before bottleneck!
    wipMaxLimit: 40,
    equipment: 'High-Pressure Polyol/Isocyanate Metering & Heated Mold Fixture',
    descriptionTh: 'ฉีดสารผสม Polyol + Isocyanate ไฮเพรสเชอร์เข้าช่องว่างระหว่างโครงตู้และบ่มตัวในแม่พิมพ์ควบคุมอุณหภูมิ',
    descriptionEn: 'High-pressure Polyurethane injection & heated curing mold fixture for thermal insulation',
    kaizenBursts: [
      {
        id: 'kb-30-1',
        title: 'Add Dual Fixture / Carousel Mold',
        titleTh: 'เพิ่มจิ๊กแม่พิมพ์คู่ขนาน (Dual Parallel Fixture)',
        wasteType: 'Waiting',
        wasteTypeTh: 'การรอคอย (คอขวดหลัก)',
        potentialReductionSec: 55,
        potentialCostThb: 650000,
        recommendation: 'Install 2nd curing jig to run injection in parallel, halving station cycle time from 110s to 55s.',
        recommendationTh: 'เพิ่มจิ๊กฉีดโฟมตัวที่ 2 ทำงานคู่ขนานกัน ทำให้เวลาต่อสถานีลดลงเหลือ 55 วินาที ทะลวงคอขวดหลักทันที',
        implemented: false,
      },
      {
        id: 'kb-30-2',
        title: 'Raw Material Temperature Pre-Conditioning',
        titleTh: 'ควบคุมอุณหภูมิวัตถุดิบและแม่พิมพ์ให้พร้อมทำปฏิกิริยาเร็วขึ้น',
        wasteType: 'Overprocessing',
        wasteTypeTh: 'ลดเวลาบ่มตัว',
        potentialReductionSec: 10,
        potentialCostThb: 80000,
        recommendation: 'Preheat raw materials to 24°C to accelerate chemical cream/gel time safely by 10s.',
        recommendationTh: 'ปรับอุณหภูมิสารเคมีก่อนฉีดที่ 24°C คงที่ ช่วยลดระยะเวลาบ่มตัวลงได้ 10 วินาที',
        implemented: false,
      }
    ],
  },
  {
    id: 'op40-doorassembly',
    stepNumber: 40,
    name: 'Door Assembly & Magnetic Gasket Insertion',
    nameTh: 'ประกอบบานประตูและใส่ยางขอบประตูแม่เหล็ก',
    category: 'assembly',
    cycleTime: 50,
    valueAddedTime: 42,
    nonValueAddedTime: 8,
    changeoverTime: 5,
    uptime: 97,
    scrapRate: 0.3,
    operators: 2,
    parallelStations: 1,
    wipBefore: 12,
    wipMaxLimit: 20,
    equipment: 'Gasket Roller Press & Hinge Alignment Jig',
    descriptionTh: 'ใส่โฟมบานประตู ติดตั้งยางขอบประตูพร้อมแถบแม่เหล็ก และประกอบบานพับประตูเข้าตัวตู้',
    descriptionEn: 'Assemble foamed door, press-fit magnetic seal gasket, and hang door onto cabinet hinges',
    kaizenBursts: [
      {
        id: 'kb-40-1',
        title: 'Ergonomic 4-Corner Gasket Roller',
        titleTh: 'อุปกรณ์กดร่องยางขอบประตู 4 มุมพร้อมกัน',
        wasteType: 'Motion',
        wasteTypeTh: 'การเคลื่อนไหวสูญเปล่า',
        potentialReductionSec: 6,
        potentialCostThb: 25000,
        recommendation: 'Use guided corner press roller rather than manual thumb pushing around perimeter.',
        recommendationTh: 'ใช้ลูกกลิ้งรางคู่กดขอบยางแทนการใช้นิ้วมือกดไล่รอบบาน ลดความเมื่อยล้าและประหยัด 6 วินาที',
        implemented: false,
      }
    ],
  },
  {
    id: 'op50-brazing',
    stepNumber: 50,
    name: 'Cooling System Brazing (Compressor, Evap & Condenser)',
    nameTh: 'เชื่อมท่อระบบทำความเย็น (คอมเพรสเซอร์ คอยล์เย็น คอยล์ร้อน)',
    category: 'piping',
    cycleTime: 54,
    valueAddedTime: 46,
    nonValueAddedTime: 8,
    changeoverTime: 10,
    uptime: 95,
    scrapRate: 0.9,
    operators: 2,
    parallelStations: 1,
    wipBefore: 14,
    wipMaxLimit: 20,
    equipment: 'Oxy-Acetylene / Induction Brazing Torches & Nitrogen Purge Line',
    descriptionTh: 'ติดตั้งคอมเพรสเซอร์ เชื่อมท่อทองแดง Suction/Discharge ท่อดรายเออร์ (Filter Drier) พร้อมเป่าไนโตรเจนป้องกันออกไซด์',
    descriptionEn: 'Mount compressor, braze copper-copper & copper-steel joints with N2 shielding gas',
    kaizenBursts: [
      {
        id: 'kb-50-1',
        title: 'Pre-formed Solder Rings & Induction Brazing',
        titleTh: 'ใช้แหวนเชื่อมเงินขึ้นรูปและหัวเชื่อมแม่เหล็กไฟฟ้าเหนี่ยวนำ',
        wasteType: 'Defects',
        wasteTypeTh: 'ลดของเสียรอยรั่วและเวลาเชื่อม',
        potentialReductionSec: 8,
        potentialCostThb: 180000,
        recommendation: 'Adopt preformed alloy rings with semi-auto induction head for 0-leak uniform brazing.',
        recommendationTh: 'ใช้แหวนลวดเชื่อมสำเร็จรูปพร้อมหัวเชื่อมเหนี่ยวนำ รอยเชื่อมมาตรฐาน ไม่รั่วซึม ประหยัด 8 วินาที',
        implemented: false,
      }
    ],
  },
  {
    id: 'op60-evacuation',
    stepNumber: 60,
    name: 'Deep Vacuum Evacuation & Helium Leak Test',
    nameTh: 'ทำสุญญากาศระบบ (Deep Vacuum) และทดสอบรอยรั่วฮีเลียม',
    category: 'testing',
    cycleTime: 85, // Secondary bottleneck when single station!
    valueAddedTime: 72, // Vacuum pull down
    nonValueAddedTime: 13, // Coupler hookup & sniffer check
    changeoverTime: 10,
    uptime: 93,
    scrapRate: 1.1,
    operators: 2,
    parallelStations: 1, // With 2 stations -> 42.5s
    wipBefore: 32, // Large WIP buffer building up
    wipMaxLimit: 30,
    equipment: 'High-Vacuum Rotary Vane + Roots Booster & Helium Mass Spectrometer',
    descriptionTh: 'ดูดอากาศและความชื้นในระบบท่อจนเหลือต่ำกว่า 50 Microns และทดสอบรอยรั่วระดับไมโครด้วยก๊าซฮีเลียม',
    descriptionEn: 'Deep vacuum evacuation (<50 microns) to purge moisture and Helium vacuum chamber leak testing',
    kaizenBursts: [
      {
        id: 'kb-60-1',
        title: 'Dual Manifold Vacuum Quick-Couplers & Parallel Pumping Bay',
        titleTh: 'เพิ่มช่องต่อแวคคั่มคู่ขนาน (Dual Parallel Vacuum Bay)',
        wasteType: 'Waiting',
        wasteTypeTh: 'การรอคอยสูญเปล่า (คอขวดที่สอง)',
        potentialReductionSec: 42,
        potentialCostThb: 380000,
        recommendation: 'Split vacuum process across 2 parallel stations to lower cycle time to 42.5s.',
        recommendationTh: 'เพิ่มจุดต่อแวคคั่มคู่ขนาน 2 หัว เพื่อแบ่งถ่ายโหลดสูญญากาศ ลดเวลาสถานีเหลือ 42.5 วินาที',
        implemented: false,
      }
    ],
  },
  {
    id: 'op70-charging',
    stepNumber: 70,
    name: 'Precision Refrigerant Charging & Ultrasonic Pinch-off',
    nameTh: 'อัดก๊าซสารทำความเย็น R600a และบีบเชื่อมปลายท่อ',
    category: 'piping',
    cycleTime: 44,
    valueAddedTime: 38,
    nonValueAddedTime: 6,
    changeoverTime: 10,
    uptime: 96,
    scrapRate: 0.2,
    operators: 1,
    parallelStations: 1,
    wipBefore: 8,
    wipMaxLimit: 15,
    equipment: 'Atex-Certified Explosion Proof R600a Charging Station & Ultrasonic Tube Sealer',
    descriptionTh: 'เติมสารทำความเย็น R600a ด้วยเครื่องชั่ง Coriolis ความแม่นยำ ±0.5g และปิดผนึกปลายท่อด้วยคลื่นอัลตราโซนิก',
    descriptionEn: 'Precision R600a hydrocarbon charging (±0.5g) followed by ultrasonic tube pinch & braze seal',
    kaizenBursts: [
      {
        id: 'kb-70-1',
        title: 'Auto-clamp Gas Injector Adapter',
        titleTh: 'หัวต่อเติมน้ำยาแบบปลดเร็วอัตโนมัติ (Pneumatic Quick Clamp)',
        wasteType: 'Motion',
        wasteTypeTh: 'การเคลื่อนไหว',
        potentialReductionSec: 4,
        potentialCostThb: 45000,
        recommendation: 'Replace twist screw connector with one-touch pneumatic clamp.',
        recommendationTh: 'เปลี่ยนหัวต่อขันเกลียวเป็นหัวสวมเร็วลมวันทัช ประหยัดเวลาต่อสาย 4 วินาที',
        implemented: false,
      }
    ],
  },
  {
    id: 'op80-electrical',
    stepNumber: 80,
    name: 'Wiring Harness, Inverter Inverter Board & Hipot Safety Test',
    nameTh: 'เดินสายไฟ บอร์ดอินเวอร์เตอร์ และทดสอบความปลอดภัยทางไฟฟ้า Hipot',
    category: 'assembly',
    cycleTime: 46,
    valueAddedTime: 37,
    nonValueAddedTime: 9,
    changeoverTime: 5,
    uptime: 98,
    scrapRate: 0.2,
    operators: 2,
    parallelStations: 1,
    wipBefore: 10,
    wipMaxLimit: 15,
    equipment: 'Multi-function Electrical Safety Tester (Dielectric Hipot, Insulation, Ground Bond)',
    descriptionTh: 'เชื่อมต่อชุดสายไฟหลัก แผงควบคุม Inverter PCB ติดตั้งเซนเซอร์อุณหภูมิ และทดสอบความเป็นฉนวนทางไฟฟ้าตามมาตรฐาน มอก.',
    descriptionEn: 'Connect wire harness, inverter PCB, NTC sensors, and automated Hipot/Ground bond safety validation',
    kaizenBursts: [
      {
        id: 'kb-80-1',
        title: 'Color-Coded Poka-Yoke Connectors',
        titleTh: 'ปลั๊กไฟรหัสสีป้องกันการเสียบผิด (Poka-Yoke)',
        wasteType: 'Defects',
        wasteTypeTh: 'ลดความผิดพลาดในการต่อสาย',
        potentialReductionSec: 5,
        potentialCostThb: 15000,
        recommendation: 'Standardize keyed harness connectors to eliminate miswiring inspections.',
        recommendationTh: 'ใช้หัวต่อสายไฟที่มีบ่าล็อกต่างกันตามสี เสียบผิดขั้วไม่ได้ ลดเวลาตรวจซ้ำ 5 วินาที',
        implemented: false,
      }
    ],
  },
  {
    id: 'op90-runtest',
    stepNumber: 90,
    name: 'Dynamic Pull-Down Cooling Run Test (Chamber Multi-bay)',
    nameTh: 'ทดสอบการทำงานระบบทำความเย็นจริงในห้องทดสอบ (Run Test Bay)',
    category: 'testing',
    cycleTime: 50, // Effective pace out of carousel buffer
    valueAddedTime: 45,
    nonValueAddedTime: 5,
    changeoverTime: 0,
    uptime: 95,
    scrapRate: 0.6,
    operators: 2,
    parallelStations: 1,
    wipBefore: 15,
    wipMaxLimit: 25,
    equipment: 'Automated Carousel Run-Test Conveyor with Barcode Wireless Telemetry',
    descriptionTh: 'จ่ายกระแสไฟฟ้าเดินเครื่องจริง วัดอุณหภูมิ Pull-down ของช่องแช่แข็งและช่องแช่เย็น ตรวจสอบกำลังไฟฟ้าและเสียงผิดปกติ',
    descriptionEn: 'Continuous carousel run-test measuring pull-down cooling curve, wattage, inverter sound and defrost cycle',
    kaizenBursts: [
      {
        id: 'kb-90-1',
        title: 'Wireless IR Surface Temp Sensors',
        titleTh: 'ใช้กล้องตรวจจับความร้อนอินฟราเรดอัตโนมัติ',
        wasteType: 'Overprocessing',
        wasteTypeTh: 'เวลาเสียบสายเซนเซอร์',
        potentialReductionSec: 6,
        potentialCostThb: 95000,
        recommendation: 'Replace manual probe stick insertion with non-contact infrared thermal imaging array.',
        recommendationTh: 'ใช้เซนเซอร์วัดอุณหภูมิแบบไม่สัมผัส IR Array แทนการเสียบสายเทอร์โมคัปเปิลด้วยมือ ลดเวลา 6 วินาที',
        implemented: false,
      }
    ],
  },
  {
    id: 'op100-packaging',
    stepNumber: 100,
    name: 'Final Quality Inspection, Labeling & Auto-Carton Packaging',
    nameTh: 'ตรวจสอบคุณภาพขั้นสุดท้าย ติดฉลากประหยัดไฟเบอร์ 5 และบรรจุกล่อง',
    category: 'packaging',
    cycleTime: 42,
    valueAddedTime: 34,
    nonValueAddedTime: 8,
    changeoverTime: 10,
    uptime: 99,
    scrapRate: 0.1,
    operators: 2,
    parallelStations: 1,
    wipBefore: 8,
    wipMaxLimit: 15,
    equipment: 'Cosmetic Lighting Booth, Barcode Scanner, Auto Carton Packer & Strapping Machine',
    descriptionTh: 'เช็ดทำความสะอาดผิวด้านนอก ตรวจสอบความเรียบร้อย ไร้รอยขีดข่วน ติดฉลาก มอก. เบอร์ 5 และครอบกล่องลูกฟูกรัดสาย',
    descriptionEn: 'Surface cleaning, optical scratch check, energy label application, carton sleeve drop and strapping',
    kaizenBursts: [
      {
        id: 'kb-100-1',
        title: 'Automated Top-Cap Carton Feeder',
        titleTh: 'ชุดครอบกล่องกระดาษอัตโนมัติ',
        wasteType: 'Motion',
        wasteTypeTh: 'การยกและคลี่กล่องด้วยมือ',
        potentialReductionSec: 6,
        potentialCostThb: 150000,
        recommendation: 'Automate carton sleeve dropping over finished refrigerator.',
        recommendationTh: 'ติดตั้งแขนกลสวมกล่องลูกฟูกอัตโนมัติ ลดแรงงานและประหยัด 6 วินาที',
        implemented: false,
      }
    ],
  },
];

export const PRESET_SCENARIOS = {
  currentState: {
    name: 'Current State (มีคอขวดสะสมรุนแรง)',
    nameEn: 'Current State (Severe Bottlenecks)',
    description: 'สภาวะปัจจุบัน: จุดฉีดโฟม PU (Op 30) มีเพียง 1 จิ๊ก (CT 110s) และจุดแวคคั่ม (Op 60) มี 1 หัว (CT 85s) ทำให้สายผลิตจริงได้เพียง ~32 UPH จากเป้าหมาย 60 UPH และเกิดกอง WIP สะสมมหาศาล',
    steps: INITIAL_PROCESS_STEPS,
  },
  balancedState: {
    name: 'Kaizen Future State (สมดุลสายการผลิต Balanced Line)',
    nameEn: 'Kaizen Future State (Fully Balanced)',
    description: 'ปรับปรุงแบบลีน: เพิ่มจิ๊กฉีดโฟมคู่ขนาน (Dual Foaming Jig 2 สถานี -> Eff CT 55s), เพิ่มจุดต่อสุญญากาศคู่ขนาน (2 Vacuum stations -> Eff CT 42.5s), ลด NVA จากการเตรียมชิ้นงาน บรรลุเป้าหมาย 60 UPH!',
    steps: INITIAL_PROCESS_STEPS.map((step) => {
      if (step.id === 'op30-foaming') {
        return {
          ...step,
          parallelStations: 2, // 110 / 2 = 55s
          nonValueAddedTime: 10,
          wipBefore: 12,
          kaizenBursts: step.kaizenBursts.map((k) => ({ ...k, implemented: true })),
        };
      }
      if (step.id === 'op60-evacuation') {
        return {
          ...step,
          parallelStations: 2, // 85 / 2 = 42.5s
          nonValueAddedTime: 8,
          wipBefore: 10,
          kaizenBursts: step.kaizenBursts.map((k) => ({ ...k, implemented: true })),
        };
      }
      if (step.id === 'op20-preassembly') {
        return {
          ...step,
          cycleTime: 44,
          nonValueAddedTime: 8,
          wipBefore: 10,
          kaizenBursts: step.kaizenBursts.map((k) => ({ ...k, implemented: true })),
        };
      }
      return {
        ...step,
        wipBefore: Math.min(step.wipBefore, 10),
      };
    }),
  },
  highSpeedState: {
    name: 'High-Speed Automated (75 UPH Benchmark)',
    nameEn: 'High-Speed 75 UPH Benchmark',
    description: 'สายการผลิตขั้นสูง: โรตารี่คารูเซลฉีดโฟม 3 แท่น, ระบบตรวจจับรอยรั่วฮีเลียมสูญญากาศคู่, หัวเชื่อมเหนี่ยวนำกึ่งอัตโนมัติ รอบเวลาทุกขั้นตอนไม่เกิน 48 วินาที ผลิตได้ 75 UPH',
    steps: INITIAL_PROCESS_STEPS.map((step) => {
      let parallel = step.parallelStations;
      let ct = step.cycleTime;
      let nva = Math.round(step.nonValueAddedTime * 0.6);
      let va = step.valueAddedTime;

      if (step.id === 'op30-foaming') {
        parallel = 3; // 110 / 3 = 36.6s
      } else if (step.id === 'op60-evacuation') {
        parallel = 2; // 85 / 2 = 42.5s
      } else {
        ct = Math.min(ct, 46);
      }

      return {
        ...step,
        cycleTime: ct,
        valueAddedTime: va,
        nonValueAddedTime: nva,
        parallelStations: parallel,
        wipBefore: 6,
        uptime: Math.min(99, step.uptime + 2),
        kaizenBursts: step.kaizenBursts.map((k) => ({ ...k, implemented: true })),
      };
    }),
  },
};
