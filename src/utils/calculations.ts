import { Bid, CalculationResults, WasteService, Fee } from '../types';

export const calculateBidTotals = (bid: Bid): CalculationResults => {
  try {
    let monthlySubtotal = 0;
    let monthlyFixedFees = 0;
    let monthlyPercentageFees = 0;
    let monthlyPerHaulFees = 0;
    let monthlyPerTonFees = 0;
    let totalEstimatedHauls = 0;
    let totalEstimatedTons = 0;
    let totalServiceQuantity = 0;

    // Validate bid structure
    if (!bid || !Array.isArray(bid.services) || !Array.isArray(bid.fees)) {
      throw new Error('Invalid bid structure');
    }

    // Calculate services and gather metrics for fees
    bid.services.forEach(service => {
      const rate = Number(service.baseRate) || 0;
      const qty = Number(service.quantity) || 0;
      monthlySubtotal += rate * qty;
      totalServiceQuantity += qty;
      
      totalEstimatedHauls += (Number(service.estimatedHaulsPerMonth) || 0) * qty;
      totalEstimatedTons += (Number(service.estimatedTonsPerMonth) || 0) * qty;
    });

    // Calculate fees
    bid.fees.forEach(fee => {
      const val = Number(fee.value) || 0;
      if (fee.type === 'Fixed') {
        monthlyFixedFees += val;
      } else if (fee.type === 'Percentage') {
        monthlyPercentageFees += (monthlySubtotal * (val / 100));
      } else if (fee.type === 'Per Haul') {
        monthlyPerHaulFees += totalEstimatedHauls * val;
      } else if (fee.type === 'Per Ton') {
        monthlyPerTonFees += totalEstimatedTons * val;
      } else if (fee.type === 'Per Service') {
        monthlyFixedFees += totalServiceQuantity * val;
      }
    });

    // Add standard surcharges
    const fuelSurchargePercent = Number(bid.fuelSurchargePercent) || 0;
    const environmentalFeePercent = Number(bid.environmentalFeePercent) || 0;
    
    const fuelSurcharge = monthlySubtotal * (fuelSurchargePercent / 100);
    const environmentalFee = monthlySubtotal * (environmentalFeePercent / 100);
    
    monthlyPercentageFees += fuelSurcharge + environmentalFee;

    const monthlyVariableFees = monthlyPercentageFees + monthlyPerHaulFees + monthlyPerTonFees;
    const monthlyTotal = monthlySubtotal + monthlyFixedFees + monthlyVariableFees;
    
    // Annual total (first 12 months)
    const annualTotal = monthlyTotal * 12;
    
    // Contract term total with CPI escalation
    let contractTermTotal = 0;
    let currentMonthlyTotal = monthlyTotal;
    const termMonths = Math.max(0, Number(bid.contractTermMonths) || 0);
    const cpiPercent = Number(bid.cpiEscalationPercent) || 0;
    
    for (let year = 1; year <= Math.ceil(termMonths / 12); year++) {
      const monthsInYear = Math.min(12, termMonths - (year - 1) * 12);
      if (monthsInYear <= 0) break;
      
      contractTermTotal += currentMonthlyTotal * monthsInYear;
      // Apply escalation at the start of each subsequent year
      currentMonthlyTotal *= (1 + cpiPercent / 100);
    }

    // Final safety check for NaN/Infinity
    const sanitize = (n: number) => isFinite(n) ? n : 0;

    return {
      monthlySubtotal: sanitize(monthlySubtotal),
      monthlyFees: sanitize(monthlyFixedFees + monthlyVariableFees),
      monthlyTotal: sanitize(monthlyTotal),
      annualTotal: sanitize(annualTotal),
      contractTermTotal: sanitize(contractTermTotal),
      breakdown: {
        services: sanitize(monthlySubtotal),
        fixedFees: sanitize(monthlyFixedFees),
        percentageFees: sanitize(monthlyPercentageFees),
        perHaulFees: sanitize(monthlyPerHaulFees),
        perTonFees: sanitize(monthlyPerTonFees),
        variableFees: sanitize(monthlyVariableFees)
      }
    };
  } catch (error) {
    console.error('Calculation Error:', error);
    return {
      monthlySubtotal: 0,
      monthlyFees: 0,
      monthlyTotal: 0,
      annualTotal: 0,
      contractTermTotal: 0,
      breakdown: { 
        services: 0, 
        fixedFees: 0, 
        percentageFees: 0, 
        perHaulFees: 0, 
        perTonFees: 0, 
        variableFees: 0 
      }
    };
  }
};

export const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(value);
};
