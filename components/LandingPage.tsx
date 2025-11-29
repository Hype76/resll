
import React from 'react';

interface LandingPageProps {
  onLogin: () => void;
  onSignup: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onLogin, onSignup }) => {
  return (
    <div className="bg-slate-950 min-h-screen text-gray-50 flex flex-col">
      {/* Navbar */}
      <nav className="border-b border-slate-800 bg-slate-900/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-20 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-mint-400 rounded-lg flex items-center justify-center">
               <svg className="w-5 h-5 text-slate-950" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
            </div>
            <span className="font-bold text-xl tracking-tight">Res<span className="text-mint-400">ll</span></span>
          </div>
          <div className="flex gap-4">
            <button onClick={onLogin} className="text-sm font-bold text-gray-400 hover:text-gray-50 transition-colors">Log In</button>
            <button onClick={onSignup} className="px-5 py-2 bg-cyan-500 hover:bg-cyan-600 text-gray-50 rounded-lg text-sm font-bold shadow-lg shadow-cyan-500/20 transition-all">
              Get Started Free
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-20 pb-32 overflow-hidden">
         <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-cyan-500/10 rounded-full blur-[100px] pointer-events-none"></div>
         <div className="max-w-7xl mx-auto px-6 text-center relative z-10">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-slate-800 rounded-full border border-slate-700 mb-8">
               <span className="w-2 h-2 rounded-full bg-mint-400 animate-pulse"></span>
               <span className="text-xs font-bold uppercase tracking-wider text-mint-400">The #1 Tool for UK Resellers</span>
            </div>
            <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-6">
              Turn <span className="text-transparent bg-clip-text bg-gradient-to-r from-mint-400 to-cyan-500">Charity Shop Finds</span><br/>
              Into Real Profit.
            </h1>
            <p className="text-xl text-gray-400 max-w-2xl mx-auto mb-10">
              Upload a photo. Our AI instantly identifies the item, checks eBay sold prices, and writes your listing. All in 10 seconds.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <button onClick={onSignup} className="px-8 py-4 bg-cyan-500 hover:bg-cyan-600 text-white rounded-xl font-bold text-lg shadow-xl shadow-cyan-500/20 hover:scale-105 transition-all">
                 Try It For Free
              </button>
              <button className="px-8 py-4 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-white rounded-xl font-bold text-lg transition-all">
                 Watch Demo
              </button>
            </div>
            <div className="mt-12 text-sm text-gray-500 font-medium">
               Trusted by 10,000+ Resellers on eBay, Vinted & Depop
            </div>
         </div>
      </section>

      {/* Feature Grid */}
      <section className="bg-slate-900 border-y border-slate-800 py-24">
         <div className="max-w-7xl mx-auto px-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
               <div className="bg-slate-950 p-8 rounded-2xl border border-slate-800">
                  <div className="w-12 h-12 bg-mint-500/10 rounded-xl flex items-center justify-center mb-6 text-mint-400">
                     <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                  </div>
                  <h3 className="text-xl font-bold mb-3">Instant Visual ID</h3>
                  <p className="text-gray-400">Don't know what it is? Resll identifies brands, models, and eras from a single blurry photo.</p>
               </div>
               <div className="bg-slate-950 p-8 rounded-2xl border border-slate-800">
                  <div className="w-12 h-12 bg-cyan-500/10 rounded-xl flex items-center justify-center mb-6 text-cyan-500">
                     <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                  </div>
                  <h3 className="text-xl font-bold mb-3">Profit Calculator</h3>
                  <p className="text-gray-400">Upload a screenshot of a Vinted listing. We'll tell you if you can flip it on eBay for a profit.</p>
               </div>
               <div className="bg-slate-950 p-8 rounded-2xl border border-slate-800">
                  <div className="w-12 h-12 bg-amber-500/10 rounded-xl flex items-center justify-center mb-6 text-amber-500">
                     <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                  </div>
                  <h3 className="text-xl font-bold mb-3">Multi-Platform Ready</h3>
                  <p className="text-gray-400">One scan generates optimized titles for eBay, descriptions for Vinted, and tags for Etsy.</p>
               </div>
            </div>
         </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t border-slate-800 bg-slate-950 text-center">
         <p className="text-gray-500 text-sm">© {new Date().getFullYear()} Resll Analytics Ltd. London, UK.</p>
      </footer>
    </div>
  );
};
