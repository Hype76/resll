import React, { useState, useEffect } from 'react';
import { supabase, isSupabaseConfigured } from './lib/supabaseClient';

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

type Session = any;

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
  const [fatalError] = useState<string | null>(null);

  if (!isSupabaseConfigured) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
        <div className="bg-slate-900 border border-slate-700 p-8 rounded-2xl max-w-lg text-center shadow-2xl">
          <h1 className="text-2xl font-bold text-gray-50 mb-3">Setup Required</h1>
          <p className="text-gray-400 mb-8">Missing Netlify env vars.</p>
        </div>
      </div>
    );
  }

  if (fatalError) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
        <div className="bg-slate-900 border border-red-900/50 p-8 rounded-2xl max-w-lg text-center shadow-2xl">
          <h1 className="text-2xl font-bold text-red-500 mb-4">Application Error</h1>
          <p className="text-gray-400 mb-6">{fatalError}</p>
          <button onClick={() => window.location.reload()} className="px-6 py-2 bg-slate-800 rounded text-gray-50">Reload</button>
        </div>
      </div>
    );
  }

  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  const [viewState, setViewState] = useState<ViewState>('LANDING');
  const [appState, setAppState] = useState<AppState>(AppState.IDLE);

  const [currentAssets, setCurrentAssets] = useState<MediaAsset[]>([]);
  const [analysisResult, setAnalysisResult] = useState<ListingResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [history, setHistory] = useState<HistoryItem[]>([]);

  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [userSettings, setUserSettings] = useState<UserSettings>(DEFAULT_SETTINGS);

  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login');

  const [manualProduct, setManualProduct] = useState('');
  const [manualCondition, setManualCondition] = useState('Good');

  useEffect(() => {
    const initApp = async () => {
      try {
        const { data: { session } } = await (supabase.auth as any).getSession();
        setSession(session);
        if (session) {
          setViewState('SCANNER');
          await fetchUserData(session.user.id);
        }
        setLoading(false);
      } catch {
        setLoading(false);
      }
    };

    initApp();

    const { data: { subscription } } = (supabase.auth as any).onAuthStateChange((_event: any, session: any) => {
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
    try {
      const { data: profile } = await supabase.from('profiles').select('*').eq('id', userId).single();
      if (profile) setUserProfile(profile);

      const { data: settings } = await supabase.from('user_settings').select('*').eq('user_id', userId).single();
      if (settings) {
        setUserSettings({
          defaultCondition: settings.default_condition,
          defaultShippingCost: settings.default_shipping_cost,
          defaultFeeRate: settings.default_fee_rate,
          includePostageInProfit: false
        });
        setManualCondition(settings.default_condition);
      }

      fetchHistory(userId);
    } catch {}
  };

  const fetchHistory = async (userId: string) => {
    const { data: scans } = await supabase
      .from('scans')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(20);

    if (scans) {
      const items = scans.map((scan: any) => ({
        result: { ...scan.full_result, thumbnail: scan.thumbnail_url }
      }));
      setHistory(items);
    }
  };

  const saveToHistory = async (result: ListingResult, imageFile?: File) => {
    if (!session?.user) return;

    let publicUrl = '';

    try {
      if (imageFile) {
        const fileName = `${session.user.id}/${Date.now()}.jpg`;
        await supabase.storage.from('scan_images').upload(fileName, imageFile);
        const { data } = supabase.storage.from('scan_images').getPublicUrl(fileName);
        publicUrl = data.publicUrl;
      }

      await supabase.from('scans').insert({
        user_id: session.user.id,
        title: result.title,
        brand: result.brand,
        estimated_price_high: result.estimatedPrice?.high,
        thumbnail_url: publicUrl,
        profit_potential: result.profitPotential,
        full_result: result
      });

      const newItem = { result: { ...result, thumbnail: publicUrl } };
      setHistory([newItem, ...history]);

      if (userProfile) {
        const newCount = userProfile.scans_used + 1;
        await supabase.from('profiles').update({ scans_used: newCount }).eq('id', session.user.id);
        setUserProfile({ ...userProfile, scans_used: newCount });
      }
    } catch {}
  };

  const handleSaveSettings = async (newSettings: UserSettings) => {
    setUserSettings(newSettings);
    setManualCondition(newSettings.defaultCondition);

    if (session?.user) {
      await supabase.from('user_settings').upsert({
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
      alert('Free trial limit reached. Upgrade to Pro.');
      return;
    }

    setAppState(AppState.ANALYZING);
    setError(null);

    try {
      const manualContext = manualProduct || manualCondition ? { product: manualProduct, condition: manualCondition } : undefined;

      const imagesToSend = assets
        .filter(a => a.type === 'image' && a.base64 && a.mimeType)
        .map(a => ({ base64: a.base64!, mimeType: a.mimeType! }));

      const result = await analyzeItemForListing(imagesToSend, manualContext);

      setAnalysisResult(result);
      setAppState(AppState.SUCCESS);

      const primaryAsset = assets.find(a => a.type === 'image');
      saveToHistory(result, primaryAsset?.file);

    } catch (err: any) {
      setError(err.message || 'Failed to analyze item');
      setAppState(AppState.ERROR);
    }
  };

  const processFiles = (files: File[]) => {
    const assetPromises = files.map(file => new Promise<MediaAsset>(resolve => {
      const url = URL.createObjectURL(file);
      const type = file.type.startsWith('video') ? 'video' : 'image';

      if (type === 'image') {
        const reader = new FileReader();
        reader.onloadend = () => {
          const base64 = (reader.result as string).split(',')[1];

          resolve({
            id: window.crypto.randomUUID(),
            type: 'image',
            url,
            base64,
            mimeType: file.type,
            file
          });
        };
        reader.readAsDataURL(file);

      } else {
        resolve({
          id: window.crypto.randomUUID(),
          type: 'video',
          url,
          mimeType: file.type,
          file
        });
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
    await (supabase.auth as any).signOut();
    window.location.reload();
  };

  const openAuth = (mode: 'login' | 'signup') => {
    setAuthMode(mode);
    setIsAuthModalOpen(true);
  };

  if (loading) return <div className="min-h-screen bg-slate-950 flex items-center justify-center text-gray-50">Loading...</div>;

  if (!session) {
    return (
      <>
        <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} initialMode={authMode} />
        <LandingPage onLogin={() => openAuth('login')} onSignup={() => openAuth('signup')} />
      </>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-gray-50 font-sans">

      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        settings={userSettings}
        onSave={handleSaveSettings}
      />

      <nav className="border-b border-slate-700 bg-slate-900/90 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-2 cursor-pointer" onClick={() => setViewState('SCANNER')}>
              <div className="w-8 h-8 bg-mint-400 rounded-lg flex items-center justify-center">
                🔍
              </div>
              <span className="font-bold text-lg">Resll</span>
            </div>

            <div className="flex items-center gap-4">
              <button
                onClick={() => setViewState('USER_DASH')}
                className="px-3 py-1.5 bg-cyan-500 text-gray-50 rounded-lg text-xs font-bold"
              >
                UPGRADE
              </button>

              <button
                onClick={() => setViewState(viewState === 'USER_DASH' ? 'SCANNER' : 'USER_DASH')}
                className="p-1 rounded-full border border-slate-700"
              >
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-cyan-500 to-mint-400 flex items-center justify-center text-xs font-bold">
                  {userProfile?.email.charAt(0).toUpperCase()}
                </div>
              </button>

              <button onClick={() => setIsSettingsOpen(true)} className="p-2 text-gray-400">
                ⚙️
              </button>

              <button onClick={handleLogout} className="text-xs text-red-500 font-bold">Log Out</button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 py-12">

        {viewState === 'ADMIN_DASH' && <AdminDashboard />}

        {viewState === 'USER_DASH' && (
          <UserDashboard
            history={history}
            scansLeft={userProfile ? userProfile.scans_limit - userProfile.scans_used : 0}
            onLoadItem={(item) => {
              setAnalysisResult(item.result);
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
              <div className="max-w-3xl mx-auto">

                <Hero />

                <div className="mb-6 grid grid-cols-1 md:grid-cols-12 gap-4 bg-slate-800 p-4 rounded-xl border border-slate-700">

                  <div className="md:col-span-6">
                    <label className="block text-xs text-gray-400 mb-1">Product Name</label>
                    <input
                      type="text"
                      value={manualProduct}
                      onChange={(e) => setManualProduct(e.target.value)}
                      placeholder="Nike Air Max 90 Black Size 10"
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-3 text-gray-50"
                    />
                  </div>

                  <div className="md:col-span-3">
                    <label className="block text-xs text-gray-400 mb-1">Condition</label>
                    <select
                      value={manualCondition}
                      onChange={(e) => setManualCondition(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-3 text-gray-50"
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
                      className={`w-full py-3 px-4 rounded-lg font-bold text-sm
                        ${manualProduct ? 'bg-cyan-500 text-gray-50' : 'bg-slate-900 text-gray-400 border border-slate-700'}`}
                    >
                      {manualProduct ? 'Generate' : 'Enter Details'}
                    </button>
                  </div>
                </div>

                <UploadZone onFilesSelected={processFiles} disabled={false} />
              </div>
            )}

            {appState === AppState.ANALYZING && (
              <div className="max-w-2xl mx-auto mt-12">
                <AnalysisView />
              </div>
            )}

            {appState === AppState.SUCCESS && analysisResult && (
              <ResultCard result={analysisResult} assets={currentAssets} onReset={handleReset} />
            )}

            {appState === AppState.ERROR && (
              <div className="max-w-xl mx-auto mt-12 text-center bg-slate-900 border border-red-900/50 p-8 rounded-2xl">
                <h2 className="text-xl font-bold text-gray-50 mb-2">Scan Failed</h2>
                <p className="text-gray-400 mb-6">{error}</p>
                <button onClick={handleReset} className="px-6 py-2 bg-slate-800 text-gray-50 rounded-lg">
                  Try Again
                </button>
              </div>
            )}
          </>
        )}
      </main>

      <footer className="mt-20 border-t border-slate-700 py-8 text-center text-gray-400 text-sm">
        <p className="mb-2">&copy; {new Date().getFullYear()} Resll Analytics Ltd</p>
        <button onClick={() => setViewState(viewState === 'ADMIN_DASH' ? 'SCANNER' : 'ADMIN_DASH')} className="text-[10px] text-slate-800">
          Admin View
        </button>
      </footer>
    </div>
  );
};

export default App;
