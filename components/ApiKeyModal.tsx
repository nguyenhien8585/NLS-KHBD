
import React, { useState, useEffect } from 'react';
import { Settings, RotateCcw, CheckCircle2 } from 'lucide-react';

interface ApiKeyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (key: string, model: string) => void;
  currentKey: string;
  currentModel: string;
}

const MODELS = [
  { id: 'gemini-3-flash-preview', name: 'Gemini 3 Flash Preview', desc: 'Tốc độ cao, mặc định' },
  { id: 'gemini-3-pro-preview', name: 'Gemini 3 Pro Preview', desc: 'Cân bằng tốt' },
  { id: 'gemini-2.5-flash-latest', name: 'Gemini 2.5 Flash', desc: 'Ổn định, nhanh' },
];

const ApiKeyModal: React.FC<ApiKeyModalProps> = ({ isOpen, onClose, onSave, currentKey, currentModel }) => {
  const [keyInput, setKeyInput] = useState(currentKey);
  const [selectedModel, setSelectedModel] = useState(currentModel || 'gemini-3-flash-preview');

  useEffect(() => {
    setKeyInput(currentKey);
    if (currentModel) setSelectedModel(currentModel);
  }, [currentKey, currentModel]);

  if (!isOpen) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(keyInput, selectedModel);
    onClose();
  };

  const handleReset = () => {
    setKeyInput('');
    setSelectedModel('gemini-3-flash-preview');
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/40 backdrop-blur-[2px] animate-fade-in">
      <div className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-md p-8 m-4 transform transition-all border border-slate-100 max-h-[95vh] overflow-y-auto">
        
        {/* Header Section */}
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-3">
            <div className="text-blue-600">
              <Settings size={28} />
            </div>
            <h2 className="text-2xl font-bold text-slate-800 tracking-tight">Cài đặt API Key</h2>
          </div>
          <button 
            onClick={handleReset}
            className="text-slate-400 hover:text-blue-600 transition-colors p-1"
            title="Đặt lại"
          >
            <RotateCcw size={22} />
          </button>
        </div>

        <p className="text-slate-500 text-[15px] leading-relaxed mb-8">
          Để sử dụng Trợ Lý Giáo Viên 4.0, bạn cần cung cấp Gemini API Key (Google AI Studio). Bạn có thể nhập nhiều key để hệ thống tự động luân phiên.
        </p>

        <form onSubmit={handleSave} className="space-y-8">
          {/* Key Input Field - Multi-line Support */}
          <div>
            <label className="block text-[15px] font-bold text-slate-700 mb-3">
              Danh sách Gemini API Key (Mỗi key 1 dòng)
            </label>
            <textarea
              value={keyInput}
              onChange={(e) => setKeyInput(e.target.value)}
              placeholder="Nhập API Key 1&#10;Nhập API Key 2&#10;..."
              rows={4}
              className="w-full px-5 py-4 rounded-2xl border-2 border-slate-100 bg-slate-50 focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-50 outline-none transition-all text-slate-800 shadow-inner font-mono text-sm resize-none"
            />
          </div>

          {/* Model Selection */}
          <div>
            <label className="block text-[15px] font-bold text-slate-700 mb-4">
              Chọn Model AI
            </label>
            <div className="space-y-3">
              {MODELS.map((model) => (
                <div
                  key={model.id}
                  onClick={() => setSelectedModel(model.id)}
                  className={`relative cursor-pointer p-5 rounded-2xl border-2 transition-all flex justify-between items-center ${
                    selectedModel === model.id
                      ? 'border-blue-500 bg-white shadow-md'
                      : 'border-slate-100 hover:border-slate-200 bg-white'
                  }`}
                >
                  <div>
                    <h4 className={`font-bold text-[16px] ${selectedModel === model.id ? 'text-blue-600' : 'text-slate-700'}`}>
                      {model.name}
                    </h4>
                    <p className="text-xs text-slate-400 font-medium mt-1">{model.desc}</p>
                  </div>
                  {selectedModel === model.id && (
                    <div className="text-blue-600 animate-scale-in">
                      <CheckCircle2 size={20} />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Action Button */}
          <div className="pt-4 flex flex-col gap-4">
            <button
              type="submit"
              className="w-full bg-[#2563eb] hover:bg-blue-700 text-white font-bold py-4.5 px-8 rounded-2xl shadow-lg shadow-blue-200 transition-all active:scale-[0.98] text-[17px]"
            >
              Lưu & Bắt đầu
            </button>
            <p className="text-center text-[13px] text-slate-400 font-medium">
              Key được lưu cục bộ trên trình duyệt của bạn (LocalStorage).
            </p>
          </div>
        </form>
      </div>

      <style>{`
        .py-4.5 { padding-top: 1.125rem; padding-bottom: 1.125rem; }
        @keyframes scaleIn { from { transform: scale(0.8); opacity: 0; } to { transform: scale(1); opacity: 1; } }
        .animate-scale-in { animation: scaleIn 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275); }
      `}</style>
    </div>
  );
};

export default ApiKeyModal;
