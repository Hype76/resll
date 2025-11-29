
import React, { useState, useEffect } from 'react';
import { supabase } from './lib/supabaseClient';
import { Session } from '@supabase/supabase-js';

import { Hero } from './components/Hero';
import { UploadZone } from './components/UploadZone';
import { AnalysisView } from './components/AnalysisView';
import { ResultCard } from './components/ResultCard';
import { SettingsModal } from './components/SettingsModal';
import { AdminDashboard } from './components/AdminDashboard';
import { UserDashboard } from './components/UserDashboard';
import { LandingPage } from './components/LandingPage';
import { AuthModal } from './components/AuthModal';

import { AppState, ListingResult, MediaAsset, UserSettings, ViewState, UserProfile } from './types';
import { analyzeItemForListing } from './services/geminiService';

interface HistoryItem {
  result: ListingResult;
}

const DEFAULT_SETTINGS: UserSettings = {
  defaultCondition: 'Good',
  defaultShippingCost: 3.50,
  defaultFeeRate: 12.8,
  includePostageInProfit: false
};

const App: React.FC = () => {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  
  // App View State
  const [viewState, setViewState] = useState<ViewState>('LANDING');
  const [appState, setAppState] = useState<AppState>(AppState.IDLE);
  
  // Data State
  const [currentAssets, setCurrentAssets] = useState<MediaAsset[]>([]);
  const [analysisResult, setAnalysisResult] = useState<ListingResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  
  // User Profile
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [userSettings, setUserSettings] = useState<UserSettings>(DEFAULT_SETTINGS);

  // Modals
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState<'login'|'signup'>('login');

  // Manual Input
  const [manualProduct, setManualProduct] = useState('');
  const [manualCondition, setManualCondition] = useState('Good');

  // AUTH INITIALIZATION
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session) {
        setViewState('SCANNER');
        fetchUserData(session.user.id);
      }
      setLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session) {
        setViewState('SCANNER');
        fetchUserData(session.user.id);
      } else {
        setViewState('LANDING');
        setUserProfile(null);
        setHistory([]);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchUserData = async (userId: string) => {
    // 1. Fetch Profile
    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();
    
    if (profile) setUserProfile(profile);

    // 2. Fetch Settings
    const { data: settings } = await supabase
      .from('user_settings')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (settings) {
        setUserSettings({
            defaultCondition: settings.default_condition,
            defaultShippingCost: settings.default_shipping_cost,
            defaultFeeRate: settings.default_fee_rate,
            includePostageInProfit: false
        });
        setManualCondition(settings.default_condition);
    }

    // 3. Fetch History
    fetchHistory(userId);
  };

  const fetchHistory = async (userId: string) => {
    const { data: scans } = await supabase
      .from('scans')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(20);

    if (scans) {
        const historyItems = scans.map((scan: any) => ({
            result: {
                ...scan.full_result,
                thumbnail: scan.thumbnail_url // Use the persistent URL from DB
            }
        }));
        setHistory(historyItems);
    }
  };

  const saveToHistory = async (result: ListingResult, imageFile?: File) => {
    if (!session?.user) return;

    let publicUrl = '';

    // 1. Upload Image to Supabase Storage if exists
    if (imageFile) {
        const fileName = `${session.user.id}/${Date.now()}.jpg`;
        const { error: uploadError } = await supabase.storage
            .from('scan_images')
            .upload(fileName, imageFile);

        if (!uploadError) {
            const { data } = supabase.storage.from('scan_images').getPublicUrl(fileName);
            publicUrl = data.publicUrl;
        }
    }

    // 2. Save to DB
    const { error } = await supabase.from('scans').insert({
        user_id: session.user.id,
        title: result.title,
        brand: result.brand,
        estimated_price_high: result.estimatedPrice.high,
        thumbnail_url: publicUrl,
        profit_potential: result.profitPotential,
        full_result: result
    });

    if (!error) {
        // Optimistic update
        const newItem = { result: { ...result, thumbnail: publicUrl } };
        setHistory([newItem, ...history]);
        
        // Update Usage Count
        if (userProfile) {
             const newCount = userProfile.scans_used + 1;
             await supabase.from('profiles').update({ scans_used: newCount }).eq('id', session.user.id);
             setUserProfile({...userProfile, scans_used: newCount});
        }
    }
  };

  const handleSaveSettings = async (newSettings: UserSettings) => {
    setUserSettings(newSettings);
    setManualCondition(newSettings.defaultCondition);
    
    if (session?.user) {
        const { error } = await supabase.from('user_settings').upsert({
            user_id: session.user.id,
            default_condition: newSettings.defaultCondition,
            default_shipping_cost: newSettings.defaultShippingCost,
            default_fee_rate: newSettings.defaultFeeRate
        });
    }
  };

  const handleAnalysis = async (assets: MediaAsset[]) => {
    if (!userProfile) return;
    
    if (userProfile.plan === 'free' && userProfile.scans_used >= userProfile.scans_limit) {
        alert("Free trial limit reached (1 scan). Please upgrade to Pro!");
        return;
    }
    
    setAppState(AppState.ANALYZING);
    setError(null);

    try {
      const manualContext = (manualProduct || manualCondition) ? {
          product: manualProduct,
          condition: manualCondition
      } : undefined;

      const imagesToSend = assets
        .filter(a => a.type === 'image' && a.base64 && a.mimeType)
        .map(a => ({ base64: a.base64!, mimeType: a.mimeType! }));

      const result = await analyzeItemForListing(imagesToSend, manualContext, userSettings);
      setAnalysisResult(result);
      setAppState(AppState.SUCCESS);
      
      // Save to Supabase
      const primaryAsset = assets.find(a => a.type === 'image');
      saveToHistory(result, primaryAsset?.file);
      
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Failed to analyze item. Please try again.");
      setAppState(AppState.ERROR);
    }
  };

  const processFiles = (files: File[]) => {
    const assetPromises = files.map(file => new Promise<MediaAsset>((resolve) => {
       const url = URL.createObjectURL(file);
       const type = file.type.startsWith('video') ? 'video' : 'image';
       
       if (type === 'image') {
           const reader = new FileReader();
           reader.onloadend = () => {
               const result = reader.result as string;
               const base64 = result.split(',')[1];
               resolve({ id: crypto.randomUUID(), type: 'image', url, base64, mimeType: file.type, file });
           };
           reader.readAsDataURL(file);
       } else {
           resolve({ id: crypto.randomUUID(), type: 'video', url, mimeType: file.type, file });
       }
    }));

    Promise.all(assetPromises).then(newAssets => {
        setCurrentAssets(newAssets);
        handleAnalysis(newAssets);
    });
  };

  const handleManualGenerate = () => {
      if (!manualProduct) return;
      handleAnalysis([]);
  };

  const handleReset = () => {
    setAppState(AppState.IDLE);
    setCurrentAssets([]);
    setAnalysisResult(null);
    setError(null);
    setManualProduct('');
    setManualCondition(userSettings.defaultCondition); 
    setViewState('SCANNER');
  };

  const handleLogout = async () => {
      await supabase.auth.signOut();
      window.location.reload();
  };

  const openAuth = (mode: 'login' | 'signup') => {
      setAuthMode(mode);
      setIsAuthModalOpen(true);
  };

  if (loading) return <div className="min-h-screen bg-slate-950 flex items-center justify-center text-gray-50">Loading Resll...</div>;

  // RENDER LANDING PAGE IF NO SESSION
  if (!session) {
      return (
          <>
            <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} initialMode={authMode} />
            <LandingPage onLogin={() => openAuth('login')} onSignup={() => openAuth('signup')} />
          </>
      );
  }

  // RENDER APP FOR AUTHENTICATED USERS
  return (
    <div className="min-h-screen bg-slate-950 text-gray-50 font-sans selection:bg-mint-400/30">
      
      <SettingsModal 
        isOpen={isSettingsOpen} 
        onClose={() => setIsSettingsOpen(false)} 
        settings={userSettings}
        onSave={handleSaveSettings}
      />

      <nav className="border-b border-slate-700 bg-slate-900/90 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-2 cursor-pointer" onClick={() => setViewState('SCANNER')}>
              <div className="w-8 h-8 bg-mint-400 rounded-lg flex items-center justify-center shadow-lg shadow-mint-400/20">
                 <svg className="w-5 h-5 text-slate-950" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <span className="font-bold text-lg text-gray-50 tracking-tight">Res<span className="text-mint-400">ll</span></span>
            </div>
            
            <div className="flex items-center gap-4">
              {viewState === 'SCANNER' && userProfile && userProfile.plan === 'free' && (
                <div className="hidden md:flex items-center gap-2 mr-2">
                  <span className="text-xs text-gray-400">Free Trial:</span>
                  <div className="w-24 h-2 bg-slate-800 rounded-full overflow-hidden">
                      <div className="h-full bg-mint-400" style={{ width: `${(userProfile.scans_used / userProfile.scans_limit) * 100}%` }}></div>
                  </div>
                  <span className="text-xs font-bold text-gray-50">{userProfile.scans_limit - userProfile.scans_used} Left</span>
                </div>
              )}
              
              <button 
                onClick={() => setViewState('USER_DASH')}
                className="px-3 py-1.5 bg-cyan-500 hover:bg-mint-400 text-gray-50 rounded-lg text-xs font-bold shadow-lg shadow-cyan-500/20 transition-all"
              >
                UPGRADE
              </button>
              
              <button 
                onClick={() => setViewState(viewState === 'USER_DASH' ? 'SCANNER' : 'USER_DASH')}
                className={`p-1 rounded-full border border-slate-700 hover:border-cyan-500 transition-colors ${viewState === 'USER_DASH' ? 'ring-2 ring-cyan-500' : ''}`}
              >
                 <div className="w-8 h-8 rounded-full bg-gradient-to-br from-cyan-500 to-mint-400 p-0.5">
                    <div className="w-full h-full rounded-full bg-slate-900 flex items-center justify-center text-xs font-bold">
                        {userProfile?.email.charAt(0).toUpperCase()}
                    </div>
                 </div>
              </button>
              
              <button 
                onClick={() => setIsSettingsOpen(true)}
                className="p-2 text-gray-400 hover:text-cyan-500 transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
              </button>

              <button onClick={handleLogout} className="text-xs text-red-500 hover:text-red-400 font-bold">Log Out</button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {viewState === 'ADMIN_DASH' && <AdminDashboard />}
        
        {viewState === 'USER_DASH' && (
            <UserDashboard 
                history={history} 
                scansLeft={userProfile ? userProfile.scans_limit - userProfile.scans_used : 0}
                onLoadItem={(item) => {
                    setAnalysisResult(item.result);
                    // Use thumbnail from DB history as preview
                    if (item.result.thumbnail) {
                        setCurrentAssets([{ id: 'history', type: 'image', url: item.result.thumbnail }]);
                    }
                    setAppState(AppState.SUCCESS);
                    setViewState('SCANNER');
                }}
                onNavigateHome={() => setViewState('SCANNER')}
            />
        )}

        {viewState === 'SCANNER' && (
           <>
            {appState === AppState.IDLE && (
            <div className="max-w-3xl mx-auto animate-[fadeIn_0.5s_ease-out]">
                <Hero />
                <div className="mb-6 grid grid-cols-1 md:grid-cols-12 gap-4 bg-slate-800 p-4 rounded-xl border border-slate-700">
                <div className="md:col-span-6">
                    <label className="block text-xs text-gray-400 mb-1 ml-1 uppercase font-bold">Product Name (Optional)</label>
                    <input 
                    type="text" 
                    value={manualProduct}
                    onChange={(e) => setManualProduct(e.target.value)}
                    placeholder="e.g. Nike Air Max 90 Black Size 10"
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-3 text-gray-50 focus:border-cyan-500 outline-none transition-all placeholder:text-gray-400"
                    />
                </div>
                <div className="md:col-span-3">
                    <label className="block text-xs text-gray-400 mb-1 ml-1 uppercase font-bold">Condition</label>
                    <select 
                    value={manualCondition}
                    onChange={(e) => setManualCondition(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-3 text-gray-50 focus:border-cyan-500 outline-none transition-all appearance-none cursor-pointer"
                    >
                    <option value="New">New</option>
                    <option value="Like New">Like New</option>
                    <option value="Good">Good</option>
                    <option value="Fair">Fair</option>
                    <option value="For Parts">For Parts</option>
                    </select>
                </div>
                <div className="md:col-span-3 flex items-end">
                    <button 
                    onClick={handleManualGenerate}
                    disabled={!manualProduct}
                    className={`w-full py-3 px-4 rounded-lg font-bold text-sm transition-all flex items-center justify-center gap-2
                        ${manualProduct 
                        ? 'bg-cyan-500 hover:bg-mint-400 text-gray-50 shadow-lg shadow-cyan-500/20' 
                        : 'bg-slate-900 text-gray-400 border border-slate-700 cursor-not-allowed'}`}
                    >
                    {manualProduct ? 'Generate' : 'Enter Details'}
                    </button>
                </div>
                </div>

                <div className="relative z-0">
                {manualProduct && (
                    <div className="absolute -top-3 left-0 right-0 flex justify-center z-10">
                    <span className="bg-mint-500/10 text-mint-400 text-[10px] font-bold px-3 py-1 rounded-full border border-mint-500/30 uppercase tracking-wide backdrop-blur-sm">
                        Adding Context: "{manualProduct}"
                    </span>
                    </div>
                )}
                <UploadZone onFilesSelected={processFiles} disabled={false} />
                </div>
            </div>
            )}

            {appState === AppState.ANALYZING && (
            <div className="max-w-2xl mx-auto mt-12 animate-[fadeIn_0.5s_ease-out]">
                <AnalysisView />
            </div>
            )}

            {appState === AppState.SUCCESS && analysisResult && (
            <ResultCard 
                result={analysisResult} 
                assets={currentAssets}
                onReset={handleReset} 
            />
            )}

            {appState === AppState.ERROR && (
            <div className="max-w-xl mx-auto mt-12 text-center bg-slate-900 border border-red-900/50 p-8 rounded-2xl">
                <h2 className="text-xl font-bold text-gray-50 mb-2">Scan Failed</h2>
                <p className="text-gray-400 mb-6">{error}</p>
                <button
                onClick={handleReset}
                className="px-6 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-gray-50 rounded-lg transition-colors"
                >
                Try Again
                </button>
            </div>
            )}
           </>
        )}
      </main>
      
      <footer className="mt-20 border-t border-slate-700 py-8 text-center text-gray-400 text-sm">
        <p className="mb-2">&copy; {new Date().getFullYear()} Resll Analytics Ltd. London, UK.</p>
        <button 
            onClick={() => setViewState(viewState === 'ADMIN_DASH' ? 'SCANNER' : 'ADMIN_DASH')}
            className="text-[10px] text-slate-800 hover:text-slate-600"
        >
            Admin View
        </button>
      </footer>
    </div>
  );
};

export default App;
