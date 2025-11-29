import React from 'react';

export const Hero: React.FC = () => {
  return (
    <div className="text-center mb-10 space-y-4">
      <div className="inline-flex items-center justify-center p-2 bg-slate-800/50 rounded-full mb-4 border border-slate-700 backdrop-blur-sm">
        <span className="px-3 py-1 text-xs font-semibold tracking-wider text-mint-400 uppercase">
          🇬🇧 UK Edition | eBay • Vinted • Etsy • FB
        </span>
      </div>
      <h1 className="text-4xl md:text-6xl font-bold tracking-tight text-gray-50">
        Res<span className="text-mint-400">ll</span>
      </h1>
      <p className="text-gray-400 max-w-2xl mx-auto text-lg">
        Spot a bargain? Upload a photo OR a screenshot of a Marketplace listing.
        Instantly check profit margins, real sold prices, and generate listings for eBay, Vinted & Etsy.
      </p>
    </div>
  );
};