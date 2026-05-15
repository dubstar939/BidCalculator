export type WasteStreamType = 'MSW' | 'REC' | 'OCC';

export interface ContainerSize {
  id: string;
  size: string; // e.g., "2 Yard", "4 Yard", "6 Yard", "8 Yard", "30 Yard Roll-off"
  type: 'Front Load' | 'Roll-off' | 'Compactor';
}

export interface Frequency {
  id: string;
  label: string; // e.g., "1x/week", "2x/week", "On Call"
  multiplier: number; // times per month (approx) or per week
}

export interface Fee {
  id: string;
  name: string;
  type: 'Fixed' | 'Percentage' | 'Per Haul' | 'Per Ton' | 'Per Service' | 'Per Load';
  value: number;
  description?: string;
}

export interface WasteService {
  id: string;
  stream: WasteStreamType;
  containerSize: string;
  frequency: string;
  quantity: number;
  baseRate: number; // Monthly base rate or per-haul rate
  unitPrice: number; 
  estimatedTonsPerMonth?: number;
  estimatedHaulsPerMonth?: number;
}

export interface Bid {
  id: string;
  haulerName: string;
  services: WasteService[];
  fees: Fee[];
  contractTermMonths: number;
  cpiEscalationPercent: number;
  fuelSurchargePercent: number;
  environmentalFeePercent: number;
  notes?: string;
  comparativeNotes?: string;
}

export interface CalculationResults {
  monthlySubtotal: number;
  monthlyFees: number;
  monthlyTotal: number;
  annualTotal: number;
  contractTermTotal: number;
  totalEstimatedTons: number;
  totalEstimatedHauls: number;
  breakdown: {
    services: number;
    fixedFees: number;
    percentageFees: number;
    perHaulFees: number;
    perTonFees: number;
    perLoadFees: number;
    variableFees: number;
  };
}

export const WASTE_STREAMS: WasteStreamType[] = ['MSW', 'REC', 'OCC'];

export const CONTAINER_SIZES: ContainerSize[] = [
  { id: '2yd', size: '2 Yard', type: 'Front Load' },
  { id: '4yd', size: '4 Yard', type: 'Front Load' },
  { id: '6yd', size: '6 Yard', type: 'Front Load' },
  { id: '8yd', size: '8 Yard', type: 'Front Load' },
  { id: '30yd', size: '30 Yard', type: 'Roll-off' },
  { id: '40yd', size: '40 Yard', type: 'Roll-off' },
];

export const FREQUENCIES: Frequency[] = [
  { id: '1xw', label: '1x/week', multiplier: 4.33 },
  { id: '2xw', label: '2x/week', multiplier: 8.66 },
  { id: '3xw', label: '3x/week', multiplier: 13 },
  { id: '4xw', label: '4x/week', multiplier: 17.33 },
  { id: '5xw', label: '5x/week', multiplier: 21.66 },
  { id: '6xw', label: '6x/week', multiplier: 26 },
  { id: 'oncall', label: 'On Call', multiplier: 1 },
];
