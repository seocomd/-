import { STATION_IMAGES } from './modelImages';

export interface ModelSpec {
  name: string;
  nominalPowerKw: number;
  imageUrl?: string;
  
  // Engine (ДВС)
  engineModel: string;
  engineType: string;
  displacementL: string;
  cylinders: string;
  controlSystem: string;
  injectionSystem: string;
  aspiration: string;
  coolingL: string;
  lubeL: string;
  fuelCons100: number; // l/h
  fuelCons75: number;  // l/h
  fuelCons50: number;  // l/h
  oilConsRel: string;  // % relatively to fuel
  oilConsUdel: string; // specific g/kWh
  sysVoltage: string;  // V

  // Generator (Генератор)
  generatorModel: string;
  genType: string;
  genAmps: string;
  genKw: number;
  genCosPhi: string;
  genEff100: string;
  genEff90: string;
  genExcitation: string;
  genRegulator: string;
  genOverload: string;
  genShortCircuit: string;
  genWindings: string;
  genProtection: string;
  genInsulation: string;

  // DES (ДЭС)
  controller: string;
  fuelTankL: number;
  unattended75: string;
  unattended100: string;
  electricityClass: string;
  minLoad: string;
  serviceInterval: string;
  
  // Dimensions (ДхШхВ)
  dimOpen: string;
  dimEnclosure: string;
  dimContainer: string;
  
  // Weights
  weightOpen: string;
  weightEnclosure: string;
  weightContainer: string;
}

export interface Manufacturer {
  id: string;
  name: string;
  models: ModelSpec[];
}

const createModel = (brand: string, power: number, nameSuffix: string = ""): ModelSpec => {
  const modelName = `АД-${power} (${brand}${nameSuffix})`;
  
  // Enhanced lookup
  let imageUrl = STATION_IMAGES[modelName] || 
                 STATION_IMAGES[`Дизельный генератор ${modelName}`] || 
                 STATION_IMAGES[`Дизельная электростанция ${modelName}`];
  
  if (!imageUrl) {
    const fuzzyKey = Object.keys(STATION_IMAGES).find(k => k.includes(modelName));
    if (fuzzyKey) imageUrl = STATION_IMAGES[fuzzyKey];
  }

  return {
    name: modelName,
    nominalPowerKw: power,
    imageUrl,
    engineModel: `${brand.toUpperCase()}-E${power}`,
    engineType: "дизельный",
    displacementL: (power / 22).toFixed(1),
    cylinders: power > 350 ? "12-цилиндровый, V-образный" : (power > 150 ? "6-цилиндровый, V-образный" : "4-цилиндровый, рядный"),
    controlSystem: "электронный рег. об",
    injectionSystem: "Common Rail / Прямой впрыск",
    aspiration: power > 20 ? "Турбонаддув с интеркулером" : "Атмосферный",
    coolingL: (power / 4).toFixed(0),
    lubeL: (power / 12).toFixed(0),
    fuelCons100: parseFloat((power * 0.26).toFixed(1)),
    fuelCons75: parseFloat((power * 0.19).toFixed(1)),
    fuelCons50: parseFloat((power * 0.14).toFixed(1)),
    oilConsRel: "≤ 0,15%",
    oilConsUdel: "≤ 0,1 г/кВт*ч",
    sysVoltage: power > 30 ? "24 В" : "12 В",
    generatorModel: `STC-${power}`,
    genType: "синхронный, бесщеточный",
    genAmps: `${(power * 1.8).toFixed(0)} А`,
    genKw: power,
    genCosPhi: "0,8",
    genEff100: "93,5%",
    genEff90: "92,8%",
    genExcitation: "SHUNT / PMG",
    genRegulator: "AVR",
    genOverload: "110% в течение 1ч",
    genShortCircuit: "300% (3In) в течение 10с",
    genWindings: "шаг 2/3",
    genProtection: "IP 23",
    genInsulation: "Класс H",
    controller: "ComAp InteliLite (Чехия)",
    fuelTankL: Math.round(power * 2.5),
    unattended75: "12 ч",
    unattended100: "8 ч",
    electricityClass: "G3",
    minLoad: "25%",
    serviceInterval: "500 м.ч.",
    dimOpen: `${1400 + power}x800x1200`,
    dimEnclosure: `${1800 + power}x1000x1500`,
    dimContainer: `${3000 + power}x2350x2400`,
    weightOpen: (600 + power * 6).toString(),
    weightEnclosure: (900 + power * 7.5).toString(),
    weightContainer: (2500 + power * 9).toString()
  };
};

export const specsData: Manufacturer[] = [
  {
    id: "yuchai",
    name: "Yuchai",
    models: [16, 24, 30, 32, 50, 60, 64, 80, 100, 108, 120, 150, 200, 250, 300, 320, 360, 400, 450, 500, 550, 600, 650, 730, 800, 900, 1000, 1100, 1200, 1350, 1500, 1600, 1800, 2000, 2200, 2400, 2500, 2700, 3000].map(p => createModel("Yuchai", p))
  },
  {
    id: "scania",
    name: "Scania",
    models: [200, 220, 240, 250, 265, 280, 290, 300, 320, 350, 360, 400, 440, 480, 500, 520, 550, 560].map(p => createModel("Scania", p))
  },
  {
    id: "iveco",
    name: "FPT-Iveco",
    models: [15, 16, 18, 20, 24, 25, 30, 32, 35, 40, 45, 50, 60, 70, 80, 85, 100, 110, 120, 130, 140, 150, 160, 180, 200, 220, 240, 250, 280, 300, 320, 350, 360, 400, 480, 500].map(p => createModel("FPT-Iveco", p))
  },
  {
    id: "mitsubishi",
    name: "Mitsubishi",
    models: [600, 615, 630, 700, 730, 800, 850, 1000, 1040, 1100, 1200, 1250, 1320, 1400, 1500, 1600, 1640, 1680, 1800, 1920, 2000].map(p => createModel("Mitsubishi", p))
  },
  {
    id: "baudouin",
    name: "Baudouin",
    models: [400, 500, 600, 700, 800, 900, 1000, 1100, 1200, 1400, 1500].map(p => createModel("Baudouin", p))
  },
  {
    id: "john-deere",
    name: "John Deere",
    models: [20, 24, 30, 32, 40, 48, 50, 60, 80, 100, 120, 140, 150].map(p => createModel("John Deere", p))
  },
  {
    id: "perkins",
    name: "Perkins",
    models: [10, 12, 15, 16, 20, 25, 30, 35, 40, 50, 60, 80, 100, 110, 120, 140, 150, 160, 500, 520, 600, 630, 640, 700, 720, 820, 1000, 1080, 1200, 1300, 1350, 1480, 1500, 1600, 1640, 1760, 1800, 2000].map(p => createModel("Perkins", p))
  },
  {
    id: "yanmar",
    name: "Yanmar",
    models: [8, 10, 12, 16, 24, 27, 32, 40, 44, 46].map(p => createModel("Yanmar", p))
  },
  {
    id: "industrial",
    name: "Industrial Engines",
    models: [400, 500, 600, 700, 800, 900, 1000, 1100, 1200, 1400, 1500].map(p => {
      const m = createModel("Industrial Engines", p);
      m.name = `Industrial Engines АД-${p}`;
      m.imageUrl = STATION_IMAGES[m.name];
      return m;
    })
  },
  {
    id: "volvo",
    name: "Volvo Penta",
    models: [60, 70, 80, 100, 120, 125, 150, 160, 200, 220, 240, 250, 280, 300, 320, 360, 400, 440, 450, 500, 560].map(p => createModel("Volvo Penta", p))
  },
  {
    id: "yamz",
    name: "ЯМЗ",
    models: [60, 70, 75, 80, 100, 120, 125, 150, 160, 180, 200, 220, 240, 250, 275, 300, 315, 320, 350, 360, 400].map(p => createModel("ЯМЗ", p))
  },
  {
    id: "mmz",
    name: "ММЗ",
    models: [10, 12, 15, 16, 18, 20, 25, 30, 35, 40, 50, 60, 70, 75, 80, 100].map(p => createModel("ММЗ", p))
  },
  {
    id: "tmz",
    name: "ТМЗ",
    models: [200, 250, 275, 300, 315].map(p => createModel("ТМЗ", p))
  }
];

