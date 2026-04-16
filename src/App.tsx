import React, { useState, useMemo } from 'react';
import { 
  Trash2, 
  Plus, 
  TrendingDown, 
  TrendingUp, 
  DollarSign, 
  BarChart3, 
  PieChart as PieChartIcon,
  Download,
  Settings2, 
  Truck, 
  Info, 
  ChevronRight,
  Calculator,
  FileText,
  ArrowRightLeft,
  Moon,
  Sun
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  BarChart, 
  Bar, 
  PieChart,
  Pie,
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  Cell
} from 'recharts';
import { 
  Bid, 
  WasteService, 
  Fee, 
  WASTE_STREAMS, 
  CONTAINER_SIZES, 
  FREQUENCIES 
} from './types';
import { calculateBidTotals, formatCurrency } from './utils/calculations';
import { INITIAL_BIDS, DEFAULT_BID_VALUES } from './constants/mockData';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const FEE_TYPE_TOOLTIPS = {
  'Fixed': 'A flat monthly charge regardless of service volume.',
  'Percentage': 'Calculated as a percentage of the base service subtotal.',
  'Per Haul': 'Charged every time a container is emptied.',
  'Per Ton': 'Charged based on the actual weight of waste collected.',
  'Per Service': 'Charged for each service line item included in the bid.'
};

export default function App() {
  const [bids, setBids] = useState<Bid[]>(INITIAL_BIDS);
  const [selectedBidId, setSelectedBidId] = useState<string | null>(INITIAL_BIDS[0].id);
  const [selectedCompareIds, setSelectedCompareIds] = useState<string[]>([]);
  const [clientName, setClientName] = useState('Acme Corp');
  const [isEditing, setIsEditing] = useState(false);
  const [darkMode, setDarkMode] = useState(false);

  const selectedBid = useMemo(() => 
    bids.find(b => b.id === selectedBidId) || null
  , [bids, selectedBidId]);

  const bidResults = useMemo(() => 
    bids.map(bid => ({
      bid,
      results: calculateBidTotals(bid)
    }))
  , [bids]);

  const chartData = useMemo(() => 
    bidResults.map(({ bid, results }) => ({
      name: bid.haulerName,
      'Monthly Total': results.monthlyTotal,
      'Annual Total': results.annualTotal / 12, // For scaling
      'Contract Total': results.contractTermTotal / bid.contractTermMonths // For scaling
    }))
  , [bidResults]);

  const handleAddBid = () => {
    const newBid: Bid = {
      id: `bid-${Date.now()}`,
      haulerName: 'New Hauler',
      ...DEFAULT_BID_VALUES,
      services: [],
      fees: [],
      notes: ''
    };
    setBids([...bids, newBid]);
    setSelectedBidId(newBid.id);
    setIsEditing(true);
  };

  const handleDeleteBid = (id: string) => {
    const newBids = bids.filter(b => b.id !== id);
    setBids(newBids);
    if (selectedBidId === id) {
      setSelectedBidId(newBids[0]?.id || null);
    }
  };

  const updateBid = (updatedBid: Bid) => {
    setBids(bids.map(b => b.id === updatedBid.id ? updatedBid : b));
  };

  const handleExportCSV = () => {
    if (!selectedBid) return;
    
    const results = calculateBidTotals(selectedBid);
    const rows = [
      ['Bid Details', ''],
      ['Hauler Name', `"${selectedBid.haulerName}"`],
      ['Contract Term', `"${selectedBid.contractTermMonths} months"`],
      ['CPI Escalation', `"${selectedBid.cpiEscalationPercent}%"`],
      ['Fuel Surcharge', `"${selectedBid.fuelSurchargePercent}%"`],
      ['Environmental Fee', `"${selectedBid.environmentalFeePercent}%"`],
      [''],
      ['Summary', ''],
      ['Monthly Subtotal', results.monthlySubtotal],
      ['Monthly Fees', results.monthlyFees],
      ['Monthly Total', results.monthlyTotal],
      ['Annual Total', results.annualTotal],
      ['Contract Term Total', results.contractTermTotal],
      [''],
      ['Waste Services', ''],
      ['Stream', 'Container Size', 'Frequency', 'Quantity', 'Base Rate', 'Total'],
      ...selectedBid.services.map(s => [
        s.stream, 
        `"${s.containerSize}"`, 
        `"${s.frequency}"`, 
        s.quantity, 
        s.baseRate, 
        s.baseRate * s.quantity
      ]),
      [''],
      ['Additional Fees', ''],
      ['Name', 'Type', 'Value', 'Description'],
      ...selectedBid.fees.map(f => [
        `"${f.name}"`, 
        f.type, 
        f.value, 
        `"${f.description || ''}"`
      ])
    ];

    const csvContent = rows.map(e => e.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `${selectedBid.haulerName.replace(/\s+/g, '_')}_Bid.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className={cn(
      "min-h-screen font-sans transition-colors duration-300",
      darkMode ? "bg-slate-950 text-slate-100" : "bg-slate-50 text-slate-900"
    )}>
      {/* Header */}
      <header className={cn(
        "border-b sticky top-0 z-10 transition-colors",
        darkMode ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200"
      )}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-blue-600 p-2 rounded-lg">
              <Truck className="w-6 h-6 text-white" />
            </div>
            <div className="flex flex-col">
              <h1 className={cn(
                "text-xl font-bold tracking-tight leading-none",
                darkMode ? "text-white" : "text-slate-900"
              )}>Bidout Master</h1>
              <div className="flex items-center gap-1 mt-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Client:</span>
                <input 
                  type="text"
                  value={clientName}
                  onChange={(e) => setClientName(e.target.value)}
                  className={cn(
                    "text-[10px] font-bold bg-transparent border-none p-0 focus:ring-0 w-32",
                    darkMode ? "text-blue-400" : "text-blue-600"
                  )}
                />
              </div>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setDarkMode(!darkMode)}
              className={cn(
                "p-2 rounded-lg transition-colors",
                darkMode ? "bg-slate-800 text-yellow-400 hover:bg-slate-700" : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              )}
            >
              {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>
            <button 
              onClick={handleAddBid}
              className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors shadow-sm"
            >
              <Plus className="w-4 h-4" />
              New Bid
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Sidebar: Bid List */}
          <div className="lg:col-span-4 space-y-6">
            <section>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wider">Active Bids</h2>
                <span className="text-xs font-medium bg-slate-200 text-slate-600 px-2 py-0.5 rounded-full">{bids.length}</span>
              </div>
                      <div className="space-y-3">
                {bids.map(bid => {
                  const results = calculateBidTotals(bid);
                  const isSelected = selectedBidId === bid.id;
                  const isComparing = selectedCompareIds.includes(bid.id);
                  
                  return (
                    <motion.div
                      key={bid.id}
                      layout
                      onClick={() => setSelectedBidId(bid.id)}
                      className={cn(
                        "p-4 rounded-xl border cursor-pointer transition-all group relative",
                        isSelected 
                          ? (darkMode ? "bg-slate-800 border-blue-500 shadow-lg ring-1 ring-blue-500" : "bg-white border-blue-500 shadow-md ring-1 ring-blue-500")
                          : (darkMode ? "bg-slate-900 border-slate-800 hover:border-slate-700" : "bg-white border-slate-200 hover:border-slate-300 hover:shadow-sm")
                      )}
                    >
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex items-center gap-2 truncate pr-8">
                          <input 
                            type="checkbox"
                            checked={isComparing}
                            onChange={(e) => {
                              e.stopPropagation();
                              if (e.target.checked) {
                                setSelectedCompareIds([...selectedCompareIds, bid.id]);
                              } else {
                                setSelectedCompareIds(selectedCompareIds.filter(id => id !== bid.id));
                              }
                            }}
                            className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                          />
                          <h3 className={cn(
                            "font-bold truncate",
                            darkMode ? "text-slate-100" : "text-slate-800"
                          )}>{bid.haulerName}</h3>
                        </div>
                        <button 
                          onClick={(e) => { e.stopPropagation(); handleDeleteBid(bid.id); }}
                          className="text-slate-400 hover:text-red-500 p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                      <div className="flex items-end justify-between">
                        <div>
                          <p className="text-xs text-slate-500 font-medium">Monthly Total</p>
                          <p className={cn(
                            "text-lg font-black",
                            darkMode ? "text-white" : "text-slate-900"
                          )}>{formatCurrency(results.monthlyTotal)}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-xs text-slate-500 font-medium">Term Total</p>
                          <p className={cn(
                            "text-sm font-bold",
                            darkMode ? "text-slate-300" : "text-slate-700"
                          )}>{formatCurrency(results.contractTermTotal)}</p>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </section>

            {/* Comparison Summary */}
            <section className="bg-slate-900 text-white p-6 rounded-2xl shadow-xl overflow-hidden relative">
              <div className="absolute top-0 right-0 p-4 opacity-10">
                <TrendingDown className="w-24 h-24" />
              </div>
              <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-blue-400" />
                Savings Analysis
              </h2>
              {bids.length > 1 ? (
                <div className="space-y-4">
                  {(() => {
                    const sorted = [...bidResults].sort((a, b) => a.results.monthlyTotal - b.results.monthlyTotal);
                    const best = sorted[0];
                    const worst = sorted[sorted.length - 1];
                    const monthlySavings = worst.results.monthlyTotal - best.results.monthlyTotal;
                    const termSavings = worst.results.contractTermTotal - best.results.contractTermTotal;

                    return (
                      <>
                        <div className="p-4 bg-white/10 rounded-xl border border-white/10">
                          <p className="text-xs text-slate-400 uppercase font-bold tracking-wider mb-1">Potential Monthly Savings</p>
                          <p className="text-2xl font-black text-emerald-400">{formatCurrency(monthlySavings)}</p>
                        </div>
                        <div className="p-4 bg-white/10 rounded-xl border border-white/10">
                          <p className="text-xs text-slate-400 uppercase font-bold tracking-wider mb-1">Total Contract Savings</p>
                          <p className="text-2xl font-black text-blue-400">{formatCurrency(termSavings)}</p>
                        </div>
                        <p className="text-xs text-slate-500 italic">
                          Comparing {best.bid.haulerName} vs {worst.bid.haulerName}
                        </p>
                      </>
                    );
                  })()}
                </div>
              ) : (
                <p className="text-slate-400 text-sm">Add at least two bids to see savings comparisons.</p>
              )}
            </section>
          </div>

          {/* Main Content: Bid Details */}
          <div className="lg:col-span-8">
            <AnimatePresence mode="wait">
              {selectedBid ? (
                <motion.div
                  key={selectedBid.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="space-y-8"
                >
                  {/* Bid Header Card */}
                  <div className={cn(
                    "p-8 rounded-2xl border shadow-sm transition-colors",
                    darkMode ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200"
                  )}>
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
                      <div className="space-y-1">
                        <div className="flex items-center gap-3">
                          <h2 className={cn(
                            "text-3xl font-black tracking-tight",
                            darkMode ? "text-white" : "text-slate-900"
                          )}>
                            {isEditing ? (
                              <input 
                                type="text" 
                                value={selectedBid.haulerName}
                                onChange={(e) => updateBid({ ...selectedBid, haulerName: e.target.value })}
                                className={cn(
                                  "border-none focus:ring-2 focus:ring-blue-500 rounded px-2 -ml-2",
                                  darkMode ? "bg-slate-800 text-white" : "bg-slate-50 text-slate-900"
                                )}
                              />
                            ) : selectedBid.haulerName}
                          </h2>
                          <button 
                            onClick={() => setIsEditing(!isEditing)}
                            className="p-2 text-slate-400 hover:text-blue-600 transition-colors"
                          >
                            <Settings2 className="w-5 h-5" />
                          </button>
                          <button 
                            onClick={handleExportCSV}
                            className="p-2 text-slate-400 hover:text-emerald-600 transition-colors"
                            title="Export Bid to CSV"
                          >
                            <Download className="w-5 h-5" />
                          </button>
                        </div>
                        <div className="text-slate-500 font-medium flex items-center gap-2">
                          <FileText className="w-4 h-4" />
                          {isEditing ? (
                            <div className="flex items-center gap-2 flex-wrap">
                              <input 
                                type="number" 
                                min="0"
                                value={selectedBid.contractTermMonths}
                                onChange={(e) => updateBid({ ...selectedBid, contractTermMonths: parseInt(e.target.value) || 0 })}
                                className={cn(
                                  "w-16 border-none rounded px-1 py-0.5 text-sm",
                                  darkMode ? "bg-slate-800 text-white" : "bg-slate-50 text-slate-900"
                                )}
                              />
                              <span>Month Contract •</span>
                              <input 
                                type="number" 
                                min="0"
                                step="0.1"
                                value={selectedBid.cpiEscalationPercent}
                                onChange={(e) => updateBid({ ...selectedBid, cpiEscalationPercent: parseFloat(e.target.value) || 0 })}
                                className={cn(
                                  "w-16 border-none rounded px-1 py-0.5 text-sm",
                                  darkMode ? "bg-slate-800 text-white" : "bg-slate-50 text-slate-900"
                                )}
                              />
                              <span>% Annual Escalation</span>
                            </div>
                          ) : (
                            <span className="text-sm">
                              {selectedBid.contractTermMonths} Month Contract • {selectedBid.cpiEscalationPercent}% Annual Escalation
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">Monthly Total</p>
                        <p className="text-4xl font-black text-blue-600">
                          {formatCurrency(calculateBidTotals(selectedBid).monthlyTotal)}
                        </p>
                      </div>
                    </div>

                    {/* Quick Stats */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {[
                        { 
                          label: 'Base Services', 
                          value: formatCurrency(calculateBidTotals(selectedBid).breakdown.services), 
                          icon: Truck 
                        },
                        { 
                          label: 'Total Fees', 
                          value: formatCurrency(calculateBidTotals(selectedBid).monthlyFees), 
                          icon: DollarSign 
                        },
                        { 
                          label: 'Fuel Surcharge', 
                          value: isEditing ? (
                            <div className="flex items-center gap-1">
                              <input 
                                type="number" 
                                min="0"
                                step="0.1"
                                value={selectedBid.fuelSurchargePercent}
                                onChange={(e) => updateBid({ ...selectedBid, fuelSurchargePercent: parseFloat(e.target.value) || 0 })}
                                className={cn(
                                  "w-12 border-none rounded px-1 py-0.5 text-xs font-black",
                                  darkMode ? "bg-slate-800 text-white" : "bg-slate-100 text-slate-900"
                                )}
                              />
                              <span>%</span>
                            </div>
                          ) : `${selectedBid.fuelSurchargePercent}%`, 
                          icon: Calculator 
                        },
                        { 
                          label: 'Environmental', 
                          value: isEditing ? (
                            <div className="flex items-center gap-1">
                              <input 
                                type="number" 
                                min="0"
                                step="0.1"
                                value={selectedBid.environmentalFeePercent}
                                onChange={(e) => updateBid({ ...selectedBid, environmentalFeePercent: parseFloat(e.target.value) || 0 })}
                                className={cn(
                                  "w-12 border-none rounded px-1 py-0.5 text-xs font-black",
                                  darkMode ? "bg-slate-800 text-white" : "bg-slate-100 text-slate-900"
                                )}
                              />
                              <span>%</span>
                            </div>
                          ) : `${selectedBid.environmentalFeePercent}%`, 
                          icon: Info 
                        },
                      ].map((stat, i) => (
                        <div key={i} className={cn(
                          "p-4 rounded-xl border transition-colors",
                          darkMode ? "bg-slate-800 border-slate-700" : "bg-slate-50 border-slate-100"
                        )}>
                          <div className="flex items-center gap-2 text-slate-400 mb-1">
                            <stat.icon className="w-3.5 h-3.5" />
                            <span className="text-[10px] font-bold uppercase tracking-wider">{stat.label}</span>
                          </div>
                          <div className={cn(
                            "text-sm font-black",
                            darkMode ? "text-slate-100" : "text-slate-800"
                          )}>{stat.value}</div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Services Section */}
                  <section className={cn(
                    "rounded-2xl border shadow-sm overflow-hidden transition-colors",
                    darkMode ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200"
                  )}>
                    <div className={cn(
                      "p-6 border-b flex items-center justify-between",
                      darkMode ? "bg-slate-800/50 border-slate-800" : "bg-slate-50/50 border-slate-100"
                    )}>
                      <h3 className={cn(
                        "font-bold flex items-center gap-2",
                        darkMode ? "text-slate-100" : "text-slate-800"
                      )}>
                        <Truck className="w-5 h-5 text-blue-500" />
                        Waste Services
                      </h3>
                      <button 
                        onClick={() => {
                          const newService: WasteService = {
                            id: `s-${Date.now()}`,
                            stream: 'MSW',
                            containerSize: '8yd',
                            frequency: '1xw',
                            quantity: 1,
                            baseRate: 0,
                            estimatedHaulsPerMonth: 0,
                            estimatedTonsPerMonth: 0
                          };
                          updateBid({ ...selectedBid, services: [...selectedBid.services, newService] });
                        }}
                        className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1"
                      >
                        <Plus className="w-4 h-4" /> Add Service
                      </button>
                    </div>
                    <div className="overflow-x-auto">
                      <table className="w-full text-left border-collapse">
                        <thead>
                          <tr className={cn(
                            "text-[10px] font-bold uppercase tracking-widest border-b",
                            darkMode ? "text-slate-500 border-slate-800" : "text-slate-400 border-slate-100"
                          )}>
                            <th className="px-6 py-4">Stream</th>
                            <th className="px-6 py-4">Container</th>
                            <th className="px-6 py-4">Frequency</th>
                            <th className="px-6 py-4">Qty</th>
                            {isEditing && (
                              <>
                                <th className="px-6 py-4">Est. Hauls/mo</th>
                                <th className="px-6 py-4">Est. Tons/mo</th>
                              </>
                            )}
                            <th className="px-6 py-4">Rate</th>
                            <th className="px-6 py-4 text-right">Total</th>
                            <th className="px-6 py-4"></th>
                          </tr>
                        </thead>
                        <tbody className={cn(
                          "divide-y",
                          darkMode ? "divide-slate-800" : "divide-slate-50"
                        )}>
                          {selectedBid.services.map(service => (
                            <tr key={service.id} className={cn(
                              "group transition-colors",
                              darkMode ? "hover:bg-slate-800/30" : "hover:bg-slate-50/50"
                            )}>
                              <td className="px-6 py-4">
                                {isEditing ? (
                                  <select 
                                    value={service.stream}
                                    onChange={(e) => {
                                      const newServices = selectedBid.services.map(s => 
                                        s.id === service.id ? { ...s, stream: e.target.value as any } : s
                                      );
                                      updateBid({ ...selectedBid, services: newServices });
                                    }}
                                    className={cn(
                                      "border-none rounded px-2 py-1 text-[10px] font-black",
                                      darkMode ? "bg-slate-800 text-white" : "bg-slate-100 text-slate-900"
                                    )}
                                  >
                                    {WASTE_STREAMS.map(ws => <option key={ws} value={ws}>{ws}</option>)}
                                  </select>
                                ) : (
                                  <span className={cn(
                                    "px-2 py-1 rounded text-[10px] font-black",
                                    service.stream === 'MSW' ? (darkMode ? "bg-slate-800 text-slate-300" : "bg-slate-100 text-slate-600") :
                                    service.stream === 'REC' ? (darkMode ? "bg-emerald-900/30 text-emerald-400" : "bg-emerald-100 text-emerald-700") :
                                    (darkMode ? "bg-blue-900/30 text-blue-400" : "bg-blue-100 text-blue-700")
                                  )}>
                                    {service.stream}
                                  </span>
                                )}
                              </td>
                              <td className={cn(
                                "px-6 py-4 text-sm font-medium",
                                darkMode ? "text-slate-300" : "text-slate-700"
                              )}>
                                {isEditing ? (
                                  <select 
                                    value={service.containerSize}
                                    onChange={(e) => {
                                      const newServices = selectedBid.services.map(s => 
                                        s.id === service.id ? { ...s, containerSize: e.target.value } : s
                                      );
                                      updateBid({ ...selectedBid, services: newServices });
                                    }}
                                    className={cn(
                                      "border-none rounded px-2 py-1 text-sm",
                                      darkMode ? "bg-slate-800 text-white" : "bg-slate-100 text-slate-900"
                                    )}
                                  >
                                    {CONTAINER_SIZES.map(cs => <option key={cs.id} value={cs.size}>{cs.size}</option>)}
                                  </select>
                                ) : service.containerSize}
                              </td>
                              <td className="px-6 py-4 text-sm text-slate-500">
                                {isEditing ? (
                                  <select 
                                    value={service.frequency}
                                    onChange={(e) => {
                                      const newServices = selectedBid.services.map(s => 
                                        s.id === service.id ? { ...s, frequency: e.target.value } : s
                                      );
                                      updateBid({ ...selectedBid, services: newServices });
                                    }}
                                    className={cn(
                                      "border-none rounded px-2 py-1 text-sm",
                                      darkMode ? "bg-slate-800 text-white" : "bg-slate-100 text-slate-900"
                                    )}
                                  >
                                    {FREQUENCIES.map(f => <option key={f.id} value={f.label}>{f.label}</option>)}
                                  </select>
                                ) : service.frequency}
                              </td>
                              <td className="px-6 py-4 text-sm text-slate-500">
                                {isEditing ? (
                                  <input 
                                    type="number" 
                                    min="0"
                                    value={service.quantity}
                                    onChange={(e) => {
                                      const newServices = selectedBid.services.map(s => 
                                        s.id === service.id ? { ...s, quantity: parseInt(e.target.value) || 0 } : s
                                      );
                                      updateBid({ ...selectedBid, services: newServices });
                                    }}
                                    className={cn(
                                      "w-12 border-none rounded px-2 py-1 text-sm",
                                      darkMode ? "bg-slate-800 text-white" : "bg-slate-100 text-slate-900"
                                    )}
                                  />
                                ) : service.quantity}
                              </td>
                              {isEditing && (
                                <>
                                  <td className="px-6 py-4 text-sm text-slate-500">
                                    <input 
                                      type="number" 
                                      min="0"
                                      step="0.1"
                                      value={service.estimatedHaulsPerMonth || 0}
                                      onChange={(e) => {
                                        const newServices = selectedBid.services.map(s => 
                                          s.id === service.id ? { ...s, estimatedHaulsPerMonth: parseFloat(e.target.value) || 0 } : s
                                        );
                                        updateBid({ ...selectedBid, services: newServices });
                                      }}
                                      className={cn(
                                        "w-16 border-none rounded px-2 py-1 text-sm",
                                        darkMode ? "bg-slate-800 text-white" : "bg-slate-100 text-slate-900"
                                      )}
                                    />
                                  </td>
                                  <td className="px-6 py-4 text-sm text-slate-500">
                                    <input 
                                      type="number" 
                                      min="0"
                                      step="0.1"
                                      value={service.estimatedTonsPerMonth || 0}
                                      onChange={(e) => {
                                        const newServices = selectedBid.services.map(s => 
                                          s.id === service.id ? { ...s, estimatedTonsPerMonth: parseFloat(e.target.value) || 0 } : s
                                        );
                                        updateBid({ ...selectedBid, services: newServices });
                                      }}
                                      className={cn(
                                        "w-16 border-none rounded px-2 py-1 text-sm",
                                        darkMode ? "bg-slate-800 text-white" : "bg-slate-100 text-slate-900"
                                      )}
                                    />
                                  </td>
                                </>
                              )}
                              <td className={cn(
                                "px-6 py-4 text-sm font-bold",
                                darkMode ? "text-white" : "text-slate-900"
                              )}>
                                {isEditing ? (
                                  <input 
                                    type="number" 
                                    min="0"
                                    step="0.01"
                                    value={service.baseRate}
                                    onChange={(e) => {
                                      const newServices = selectedBid.services.map(s => 
                                        s.id === service.id ? { ...s, baseRate: parseFloat(e.target.value) || 0 } : s
                                      );
                                      updateBid({ ...selectedBid, services: newServices });
                                    }}
                                    className={cn(
                                      "w-20 border-none rounded px-2 py-1 text-sm",
                                      darkMode ? "bg-slate-800 text-white" : "bg-slate-100 text-slate-900"
                                    )}
                                  />
                                ) : formatCurrency(service.baseRate)}
                              </td>
                              <td className={cn(
                                "px-6 py-4 text-sm font-black text-right",
                                darkMode ? "text-white" : "text-slate-900"
                              )}>
                                {formatCurrency(service.baseRate * service.quantity)}
                              </td>
                              <td className="px-6 py-4 text-right">
                                <button 
                                  onClick={() => {
                                    const newServices = selectedBid.services.filter(s => s.id !== service.id);
                                    updateBid({ ...selectedBid, services: newServices });
                                  }}
                                  className="text-slate-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </td>
                            </tr>
                          ))}
                          {selectedBid.services.length === 0 && (
                            <tr>
                              <td colSpan={isEditing ? 9 : 7} className="px-6 py-12 text-center text-slate-400 italic text-sm">
                                No services added yet. Click "Add Service" to begin.
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </section>

                  {/* Fees Section */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <section className={cn(
                      "rounded-2xl border shadow-sm overflow-hidden transition-colors",
                      darkMode ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200"
                    )}>
                      <div className={cn(
                        "p-6 border-b flex items-center justify-between",
                        darkMode ? "bg-slate-800/50 border-slate-800" : "bg-slate-50/50 border-slate-100"
                      )}>
                        <h3 className={cn(
                          "font-bold flex items-center gap-2",
                          darkMode ? "text-slate-100" : "text-slate-800"
                        )}>
                          <DollarSign className="w-5 h-5 text-emerald-500" />
                          Additional Fees
                        </h3>
                        <button 
                          onClick={() => {
                            const newFee: Fee = {
                              id: `f-${Date.now()}`,
                              name: 'New Fee',
                              type: 'Fixed',
                              value: 0,
                              description: ''
                            };
                            updateBid({ ...selectedBid, fees: [...selectedBid.fees, newFee] });
                          }}
                          className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1"
                        >
                          <Plus className="w-4 h-4" /> Add Fee
                        </button>
                      </div>
                      <div className="p-4 space-y-3">
                        {selectedBid.fees.map(fee => (
                          <div key={fee.id} className={cn(
                            "flex flex-col p-3 rounded-xl border group transition-colors",
                            darkMode ? "bg-slate-800 border-slate-700" : "bg-slate-50 border-slate-100"
                          )}>
                            <div className="flex items-center justify-between mb-2">
                              <div className="space-y-0.5">
                                {isEditing ? (
                                  <div className="flex flex-col gap-1">
                                    <input 
                                      type="text" 
                                      value={fee.name}
                                      onChange={(e) => {
                                        const newFees = selectedBid.fees.map(f => 
                                          f.id === fee.id ? { ...f, name: e.target.value } : f
                                        );
                                        updateBid({ ...selectedBid, fees: newFees });
                                      }}
                                      className={cn(
                                        "border-none rounded px-2 py-0.5 text-sm font-bold",
                                        darkMode ? "bg-slate-700 text-white" : "bg-slate-100 text-slate-900"
                                      )}
                                    />
                                    <select 
                                      value={fee.type}
                                      onChange={(e) => {
                                        const newType = e.target.value as any;
                                        const newFees = selectedBid.fees.map(f => 
                                          f.id === fee.id ? { ...f, type: newType, value: newType === 'Percentage' ? Math.min(f.value, 100) : f.value } : f
                                        );
                                        updateBid({ ...selectedBid, fees: newFees });
                                      }}
                                      className={cn(
                                        "border-none rounded px-2 py-0.5 text-[10px] uppercase font-bold tracking-wider",
                                        darkMode ? "bg-slate-700 text-white" : "bg-slate-100 text-slate-900"
                                      )}
                                    >
                                      <option value="Fixed">Fixed</option>
                                      <option value="Percentage">Percentage</option>
                                      <option value="Per Haul">Per Haul</option>
                                      <option value="Per Ton">Per Ton</option>
                                      <option value="Per Service">Per Service</option>
                                    </select>
                                  </div>
                                ) : (
                                  <>
                                    <p className={cn(
                                      "text-sm font-bold",
                                      darkMode ? "text-slate-100" : "text-slate-800"
                                    )}>{fee.name}</p>
                                    <div className="relative group/tooltip">
                                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider cursor-help">{fee.type}</p>
                                      <div className="absolute bottom-full left-0 mb-2 w-48 p-2 bg-slate-800 text-white text-[10px] rounded shadow-xl opacity-0 group-hover/tooltip:opacity-100 transition-opacity pointer-events-none z-20">
                                        {FEE_TYPE_TOOLTIPS[fee.type]}
                                      </div>
                                    </div>
                                  </>
                                )}
                              </div>
                              <div className="flex items-center gap-4">
                                <div className={cn(
                                  "text-sm font-black",
                                  darkMode ? "text-white" : "text-slate-900"
                                )}>
                                  {isEditing ? (
                                    <div className="flex items-center gap-1">
                                      <input 
                                        type="number" 
                                        min="0"
                                        max={fee.type === 'Percentage' ? 100 : undefined}
                                        step="0.01"
                                        value={fee.value}
                                        onChange={(e) => {
                                          let val = parseFloat(e.target.value) || 0;
                                          if (fee.type === 'Percentage') val = Math.min(val, 100);
                                          const newFees = selectedBid.fees.map(f => 
                                            f.id === fee.id ? { ...f, value: val } : f
                                          );
                                          updateBid({ ...selectedBid, fees: newFees });
                                        }}
                                        className={cn(
                                          "w-16 border-none rounded px-2 py-1 text-sm text-right",
                                          darkMode ? "bg-slate-700 text-white" : "bg-slate-100 text-slate-900"
                                        )}
                                      />
                                      <span>{fee.type === 'Percentage' ? '%' : '$'}</span>
                                    </div>
                                  ) : (
                                    fee.type === 'Percentage' ? `${fee.value}%` : formatCurrency(fee.value)
                                  )}
                                </div>
                                <button 
                                  onClick={() => {
                                    const newFees = selectedBid.fees.filter(f => f.id !== fee.id);
                                    updateBid({ ...selectedBid, fees: newFees });
                                  }}
                                  className="text-slate-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </div>
                            
                            {/* Fee Description */}
                            <div className="mt-1">
                              {isEditing ? (
                                <textarea 
                                  placeholder="Fee description..."
                                  value={fee.description || ''}
                                  onChange={(e) => {
                                    const newFees = selectedBid.fees.map(f => 
                                      f.id === fee.id ? { ...f, description: e.target.value } : f
                                    );
                                    updateBid({ ...selectedBid, fees: newFees });
                                  }}
                                  className={cn(
                                    "w-full border-none rounded px-2 py-1 text-[10px] min-h-[40px] resize-none",
                                    darkMode ? "bg-slate-700 text-slate-300 placeholder-slate-500" : "bg-slate-100 text-slate-500 placeholder-slate-400"
                                  )}
                                />
                              ) : (
                                fee.description && (
                                  <p className="text-[10px] text-slate-500 italic leading-relaxed">
                                    {fee.description}
                                  </p>
                                )
                              )}
                            </div>
                          </div>
                        ))}
                        {selectedBid.fees.length === 0 && (
                          <p className="text-center py-8 text-slate-400 italic text-sm">No additional fees.</p>
                        )}
                      </div>
                    </section>

                    {/* Comparison Chart */}
                    <section className={cn(
                      "rounded-2xl border shadow-sm p-6 transition-colors",
                      darkMode ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200"
                    )}>
                      <h3 className={cn(
                        "font-bold flex items-center gap-2 mb-6",
                        darkMode ? "text-slate-100" : "text-slate-800"
                      )}>
                        <BarChart3 className="w-5 h-5 text-purple-500" />
                        Cost Comparison
                      </h3>
                      <div className="h-[250px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={chartData}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={darkMode ? "#1e293b" : "#f1f5f9"} />
                            <XAxis 
                              dataKey="name" 
                              axisLine={false} 
                              tickLine={false} 
                              tick={{ fill: darkMode ? '#94a3b8' : '#64748b', fontSize: 10, fontWeight: 600 }}
                            />
                            <YAxis 
                              axisLine={false} 
                              tickLine={false} 
                              tick={{ fill: darkMode ? '#94a3b8' : '#64748b', fontSize: 10, fontWeight: 600 }}
                              tickFormatter={(value) => `$${value}`}
                            />
                            <Tooltip 
                              cursor={{ fill: darkMode ? '#1e293b' : '#f8fafc' }}
                              contentStyle={{ 
                                borderRadius: '12px', 
                                border: 'none', 
                                boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
                                backgroundColor: darkMode ? '#0f172a' : '#ffffff',
                                color: darkMode ? '#f8fafc' : '#0f172a'
                              }}
                            />
                            <Bar dataKey="Monthly Total" radius={[4, 4, 0, 0]}>
                              {chartData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.name === selectedBid.haulerName ? '#2563eb' : (darkMode ? '#334155' : '#cbd5e1')} />
                              ))}
                            </Bar>
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    </section>

                    {/* Side-by-Side Service Comparison */}
                    {selectedCompareIds.length > 1 && (
                      <section className={cn(
                        "rounded-2xl border shadow-sm overflow-hidden transition-colors",
                        darkMode ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200"
                      )}>
                        <div className={cn(
                          "p-6 border-b",
                          darkMode ? "bg-slate-800/50 border-slate-800" : "bg-slate-50/50 border-slate-100"
                        )}>
                          <h3 className={cn(
                            "font-bold flex items-center gap-2",
                            darkMode ? "text-slate-100" : "text-slate-800"
                          )}>
                            <ArrowRightLeft className="w-5 h-5 text-blue-500" />
                            Side-by-Side Service Comparison
                          </h3>
                        </div>
                        <div className="overflow-x-auto">
                          <table className="w-full text-left border-collapse">
                            <thead>
                              <tr className={cn(
                                "text-[10px] font-bold uppercase tracking-widest border-b",
                                darkMode ? "text-slate-500 border-slate-800" : "text-slate-400 border-slate-100"
                              )}>
                                <th className="px-6 py-4">Service Details</th>
                                {selectedCompareIds.map(id => (
                                  <th key={id} className="px-6 py-4 text-center">
                                    {bids.find(b => b.id === id)?.haulerName}
                                  </th>
                                ))}
                              </tr>
                            </thead>
                            <tbody className={cn(
                              "divide-y",
                              darkMode ? "divide-slate-800" : "divide-slate-50"
                            )}>
                              {/* We'll compare unique service combinations found across all selected bids */}
                              {Array.from(new Set(
                                bids.filter(b => selectedCompareIds.includes(b.id))
                                  .flatMap(b => b.services.map(s => `${s.stream}|${s.containerSize}|${s.frequency}`))
                              )).map((serviceKey) => {
                                const [stream, size, freq] = (serviceKey as string).split('|');
                                return (
                                  <tr key={serviceKey} className={cn(
                                    "group transition-colors",
                                    darkMode ? "hover:bg-slate-800/30" : "hover:bg-slate-50/50"
                                  )}>
                                    <td className="px-6 py-4">
                                      <div className="flex flex-col">
                                        <span className="text-xs font-bold">{stream} - {size}</span>
                                        <span className="text-[10px] text-slate-500">{freq}</span>
                                      </div>
                                    </td>
                                    {selectedCompareIds.map(id => {
                                      const bid = bids.find(b => b.id === id);
                                      const service = bid?.services.find(s => 
                                        s.stream === stream && s.containerSize === size && s.frequency === freq
                                      );
                                      return (
                                        <td key={id} className="px-6 py-4 text-center">
                                          {service ? (
                                            <div className="flex flex-col">
                                              <span className="text-sm font-bold">{formatCurrency(service.baseRate)}</span>
                                              <span className="text-[10px] text-slate-400">Qty: {service.quantity}</span>
                                            </div>
                                          ) : (
                                            <span className="text-xs text-slate-300 italic">N/A</span>
                                          )}
                                        </td>
                                      );
                                    })}
                                  </tr>
                                );
                              })}
                            </tbody>
                          </table>
                        </div>
                      </section>
                    )}
                  </div>

                  {/* Fee Breakdown Pie Chart */}
                  <section className={cn(
                    "rounded-2xl border shadow-sm p-8 transition-colors",
                    darkMode ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200"
                  )}>
                    <div className="flex items-center justify-between mb-8">
                      <h3 className={cn(
                        "text-xl font-bold flex items-center gap-2",
                        darkMode ? "text-slate-100" : "text-slate-800"
                      )}>
                        <PieChartIcon className="w-6 h-6 text-emerald-500" />
                        Fee Breakdown Analysis
                      </h3>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
                      <div className="h-[300px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Pie
                              data={[
                                { name: 'Fixed Fees', value: calculateBidTotals(selectedBid).breakdown.fixedFees },
                                { name: 'Percentage Fees', value: calculateBidTotals(selectedBid).breakdown.percentageFees },
                                { name: 'Per Haul Fees', value: calculateBidTotals(selectedBid).breakdown.perHaulFees },
                                { name: 'Per Ton Fees', value: calculateBidTotals(selectedBid).breakdown.perTonFees },
                              ].filter(d => d.value > 0)}
                              cx="50%"
                              cy="50%"
                              innerRadius={60}
                              outerRadius={100}
                              paddingAngle={5}
                              dataKey="value"
                            >
                              {[
                                '#3b82f6', // blue
                                '#10b981', // emerald
                                '#f59e0b', // amber
                                '#8b5cf6', // violet
                              ].map((color, index) => (
                                <Cell key={`cell-${index}`} fill={color} />
                              ))}
                            </Pie>
                            <Tooltip 
                              formatter={(value: number) => formatCurrency(value)}
                              contentStyle={{ 
                                borderRadius: '12px', 
                                border: 'none', 
                                boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
                                backgroundColor: darkMode ? '#0f172a' : '#ffffff',
                                color: darkMode ? '#f8fafc' : '#0f172a'
                              }}
                            />
                            <Legend verticalAlign="bottom" height={36}/>
                          </PieChart>
                        </ResponsiveContainer>
                      </div>
                      
                      <div className="space-y-4">
                        <div className={cn(
                          "p-4 rounded-xl border",
                          darkMode ? "bg-slate-800/50 border-slate-700" : "bg-slate-50 border-slate-100"
                        )}>
                          <p className="text-xs text-slate-500 font-bold uppercase tracking-wider mb-2">Fee Efficiency Score</p>
                          {(() => {
                            const results = calculateBidTotals(selectedBid);
                            const feeRatio = (results.monthlyFees / results.monthlyTotal) * 100;
                            return (
                              <div className="flex items-end justify-between">
                                <div>
                                  <p className={cn(
                                    "text-3xl font-black",
                                    feeRatio > 30 ? "text-red-500" : feeRatio > 15 ? "text-amber-500" : "text-emerald-500"
                                  )}>
                                    {100 - Math.round(feeRatio)}%
                                  </p>
                                  <p className="text-xs text-slate-400">of total cost is base service</p>
                                </div>
                                <div className="text-right">
                                  <p className="text-sm font-bold text-slate-500">{formatCurrency(results.monthlyFees)}</p>
                                  <p className="text-[10px] text-slate-400 uppercase font-bold tracking-widest">Total Monthly Fees</p>
                                </div>
                              </div>
                            );
                          })()}
                        </div>
                        <p className="text-sm text-slate-500 leading-relaxed italic">
                          This breakdown helps identify hidden costs. High percentage or per-haul fees can significantly impact the total contract value over time as volume increases.
                        </p>
                      </div>
                    </div>
                  </section>

                  {/* Notes Section */}
                  <section className={cn(
                    "rounded-2xl border shadow-sm p-8 transition-colors",
                    darkMode ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200"
                  )}>
                    <h3 className={cn(
                      "text-xl font-bold flex items-center gap-2 mb-6",
                      darkMode ? "text-slate-100" : "text-slate-800"
                    )}>
                      <FileText className="w-6 h-6 text-blue-500" />
                      Notes
                    </h3>
                    {isEditing ? (
                      <textarea 
                        value={selectedBid.notes || ''}
                        onChange={(e) => updateBid({ ...selectedBid, notes: e.target.value })}
                        placeholder="Add any additional notes about this bid..."
                        className={cn(
                          "w-full min-h-[150px] p-4 rounded-xl border focus:ring-2 focus:ring-blue-500 transition-all",
                          darkMode ? "bg-slate-800 border-slate-700 text-slate-100 placeholder-slate-500" : "bg-slate-50 border-slate-200 text-slate-900 placeholder-slate-400"
                        )}
                      />
                    ) : (
                      <div className={cn(
                        "p-4 rounded-xl min-h-[100px]",
                        darkMode ? "bg-slate-800/30 text-slate-300" : "bg-slate-50 text-slate-600"
                      )}>
                        {selectedBid.notes ? (
                          <p className="whitespace-pre-wrap text-sm leading-relaxed">{selectedBid.notes}</p>
                        ) : (
                          <p className="text-sm italic opacity-50">No notes provided.</p>
                        )}
                      </div>
                    )}
                  </section>
                </motion.div>
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-center p-12 bg-white rounded-3xl border-2 border-dashed border-slate-200">
                  <div className="bg-slate-100 p-6 rounded-full mb-6">
                    <Calculator className="w-12 h-12 text-slate-300" />
                  </div>
                  <h2 className="text-2xl font-bold text-slate-800 mb-2">No Bids Found</h2>
                  <p className="text-slate-500 max-w-xs mb-8">
                    Start by adding a new waste hauling bid to analyze and compare costs.
                  </p>
                  <button 
                    onClick={handleAddBid}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-xl font-bold transition-all shadow-lg shadow-blue-200"
                  >
                    Create First Bid
                  </button>
                </div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 border-t border-slate-200">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2 opacity-50">
            <Truck className="w-5 h-5" />
            <span className="text-sm font-bold uppercase tracking-widest">Bidout Master v1.0</span>
          </div>
          <div className="flex items-center gap-8">
            <a href="#" className="text-xs font-bold text-slate-400 hover:text-slate-600 uppercase tracking-widest transition-colors">Documentation</a>
            <a href="#" className="text-xs font-bold text-slate-400 hover:text-slate-600 uppercase tracking-widest transition-colors">Privacy Policy</a>
            <a href="#" className="text-xs font-bold text-slate-400 hover:text-slate-600 uppercase tracking-widest transition-colors">Support</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
