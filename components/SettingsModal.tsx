
import React, { useState } from 'react';
import { UserSettings } from '../types';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: UserSettings;
  onSave: (newSettings: UserSettings) => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose, settings, onSave }) => {
  const [formData, setFormData] = useState<UserSettings>(settings);
  const [activeTab, setActiveTab] = useState<'financials' | 'workflow' | 'billing'>('financials');

  if (!isOpen) return null;

  const handleSave = () => {
    onSave(formData);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm animate-[fadeIn_0.2s_ease-out]">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden m-4">
        
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-slate-700">
          <h2 className="text-xl font-bold text-gray-50 flex items-center gap-2">
            <svg className="w-5 h-5 text-mint-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
            App Configuration
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-50 transition-colors">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-slate-700">
          <button 
            onClick={() => setActiveTab('financials')}
            className={`flex-1 py-3 text-sm font-medium transition-colors ${activeTab === 'financials' ? 'text-cyan-500 border-b-2 border-cyan-500 bg-cyan-500/5' : 'text-gray-400 hover:text-gray-200'}`}
          >
            Financials
          </button>
          <button 
            onClick={() => setActiveTab('workflow')}
            className={`flex-1 py-3 text-sm font-medium transition-colors ${activeTab === 'workflow' ? 'text-cyan-500 border-b-2 border-cyan-500 bg-cyan-500/5' : 'text-gray-400 hover:text-gray-200'}`}
          >
            Workflow
          </button>
          <button 
            onClick={() => setActiveTab('billing')}
            className={`flex-1 py-3 text-sm font-medium transition-colors ${activeTab === 'billing' ? 'text-cyan-500 border-b-2 border-cyan-500 bg-cyan-500/5' : 'text-gray-400 hover:text-gray-200'}`}
          >
            Billing
          </button>
        </div>

        {/* Content */}
        <div className="p-6 h-80 overflow-y-auto custom-scrollbar">
          
          {activeTab === 'financials' && (
            <div className="space-y-6 animate-[fadeIn_0.2s_ease-out]">
              <div>
                <label className="block text-sm font-medium text-gray-200 mb-2">Platform Fee Rate (%)</label>
                <div className="flex gap-2 items-center">
                   <input 
                     type="number" 
                     step="0.1"
                     value={formData.defaultFeeRate}
                     onChange={(e) => setFormData({...formData, defaultFeeRate: parseFloat(e.target.value)})}
                     className="bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 text-gray-50 w-full focus:border-cyan-500 outline-none"
                   />
                   <span className="text-gray-400">%</span>
                </div>
                <p className="text-xs text-gray-400 mt-1">Default eBay UK fees are 12.8%. Change this if you have a shop subscription.</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-200 mb-2">Default Shipping Cost (£)</label>
                <div className="flex gap-2 items-center">
                   <span className="text-gray-400">£</span>
                   <input 
                     type="number" 
                     step="0.01"
                     value={formData.defaultShippingCost}
                     onChange={(e) => setFormData({...formData, defaultShippingCost: parseFloat(e.target.value)})}
                     className="bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 text-gray-50 w-full focus:border-cyan-500 outline-none"
                   />
                </div>
                <p className="text-xs text-gray-400 mt-1">This cost is deducted from your profit calculations.</p>
              </div>
            </div>
          )}

          {activeTab === 'workflow' && (
            <div className="space-y-6 animate-[fadeIn_0.2s_ease-out]">
              <div>
                <label className="block text-sm font-medium text-gray-200 mb-2">Default Item Condition</label>
                <select 
                  value={formData.defaultCondition}
                  onChange={(e) => setFormData({...formData, defaultCondition: e.target.value})}
                  className="bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 text-gray-50 w-full focus:border-cyan-500 outline-none"
                >
                   <option value="New">New</option>
                   <option value="Like New">Like New</option>
                   <option value="Good">Good</option>
                   <option value="Fair">Fair</option>
                   <option value="For Parts">For Parts</option>
                </select>
                <p className="text-xs text-gray-400 mt-1">This will pre-select the condition dropdown for new scans.</p>
              </div>
            </div>
          )}

          {activeTab === 'billing' && (
             <div className="space-y-6 animate-[fadeIn_0.2s_ease-out] text-center pt-4">
                <div className="w-16 h-16 bg-mint-500/10 rounded-full flex items-center justify-center mx-auto border border-mint-500/30">
                   <svg className="w-8 h-8 text-mint-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                </div>
                <div>
                   <h3 className="text-gray-50 font-bold text-lg">Pro Plan</h3>
                   <p className="text-mint-400 font-medium">Free Trial Active</p>
                </div>
                <div className="bg-slate-800 p-4 rounded-lg border border-slate-700 text-left">
                   <div className="flex justify-between text-sm mb-2">
                      <span className="text-gray-400">Scans Remaining</span>
                      <span className="text-gray-50 font-bold">1 / 1</span>
                   </div>
                   <div className="w-full bg-slate-900 rounded-full h-2 overflow-hidden">
                      <div className="bg-mint-400 w-full h-full"></div>
                   </div>
                </div>
                <button className="w-full py-3 bg-slate-900 hover:bg-slate-800 border border-slate-700 rounded-lg text-gray-200 font-medium transition-colors">
                   Manage Subscription
                </button>
             </div>
          )}

        </div>

        {/* Footer */}
        <div className="p-6 border-t border-slate-700 bg-slate-900 flex justify-end gap-3">
          <button onClick={onClose} className="px-4 py-2 text-gray-400 hover:text-gray-50 font-medium transition-colors">
            Cancel
          </button>
          <button 
            onClick={handleSave}
            className="px-6 py-2 bg-cyan-500 hover:bg-mint-400 text-gray-50 rounded-lg font-bold shadow-lg shadow-cyan-500/20 transition-all transform active:scale-95"
          >
            Save Changes
          </button>
        </div>

      </div>
    </div>
  );
};
