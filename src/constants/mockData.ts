import { Bid } from '../types';

export const DEFAULT_BID_VALUES = {
  contractTermMonths: 36,
  cpiEscalationPercent: 3,
  fuelSurchargePercent: 10,
  environmentalFeePercent: 5
};

export const INITIAL_BIDS: Bid[] = [
  {
    id: 'bid-1',
    haulerName: 'Waste Management (Current)',
    contractTermMonths: 36,
    cpiEscalationPercent: 4,
    fuelSurchargePercent: 12,
    environmentalFeePercent: 5,
    services: [
      {
        id: 's1',
        stream: 'MSW',
        containerSize: '8yd',
        frequency: '3xw',
        quantity: 1,
        baseRate: 450,
        unitPrice: 0,
      },
      {
        id: 's2',
        stream: 'REC',
        containerSize: '6yd',
        frequency: '1xw',
        quantity: 1,
        baseRate: 120,
        unitPrice: 0,
      }
    ],
    fees: [
      { id: 'f1', name: 'Administrative Fee', type: 'Fixed', value: 15 },
      { id: 'f2', name: 'Regulatory Cost Recovery', type: 'Percentage', value: 3.5 }
    ]
  },
  {
    id: 'bid-2',
    haulerName: 'Republic Services',
    contractTermMonths: 36,
    cpiEscalationPercent: 3,
    fuelSurchargePercent: 10,
    environmentalFeePercent: 4,
    services: [
      {
        id: 's3',
        stream: 'MSW',
        containerSize: '8yd',
        frequency: '3xw',
        quantity: 1,
        baseRate: 410,
        unitPrice: 0,
      },
      {
        id: 's4',
        stream: 'REC',
        containerSize: '6yd',
        frequency: '1xw',
        quantity: 1,
        baseRate: 105,
        unitPrice: 0,
      }
    ],
    fees: [
      { id: 'f3', name: 'Admin Fee', type: 'Fixed', value: 12 },
      { id: 'f4', name: 'Environmental Charge', type: 'Percentage', value: 2.5 }
    ]
  }
];
