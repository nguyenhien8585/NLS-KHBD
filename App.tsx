
import React, { useState, useEffect } from 'react';
import { TabOption, GenerationState } from './types';
import TabCreate from './components/TabCreate';
import TabEnhance from './components/TabEnhance';
import LessonRenderer from './components/LessonRenderer';
import { BookOpen, Loader2, Sparkles, AlertCircle, BrainCircuit, FileSearch, Zap, CheckCircle2 } from 'lucide-react';

const LOADING_STEPS = [
  { icon: <FileSearch className="text-blue-500" />, text: "Đang phân tích dữ liệu đầu vào..." },
  { icon: <BrainCircuit className="text-purple-500" />, text: "Trí tuệ nhân tạo đang lập dàn ý 5512..." },
  { icon: <Zap className="text-amber-500" />, text: "Đang đối soát Khung năng lực số (NLS)..." },
  { icon: <Sparkles className="text-green-500" />, text: "Đang hoàn thiện bảng biểu và nội dung chi tiết..." },
];

interface Toast {
  id: number;
  message: string;
  type: 'success' | 'info' | 'error';
}

function App() {
  const [activeTab, setActiveTab] = useState<TabOption>(TabOption.CREATE);
  const [selectedModel, setSelectedModel] = useState<string>('gemini-3-flash-preview');
  const [loadingStep, setLoadingStep] = useState(0);
  const [toasts, setToasts] = useState<Toast[]>([]);
  
  const [genState, setGenState] = useState<GenerationState>({
    isLoading: false,
    result: null,
    error: null
  });

  // Fix: API key selection UI is prohibited. The key must be handled externally via environment variables.
  useEffect(() => {
    const storedModel = localStorage.getItem('GEMINI_USER_MODEL');
    if (storedModel) setSelectedModel(storedModel);
  }, []);

  useEffect(() => {
    let interval: any;
    if (genState.isLoading) {
      setLoadingStep(0);
      interval = setInterval(() => {
        setLoadingStep((prev) => (prev + 1) % LOADING_STEPS.length);
      }, 3000);
    }
    return () => clearInterval(interval);
  }, [genState.isLoading]);

  const addToast = (message: string, type: 'success' | 'info' | 'error' = 'info') => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 4000);
  };

  const handleResult = (result: string) => {
    setGenState({ isLoading: false, result, error: null });
    addToast("Đã soạn thảo giáo án thành công!", "success");
  };

  const handleError = (error: string) => {
    if (error) {
      addToast(error, "error");
    }
    setGenState(prev => ({ ...prev, isLoading: false, error: error || null }));
  };

  const setLoading = (isLoading: boolean) => {
    // Reset old result when starting new generation to ensure clear UI state.
    setGenState(prev => ({ 
      ...prev, 
      isLoading, 
      result: isLoading ? null : prev.result,
      error: isLoading ? null : prev.error 
    }));
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-800 font-sans relative">
      {/* Toast System */}
      <div className="fixed top-20 right-4 z-[9999] flex flex-col gap-2 pointer-events-none">
        {toasts.map(toast => (
          <div 
            key={toast.id} 
            className={`pointer-events-auto flex items-center gap-3 px-5 py-4 rounded-2xl shadow-2xl border-2 transform transition-all animate-slide-in-right ${
              toast.type === 'success' ? 'bg-white border-green-500 text-green-700' :
              toast.type === 'error' ? 'bg-white border-red-500 text-red-700' :
              'bg-blue-600 border-blue-400 text-white shadow-blue-200'
            }`}
          >
            {toast.type === 'success' && <CheckCircle2 size={20} className="text-green-500" />}
            {toast.type === 'error' && <AlertCircle size={20} className="text-red-500" />}
            {toast.type === 'info' && <Loader2 size={20} className="animate-spin text-blue-100" />}
            <span className="text-sm font-black tracking-tight">{toast.message}</span>
          </div>
        ))}
      </div>

      <header className="bg-white border-b border-slate-200 sticky top-0 z-40 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center h-16">
          <div className="flex items-center gap-3">
            <div className="bg-blue-600 p-2 rounded-lg text-white shadow-md">
              <BookOpen size={24} />
            </div>
            <div>
              <h1 className="text-lg font-black tracking-tight text-slate-900">Trợ Lý Giáo Viên 4.0</h1>
              <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Chuẩn 5512 • Tích hợp NLS</p>
            </div>
          </div>
          
          {/* Fix: UI elements for managing API keys are strictly prohibited according to guidelines. */}
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-white p-1.5 rounded-2xl shadow-sm border border-slate-200 flex">
              <button
                onClick={() => !genState.isLoading && setActiveTab(TabOption.CREATE)}
                className={`flex-1 py-3.5 rounded-xl text-sm font-black transition-all uppercase tracking-wider ${activeTab === TabOption.CREATE ? 'bg-blue-600 text-white shadow-lg shadow-blue-100' : 'text-slate-500 hover:bg-slate-50'}`}
                disabled={genState.isLoading}
              >
                Soạn bài mới
              </button>
              <button
                onClick={() => !genState.isLoading && setActiveTab(TabOption.ENHANCE)}
                className={`flex-1 py-3.5 rounded-xl text-sm font-black transition-all uppercase tracking-wider ${activeTab === TabOption.ENHANCE ? 'bg-blue-600 text-white shadow-lg shadow-blue-100' : 'text-slate-500 hover:bg-slate-50'}`}
                disabled={genState.isLoading}
              >
                Chuẩn hóa file
              </button>
            </div>

            <div className={`bg-white rounded-[2.5rem] shadow-sm border border-slate-200 p-8 transition-all duration-500 ${genState.isLoading ? 'opacity-50 pointer-events-none scale-[0.98]' : 'opacity-100'}`}>
              {activeTab === TabOption.CREATE ? (
                <TabCreate onResult={handleResult} onError={handleError} setLoading={setLoading} isLoading={genState.isLoading} modelId={selectedModel} />
              ) : (
                <TabEnhance onResult={handleResult} onError={handleError} setLoading={setLoading} isLoading={genState.isLoading} modelId={selectedModel} />
              )}
            </div>
          </div>

          <div className="lg:col-span-7 min-h-[600px] sticky top-24">
            {genState.isLoading ? (
              <div className="h-full min-h-[580px] flex flex-col items-center justify-center bg-white rounded-[3rem] border-2 border-blue-100 p-12 text-center shadow-2xl relative overflow-hidden animate-fade-in">
                {/* Progress Bar Top */}
                <div className="absolute top-0 left-0 w-full h-2 bg-slate-50">
                    <div className="h-full bg-gradient-to-r from-blue-400 via-blue-600 to-blue-400 animate-loading-bar shadow-[0_0_10px_rgba(37,99,235,0.5)]"></div>
                </div>
                
                <div className="mb-12 relative">
                    <div className="w-36 h-36 rounded-full bg-blue-50 flex items-center justify-center animate-pulse-slow relative z-10">
                        <Loader2 className="h-16 w-16 text-blue-600 animate-spin" strokeWidth={2.5} />
                    </div>
                    <div className="absolute inset-[-10px] rounded-full border-4 border-dashed border-blue-100 animate-spin-slow"></div>
                </div>

                <div className="space-y-8 max-w-md mx-auto w-full">
                    <div className="space-y-2">
                        <h3 className="text-3xl font-black text-slate-900 tracking-tight">Hệ thống đang soạn thảo...</h3>
                        <p className="text-slate-500 font-bold uppercase text-[11px] tracking-[0.2em]">Sử dụng: <span className="text-blue-600">{selectedModel}</span></p>
                    </div>

                    <div className="bg-slate-50 rounded-[2.5rem] p-8 border border-slate-100 shadow-inner transition-all duration-500 transform">
                        <div className="flex flex-col items-center gap-5">
                           <div className="p-4 bg-white rounded-2xl shadow-md animate-bounce-subtle">
                                {LOADING_STEPS[loadingStep].icon}
                           </div>
                           <div className="space-y-2">
                               <span className="text-lg font-black text-blue-700 block transition-all duration-700 animate-fade-in-up">
                                    {LOADING_STEPS[loadingStep].text}
                               </span>
                               <div className="flex justify-center gap-1.5">
                                   {[0, 1, 2, 3].map(i => (
                                       <div key={i} className={`w-2 h-2 rounded-full transition-all duration-500 ${i === loadingStep ? 'bg-blue-600 w-6' : 'bg-slate-200'}`} />
                                   ))}
                               </div>
                           </div>
                        </div>
                    </div>
                </div>
              </div>
            ) : genState.result ? (
              <LessonRenderer content={genState.result} />
            ) : (
              <div className="h-full min-h-[580px] flex flex-col items-center justify-center border-4 border-dashed border-slate-200 rounded-[3rem] bg-white text-slate-300 group hover:border-blue-200 transition-colors duration-500">
                <div className="bg-slate-50 p-8 rounded-full mb-8 group-hover:scale-110 transition-transform duration-500">
                    <Sparkles size={80} className="opacity-20 text-blue-500" />
                </div>
                <div className="text-center space-y-2">
                    <p className="text-xl font-black text-slate-400 uppercase tracking-[0.25em]">KẾT QUẢ HIỂN THỊ TẠI ĐÂY</p>
                    <p className="text-sm font-medium text-slate-400">Vui lòng nhập liệu và nhấn nút tạo ở bảng bên trái</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      <style>{`
        @keyframes loadingBar {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        .animate-loading-bar {
          width: 50%;
          animation: loadingBar 2s cubic-bezier(0.4, 0, 0.2, 1) infinite;
        }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        .animate-fade-in { animation: fadeIn 0.4s ease-out; }
        @keyframes fadeInUp { from { opacity: 0; transform: translateY(15px); } to { opacity: 1; transform: translateY(0); } }
        .animate-fade-in-up { animation: fadeInUp 0.5s ease-out; }
        @keyframes slideInRight { from { opacity: 0; transform: translateX(100px); } to { opacity: 1; transform: translateX(0); } }
        .animate-slide-in-right { animation: slideInRight 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards; }
        @keyframes pulseSlow { 0%, 100% { transform: scale(1); opacity: 1; } 50% { transform: scale(1.05); opacity: 0.9; } }
        .animate-pulse-slow { animation: pulseSlow 3s ease-in-out infinite; }
        @keyframes spinSlow { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        .animate-spin-slow { animation: spinSlow 12s linear infinite; }
        @keyframes bounceSubtle { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-5px); } }
        .animate-bounce-subtle { animation: bounceSubtle 2s ease-in-out infinite; }
      `}</style>
    </div>
  );
}

export default App;
