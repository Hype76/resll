import React, { useEffect, useState } from 'react';

export const AnalysisView: React.FC = () => {
  const [step, setStep] = useState(0);
  
  const steps = [
    "Uploading secure image...",
    "Identifying product & brand...",
    "Scanning condition & wear...",
    "Searching recent sales data...",
    "Optimizing SEO keywords...",
    "Generating sales copy...",
    "Finalizing listing package..."
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setStep((prev) => (prev < steps.length - 1 ? prev + 1 : prev));
    }, 1500); 
    return () => clearInterval(interval);
  }, [steps.length]);

  return (
    <div className="w-full bg-slate-800 border border-slate-700 rounded-2xl p-8 flex flex-col items-center justify-center space-y-8 min-h-[400px]">
      <div className="relative w-32 h-32">
        {/* Pulsing circles */}
        <div className="absolute inset-0 rounded-full border-4 border-mint-400/30 animate-ping"></div>
        <div className="absolute inset-2 rounded-full border-4 border-mint-400/50 animate-pulse"></div>
        <div className="absolute inset-0 rounded-full border-2 border-mint-400 animate-spin border-t-transparent"></div>
        
        {/* Center Icon */}
        <div className="absolute inset-0 flex items-center justify-center">
          <svg className="w-10 h-10 text-mint-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
      </div>

      <div className="space-y-2 text-center max-w-md">
        <h3 className="text-xl font-semibold text-gray-50">Generating Listing</h3>
        <p className="text-mint-400 font-mono text-sm h-6">
          {">"} {steps[step]}
        </p>
      </div>

      <div className="w-full max-w-xs bg-slate-900 rounded-full h-1.5 overflow-hidden">
        <div 
          className="h-full bg-mint-400 transition-all duration-500 ease-out"
          style={{ width: `${((step + 1) / steps.length) * 100}%` }}
        />
      </div>
    </div>
  );
};