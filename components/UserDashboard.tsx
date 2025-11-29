
import React from 'react';
import { ListingResult } from '../types';

interface HistoryItem {
  result: ListingResult;
}

interface UserDashboardProps {
  history: HistoryItem[];
  scansLeft: number;
  onLoadItem: (item: HistoryItem) => void;
  onNavigateHome: () => void;
}

export const UserDashboard: React.FC<UserDashboardProps> = ({ history, scansLeft, onLoadItem, onNavigateHome }) => {
  
  // Stats
  const totalScans = history.length;
  const potentialProfit = history.reduce((acc, item) => {
    const profit = item.result.arbitrage?.netProfit?.high || (item.result.estimatedPrice.high * 0.3);
    return acc + profit;
  }, 0);
  const totalValueFound = history.reduce((acc, item) => acc + item.result.estimatedPrice.high, 0);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-[fadeIn_0.5s_ease-out]">
      
      {/* Profile Header */}
      <div className="bg-slate-900 border border-slate-700 rounded-2xl p-8 mb-8 flex flex-col md:flex-row items-center md:items-start gap-8">
        <div className="w-24 h-24 rounded-full bg-gradient-to-br from-cyan-500 to-mint-400 p-1">
          <div className="w-full h-full rounded-full bg-slate-900 flex items-center justify-center">
             <span className="text-3xl font-bold text-gray-50">S</span>
          </div>
        </div>
        
        <div className="flex-1 text-center md:text-left space-y-2">
          <div className="flex items-center justify-center md:justify-start gap-3">
            <h1 className="text-2xl font-bold text-gray-50">Your Dashboard</h1>
            <span className="px-2 py-1 bg-mint-500/20 text-mint-400 text-xs font-bold rounded border border-mint-500/30 uppercase">Free Plan</span>
          </div>
          <p className="text-gray-400 text-sm">Upgrade to Pro to unlock unlimited scans.</p>
          <div className="flex gap-4 justify-center md:justify-start pt-2">
             <button onClick={onNavigateHome} className="px-4 py-2 bg-cyan-500 hover:bg-mint-400 text-gray-50 text-sm font-bold rounded-lg transition-colors">
                Start New Scan
             </button>
          </div>
        </div>

        {/* Mini Stats */}
        <div className="grid grid-cols-2 gap-4 w-full md:w-auto">
           <div className="bg-slate-800 p-4 rounded-xl border border-slate-700 text-center">
              <div className="text-xs text-gray-400 uppercase font-bold tracking-wider">Scans Left</div>
              <div className="text-2xl font-bold text-gray-50">{scansLeft}</div>
           </div>
           <div className="bg-slate-800 p-4 rounded-xl border border-slate-700 text-center">
              <div className="text-xs text-gray-400 uppercase font-bold tracking-wider">Profit Found</div>
              <div className="text-2xl font-bold text-mint-400">£{Math.floor(potentialProfit)}</div>
           </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Inventory History */}
        <div className="lg:col-span-2">
           <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-gray-50">Scan History</h2>
           </div>

           <div className="space-y-4">
              {history.length === 0 ? (
                 <div className="text-center py-20 bg-slate-900 rounded-2xl border border-slate-700 border-dashed">
                    <p className="text-gray-400">No items scanned yet.</p>
                    <button onClick={onNavigateHome} className="mt-4 text-cyan-500 hover:underline">Scan your first item</button>
                 </div>
              ) : (
                history.map((item) => (
                    <div key={item.result.id} className="bg-slate-900 border border-slate-700 rounded-xl p-4 flex gap-4 hover:border-cyan-500/30 transition-colors group">
                       <div className="w-20 h-20 bg-slate-950 rounded-lg overflow-hidden flex-shrink-0 relative">
                          {item.result.thumbnail ? (
                             <img src={item.result.thumbnail} className="w-full h-full object-cover" alt="Thumb" />
                          ) : (
                             <div className="w-full h-full flex items-center justify-center text-gray-600">No img</div>
                          )}
                       </div>
                       <div className="flex-1 min-w-0">
                          <div className="flex justify-between items-start">
                             <h3 className="font-bold text-gray-50 truncate pr-4">{item.result.title}</h3>
                             <span className="text-xs text-gray-500 whitespace-nowrap">{new Date(item.result.timestamp).toLocaleDateString()}</span>
                          </div>
                          <p className="text-sm text-gray-400 truncate mb-2">{item.result.brand || 'Unknown Brand'}</p>
                          <div className="flex items-center gap-3">
                             <span className="text-sm font-bold text-gray-200">Est. £{item.result.estimatedPrice.high}</span>
                             <span className={`text-[10px] px-2 py-0.5 rounded font-bold uppercase ${item.result.profitPotential === 'High' ? 'bg-mint-500/10 text-mint-400' : 'bg-slate-800 text-gray-500'}`}>
                                {item.result.profitPotential}
                             </span>
                          </div>
                       </div>
                       <div className="flex flex-col justify-center gap-2 border-l border-slate-800 pl-4">
                          <button 
                             onClick={() => onLoadItem(item)}
                             className="text-xs font-bold text-cyan-500 hover:text-mint-400 transition-colors"
                          >
                             VIEW
                          </button>
                       </div>
                    </div>
                ))
              )}
           </div>
        </div>

        {/* Sidebar Stats */}
        <div className="space-y-6">
           <div className="bg-slate-900 border border-slate-700 rounded-xl p-6">
              <h3 className="text-gray-50 font-bold mb-4">Total Value Found</h3>
              <div className="h-40 flex items-center justify-center relative">
                 <div className="w-32 h-32 rounded-full border-8 border-slate-800 border-t-mint-400 border-r-cyan-500 transform rotate-45"></div>
                 <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-2xl font-bold text-gray-50">£{Math.floor(totalValueFound)}</span>
                    <span className="text-xs text-gray-400">Lifetime Est.</span>
                 </div>
              </div>
           </div>
        </div>

      </div>
    </div>
  );
};
