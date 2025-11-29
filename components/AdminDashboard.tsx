
import React from 'react';

export const AdminDashboard: React.FC = () => {
  // Mock Data for Visualization
  const revenueData = [4500, 5200, 4800, 6100, 5900, 7200, 8500];
  const recentUsers = [
    { email: "steve@reseller.co.uk", action: "Upgraded to Pro", time: "2 mins ago", status: "success" },
    { email: "sarah.j@ebayflipper.com", action: "Scanned Item #9921", time: "5 mins ago", status: "neutral" },
    { email: "mike_vinted_king", action: "Failed Payment", time: "12 mins ago", status: "error" },
    { email: "bootsale_dave", action: "Exported CSV", time: "1 hour ago", status: "neutral" },
    { email: "vintage_gem_finder", action: "New Sign Up", time: "2 hours ago", status: "success" },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-[fadeIn_0.5s_ease-out]">
      
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-50">Admin Command Center</h1>
          <p className="text-gray-400">Live system metrics and revenue tracking.</p>
        </div>
        <div className="flex gap-2">
            <span className="px-3 py-1 bg-mint-500/10 text-mint-400 border border-mint-500/30 rounded-full text-xs font-bold uppercase tracking-wide flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-mint-400 animate-pulse"></span>
                System Operational
            </span>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        {[
          { label: "Monthly Recurring Revenue", value: "£8,450", change: "+12.5%", positive: true },
          { label: "Active Users", value: "1,204", change: "+8.2%", positive: true },
          { label: "Total Scans (All Time)", value: "45.2k", change: "+24%", positive: true },
          { label: "Avg. Profit Found", value: "£42.50", change: "-2.1%", positive: false },
        ].map((stat, i) => (
          <div key={i} className="bg-slate-900 border border-slate-700 p-6 rounded-xl">
            <p className="text-gray-400 text-xs font-bold uppercase tracking-wider mb-2">{stat.label}</p>
            <div className="flex justify-between items-end">
              <span className="text-3xl font-bold text-gray-50">{stat.value}</span>
              <span className={`text-xs font-bold px-2 py-1 rounded ${stat.positive ? 'text-mint-400 bg-mint-500/10' : 'text-red-500 bg-red-900/20'}`}>
                {stat.change}
              </span>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Main Chart Section */}
        <div className="lg:col-span-2 bg-slate-900 border border-slate-700 rounded-xl p-6">
          <h3 className="text-gray-50 font-bold mb-6">Revenue Growth (Last 7 Days)</h3>
          <div className="h-64 flex items-end justify-between gap-2">
            {revenueData.map((val, i) => {
              const height = (val / 10000) * 100;
              return (
                <div key={i} className="w-full bg-slate-800 rounded-t-lg relative group hover:bg-cyan-900/30 transition-colors">
                  <div 
                    className="absolute bottom-0 left-0 right-0 bg-cyan-500 rounded-t-lg transition-all duration-500 group-hover:bg-mint-400"
                    style={{ height: `${height}%` }}
                  ></div>
                  <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-slate-800 text-xs text-gray-200 px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                    £{val}
                  </div>
                </div>
              );
            })}
          </div>
          <div className="flex justify-between mt-4 text-xs text-gray-400">
            <span>Mon</span><span>Tue</span><span>Wed</span><span>Thu</span><span>Fri</span><span>Sat</span><span>Sun</span>
          </div>
        </div>

        {/* Live Feed */}
        <div className="bg-slate-900 border border-slate-700 rounded-xl p-6">
          <h3 className="text-gray-50 font-bold mb-4">Real-Time Activity</h3>
          <div className="space-y-4">
            {recentUsers.map((user, i) => (
              <div key={i} className="flex items-start gap-3 pb-3 border-b border-slate-800 last:border-0 last:pb-0">
                <div className={`w-2 h-2 mt-1.5 rounded-full ${user.status === 'success' ? 'bg-mint-400' : user.status === 'error' ? 'bg-red-500' : 'bg-cyan-500'}`}></div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-200 truncate">{user.email}</p>
                  <p className="text-xs text-gray-400">{user.action}</p>
                </div>
                <span className="text-xs text-slate-500 whitespace-nowrap">{user.time}</span>
              </div>
            ))}
          </div>
          <button className="w-full mt-6 py-2 bg-slate-800 hover:bg-slate-700 text-gray-400 text-sm rounded-lg transition-colors">
            View All Logs
          </button>
        </div>
      </div>
    </div>
  );
};
