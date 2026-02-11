import React, { useState, useEffect, useMemo } from 'react';
import { Commission, CommissionStatus, ThemeMode } from './types';
import { MOCK_COMMISSIONS } from './constants';
import { CommissionCard } from './components/CommissionCard';
import { AddCommissionForm } from './components/AddCommissionForm';
import { Search, Palette, Sparkles, Lock, Unlock, ArrowRight, ChevronDown, PenTool } from 'lucide-react';

// SHA-256 Hash for the admin password to avoid plaintext in source code
// Hash for 'Rongxiao0313'
const PASSWORD_HASH = '5e884898da28047151d0e56f8dc6292773603d0d6aabbdd62a11ef721d1542d8';

const App: React.FC = () => {
  // State
  const [commissions, setCommissions] = useState<Commission[]>([]);
  const [viewMode, setViewMode] = useState<ThemeMode>('client'); // Default is client
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<CommissionStatus | 'All'>('All');
  const [isAdding, setIsAdding] = useState(false);
  
  // Artist Login State
  const [currentArtist, setCurrentArtist] = useState<string>('');
  const [loginInput, setLoginInput] = useState('');

  // Data Loading State
  const [isLoaded, setIsLoaded] = useState(false);

  // Initialize Data
  useEffect(() => {
    const stored = localStorage.getItem('arttrack_commissions_zh_v1');
    if (stored) {
      try {
        let parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
             // Migration & Fixing Data
            parsed = parsed.map((c: any) => {
                let status = c.status;
                // Migrate Old Statuses to New Statuses
                if (status === '排單中') status = CommissionStatus.NOT_STARTED;
                else if (status === '大綱/草稿' || status === '初稿') status = CommissionStatus.IN_PROGRESS;
                else if (status === '修訂中' || status === '完稿校對') status = CommissionStatus.REVISION;
                else if (status === '結案') status = CommissionStatus.COMPLETED;
                
                // Fallback for types if they don't match exactly (optional, but safe)
                // We keep old type strings usually, but if we wanted to enforce strict typing we would map them too.
                // For now, let's assume old types are fine or user updates them manually.
                
                return {
                  ...c,
                  status: status,
                  artistId: c.artistId || '容霄', // Default to Rong Xiao if unknown
                  referenceImages: c.referenceImages || []
                };
            });
            setCommissions(parsed);
        } else {
            setCommissions(MOCK_COMMISSIONS);
        }
      } catch (e) {
        console.error("Failed to parse commissions from local storage", e);
        setCommissions(MOCK_COMMISSIONS);
      }
    } else {
      setCommissions(MOCK_COMMISSIONS);
    }
    setIsLoaded(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Persistence
  useEffect(() => {
    if (isLoaded) {
      try {
        localStorage.setItem('arttrack_commissions_zh_v1', JSON.stringify(commissions));
      } catch (e) {
        console.error("Storage quota exceeded", e);
        alert("⚠️ 瀏覽器儲存空間已滿！無法儲存新的變更。\n建議刪除一些舊的委託單，或減少上傳的圖片數量。");
      }
    }
  }, [commissions, isLoaded]);

  // Handlers
  const handleUpdateStatus = (id: string, newStatus: CommissionStatus) => {
    setCommissions(prev => prev.map(c => 
      c.id === id ? { ...c, status: newStatus, lastUpdated: new Date().toISOString().split('T')[0] } : c
    ));
  };

  const handleDelete = (id: string) => {
    // Confirmation is now handled in the CommissionCard component
    setCommissions(prev => prev.filter(c => c.id !== id));
  };

  const handleAdd = (newCommission: Commission) => {
    // Overwrite artistId with currently logged in artist or default to Rong Xiao
    const commissionToAdd = {
        ...newCommission,
        artistId: currentArtist || '容霄'
    };
    setCommissions(prev => [commissionToAdd, ...prev]);
    setIsAdding(false);
  };

  const toggleViewMode = () => {
    setViewMode(prev => prev === 'client' ? 'admin' : 'client');
  };

  // Helper to verify password hash
  const verifyPassword = async (input: string) => {
    try {
        const encoder = new TextEncoder();
        const data = encoder.encode(input);
        const hashBuffer = await crypto.subtle.digest('SHA-256', data);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
        return hashHex === PASSWORD_HASH;
    } catch (e) {
        console.error("Crypto error", e);
        return false;
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
      e.preventDefault();
      
      const isValid = await verifyPassword(loginInput);

      if (isValid) {
          setCurrentArtist('容霄');
          setLoginInput('');
      } else {
          alert('密碼錯誤，請重新輸入');
          setLoginInput('');
      }
  };

  const handleLogout = () => {
      setCurrentArtist('');
  };

  // Filter Logic
  const filteredCommissions = useMemo(() => {
    return commissions.filter(c => {
      // 1. Admin Mode: Must match logged in artist
      if (viewMode === 'admin' && currentArtist) {
          // If logged in as someone else (unlikely now), filter, otherwise show all if admin matches data
          if (c.artistId !== currentArtist) return false;
      }

      // 2. Client Mode: Show All (since it's just Rong Xiao's space)
      
      // 3. Search & Filter
      const term = searchTerm.toLowerCase();
      const matchesSearch = 
        c.clientName.toLowerCase().includes(term) || 
        c.title.toLowerCase().includes(term) ||
        c.id.toLowerCase().includes(term);
      
      const matchesFilter = statusFilter === 'All' || c.status === statusFilter;

      return matchesSearch && matchesFilter;
    });
  }, [commissions, searchTerm, statusFilter, viewMode, currentArtist]);

  // View Logic: Should we show the list?
  const shouldShowList = useMemo(() => {
    // Admin: Show list only if logged in
    if (viewMode === 'admin' && currentArtist) {
          return !!currentArtist;
    }
    // Client: Must search to see results
    return searchTerm.trim().length > 0;
  }, [viewMode, searchTerm, currentArtist]);

  // Statistics
  const stats = useMemo(() => {
    let targetCommissions = commissions;

    if (viewMode === 'admin') {
        // Admin: Filter by current artist
        targetCommissions = currentArtist 
            ? commissions.filter(c => c.artistId === currentArtist)
            : [];
    }
    // Client mode shows stats for all (Rong Xiao's) commissions

    return {
        queue: targetCommissions.filter(c => c.status === CommissionStatus.NOT_STARTED).length,
        active: targetCommissions.filter(c => c.status === CommissionStatus.IN_PROGRESS || c.status === CommissionStatus.REVISION).length,
        done: targetCommissions.filter(c => c.status === CommissionStatus.COMPLETED).length
    }
  }, [commissions, viewMode, currentArtist]);

  return (
    <div className="min-h-screen bg-[#fbfaf8] text-stone-700 selection:bg-[#E7C2BB] flex flex-col">
      
      {/* Main Content */}
      <main className="flex-grow pt-8 pb-10 px-6 max-w-5xl mx-auto w-full">
        
        {/* Top Header - SIMPLIFIED */}
        <div className="flex items-center justify-between mb-8 opacity-90 h-10">
            {/* Left side empty or simple icon */}
            <div className="flex items-center gap-2">
                 {/* Only showing icon for minimal look */}
                 <div className="text-[#E7C2BB]">
                    <Sparkles size={18} />
                </div>
            </div>
            
            {/* Show Logged in Artist in Admin Mode */}
            {viewMode === 'admin' && currentArtist && (
                <div className="flex items-center gap-3 animate-in fade-in slide-in-from-right-4">
                    <span className="text-sm font-bold bg-white px-3 py-1.5 rounded-full border border-stone-200 shadow-sm text-stone-600">
                        ✒️ {currentArtist}
                    </span>
                    <button 
                        onClick={handleLogout}
                        className="text-xs font-bold text-stone-400 hover:text-stone-600 underline"
                    >
                        登出
                    </button>
                </div>
            )}
        </div>

        {/* Intro / Stats */}
        {/* If Admin + Not Logged In, hide stats to keep login screen clean */}
        {!(viewMode === 'admin' && !currentArtist) && (
            <div className="mb-10 text-center sm:text-left sm:flex justify-between items-end animate-in fade-in slide-in-from-top-4 duration-500">
                <div className="mb-8 sm:mb-0">
                    <h2 className="text-3xl font-bold text-[#8d6e63] mb-3 tracking-tight">
                        {viewMode === 'client' 
                            ? '容霄的委託進度一覽 ✨'
                            : `歡迎回來，${currentArtist}！✒️`
                        }
                    </h2>
                    <p className="text-stone-500 max-w-lg font-medium leading-relaxed">
                        {viewMode === 'client' 
                            ? '輸入您的名稱 (ID) 或關鍵字，查詢文章與劇本的撰寫進度。' 
                            : '今天也要文思泉湧！這裡可以管理排單和寫作進度喔。'}
                    </p>
                </div>
                <div className="flex gap-3 justify-center sm:justify-end text-sm">
                    <div className="bg-white border-2 border-stone-200 px-4 py-3 rounded-2xl text-center min-w-[80px] shadow-sm transform hover:-translate-y-1 transition-transform">
                        <div className="text-2xl font-bold text-stone-600">{stats.queue}</div>
                        <div className="text-xs text-stone-400 font-bold">排單中</div>
                    </div>
                    <div className="bg-white border-2 border-[#E7C2BB] px-4 py-3 rounded-2xl text-center min-w-[80px] shadow-sm transform hover:-translate-y-1 transition-transform">
                        <div className="text-2xl font-bold text-[#bcaaa4]">{stats.active}</div>
                        <div className="text-xs text-[#bcaaa4]/70 font-bold">撰寫中</div>
                    </div>
                    <div className="bg-white border-2 border-[#E7C2BB]/20 px-4 py-3 rounded-2xl text-center min-w-[80px] shadow-sm transform hover:-translate-y-1 transition-transform">
                        <div className="text-2xl font-bold text-[#E7C2BB]">{stats.done}</div>
                        <div className="text-xs text-[#E7C2BB] font-bold">已交稿</div>
                    </div>
                </div>
            </div>
        )}

        {/* --- Logic Branching --- */}
        
        {viewMode === 'admin' && !currentArtist ? (
            // === Admin Login Screen ===
            <div className="flex flex-col items-center justify-center py-20 animate-in zoom-in-95 duration-300">
                <div className="bg-white p-8 rounded-3xl shadow-xl shadow-stone-200 border-2 border-stone-100 max-w-md w-full text-center">
                    <div className="w-16 h-16 bg-[#E7C2BB]/20 text-[#E7C2BB] rounded-2xl flex items-center justify-center mx-auto mb-6 transform rotate-3">
                        <PenTool size={32} />
                    </div>
                    <h3 className="text-2xl font-bold text-stone-700 mb-2">作者後台登入</h3>
                    <p className="text-stone-400 mb-8 font-medium">請輸入密碼以管理委託</p>
                    
                    <form onSubmit={handleLogin} className="space-y-4">
                        <input 
                            type="password" 
                            placeholder="請輸入密碼" 
                            className="w-full bg-stone-50 border-2 border-stone-200 rounded-xl px-4 py-3 text-center font-bold text-stone-700 focus:outline-none focus:border-[#E7C2BB] focus:ring-4 focus:ring-[#E7C2BB]/10 transition-all placeholder:font-normal placeholder:text-stone-300"
                            value={loginInput}
                            onChange={(e) => setLoginInput(e.target.value)}
                            autoFocus
                        />
                        <button 
                            type="submit"
                            disabled={!loginInput.trim()}
                            className="w-full bg-[#E7C2BB] hover:bg-[#d4aeb7] text-stone-700 font-bold py-3 rounded-xl transition-all shadow-lg shadow-[#E7C2BB]/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                            進入管理介面 <ArrowRight size={18} />
                        </button>
                    </form>
                </div>
            </div>
        ) : (
            // === Main Dashboard (Client Search or Admin Manager) ===
            <>
                {/* Controls - Floating & Rounded */}
                <div className="flex flex-col md:flex-row gap-4 mb-10 sticky top-6 z-40 bg-[#fbfaf8]/90 p-4 -mx-4 md:mx-0 rounded-3xl border-2 border-white shadow-lg shadow-stone-200/50 backdrop-blur-md animate-in fade-in slide-in-from-bottom-4">
                  <div className="relative flex-grow">
                    <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-stone-400" size={20} />
                    <input 
                      type="text" 
                      placeholder={viewMode === 'client' ? "輸入您的名稱 (ID) 查詢進度..." : "在您的委託中搜尋..."}
                      className="w-full bg-white border-2 border-stone-200 text-stone-700 pl-12 pr-6 py-3 rounded-full focus:ring-4 focus:ring-[#E7C2BB]/10 focus:border-[#E7C2BB] focus:outline-none transition-all placeholder:text-stone-400 font-medium"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                  
                  <div className="flex gap-3 overflow-x-auto pb-2 md:pb-0 hide-scrollbar px-1">
                    <select 
                        className="bg-white border-2 border-stone-200 text-stone-600 px-6 py-3 rounded-full focus:ring-4 focus:ring-[#E7C2BB]/10 focus:border-[#E7C2BB] focus:outline-none font-bold cursor-pointer hover:border-stone-300"
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value as any)}
                    >
                        <option value="All">所有狀態</option>
                        {Object.values(CommissionStatus).map(s => (
                            <option key={s} value={s}>{s}</option>
                        ))}
                    </select>
                    
                    {viewMode === 'admin' && (
                        <button 
                            onClick={() => setIsAdding(!isAdding)}
                            className="flex items-center gap-2 bg-[#E7C2BB] hover:bg-[#d4aeb7] text-stone-700 px-6 py-3 rounded-full font-bold transition-all shadow-lg shadow-[#E7C2BB]/20 hover:shadow-xl hover:-translate-y-0.5 whitespace-nowrap active:scale-95"
                        >
                            <Palette size={20} /> 新增委託
                        </button>
                    )}
                  </div>
                </div>

                {/* Add Form */}
                {viewMode === 'admin' && isAdding && (
                    <AddCommissionForm onAdd={handleAdd} onCancel={() => setIsAdding(false)} />
                )}

                {/* List */}
                <div className="space-y-6">
                    {!shouldShowList ? (
                        // Client Mode: No Search Yet
                        <div className="text-center py-20 opacity-70">
                            <div className="mx-auto w-20 h-20 bg-stone-100/50 rounded-full flex items-center justify-center mb-5 animate-[pulse_3s_ease-in-out_infinite]">
                                <Search className="text-stone-300" size={36} />
                            </div>
                            <h3 className="text-xl font-bold text-stone-500">輸入委託人名稱開始查詢</h3>
                            <p className="text-stone-400 mt-2 font-medium text-sm">請在上方搜尋欄輸入您的 ID 以查看進度</p>
                        </div>
                    ) : filteredCommissions.length === 0 ? (
                        // Search resulted in empty
                        <div className="text-center py-24 bg-white rounded-3xl border-2 border-dashed border-stone-200">
                            <div className="mx-auto w-20 h-20 bg-stone-100 rounded-full flex items-center justify-center mb-4">
                                <Search className="text-stone-400" size={32} />
                            </div>
                            <h3 className="text-xl font-bold text-stone-600">找不到相關委託捏...</h3>
                            <p className="text-stone-400 mt-2 font-medium">
                                {viewMode === 'admin' ? "目前沒有符合條件的委託" : "試試看別的關鍵字？"}
                            </p>
                        </div>
                    ) : (
                        // Results List
                        filteredCommissions.map(commission => (
                            <CommissionCard 
                                key={commission.id}
                                commission={commission}
                                isAdmin={viewMode === 'admin'}
                                onUpdateStatus={handleUpdateStatus}
                                onDelete={handleDelete}
                            />
                        ))
                    )}
                </div>
            </>
        )}

      </main>

      {/* Footer with Admin Switch */}
      <footer className="py-8 border-t border-stone-200 text-center relative">
        <p className="text-stone-400 text-sm font-medium mb-4">
            © {new Date().getFullYear()} ArtTrack Dashboard. Made with 💚 for 容霄.
        </p>
        
        <div className="flex justify-center">
            <button 
                onClick={toggleViewMode}
                className={`p-2 rounded-full transition-all duration-300 ${viewMode === 'admin' ? 'bg-stone-200 text-stone-600' : 'text-stone-300 hover:text-stone-400'}`}
                title={viewMode === 'client' ? "作者登入" : "返回查詢"}
            >
                {viewMode === 'admin' ? <Unlock size={16} /> : <Lock size={16} />}
            </button>
        </div>
      </footer>
    </div>
  );
};

export default App;