
import React, { useState, useRef } from 'react';
import { generateLessonPlan, NLS_CONTEXT_REF } from '../services/geminiService';
import { Upload, Sparkles, ArrowRight, X, Loader2, CheckCircle2 } from 'lucide-react';
import { processUploadedFile, ProcessedFile } from '../utils/fileProcessing';

interface TabEnhanceProps {
  onResult: (result: string) => void;
  onError: (error: string) => void;
  setLoading: (loading: boolean) => void;
  isLoading: boolean;
  modelId: string;
}

const TabEnhance: React.FC<TabEnhanceProps> = ({ onResult, onError, setLoading, isLoading, modelId }) => {
  const [content, setContent] = useState<string>('');
  const [fileName, setFileName] = useState<string | null>(null);
  const [pdfPart, setPdfPart] = useState<{mimeType: string, data: string} | undefined>(undefined);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    try {
      setFileName("Đang xử lý...");
      const processed: ProcessedFile = await processUploadedFile(file);

      if (processed.type === 'pdf_part') {
         setPdfPart({ mimeType: 'application/pdf', data: processed.content });
         setFileName(processed.fileName);
         setContent(`(Đã tải lên file PDF: ${processed.fileName}. AI sẽ đọc trực tiếp nội dung từ file này)`);
      } else {
         setPdfPart(undefined);
         setContent(processed.content);
         setFileName(processed.fileName);
      }
    } catch (err: any) {
      onError(err.message);
      setFileName(null);
    }
  };

  const clearFile = (e: React.MouseEvent) => {
      e.stopPropagation();
      setFileName(null);
      setPdfPart(undefined);
      setContent('');
      if (fileInputRef.current) fileInputRef.current.value = '';
  }

  const handleSubmit = async () => {
    if (!content.trim() && !pdfPart) {
      onError("Vui lòng dán nội dung giáo án hoặc tải file lên.");
      return;
    }

    setLoading(true);
    onError("");

    await new Promise(resolve => setTimeout(resolve, 50));

    const prompt = `
      NHIỆM VỤ: TÁI TẠO LẠI HOÀN TOÀN BỘ GIÁO ÁN VÀ THÊM NLS THEO CHUẨN 5512.
      HÃY VIẾT ĐẦY ĐỦ CHI TIẾT, KHÔNG TÓM TẮT.

      CẤU TRÚC BẮT BUỘC:
      1. Mục tiêu (Tích hợp NLS + Mã chuẩn xác)
      2. Thiết bị dạy học
      3. TIẾN TRÌNH DẠY HỌC (Bảng Markdown 2 cột):
         | HOẠT ĐỘNG CỦA GV - HS | DỰ KIẾN SẢN PHẨM |
      4. Đánh giá

      DỮ LIỆU ĐẦU VÀO:
      """
      ${content}
      """

      THAM CHIẾU NLS:
      """
      ${NLS_CONTEXT_REF}
      """
    `;

    try {
      // Corrected call to generateLessonPlan to match signature (prompt, pdfPart, modelId)
      const result = await generateLessonPlan(prompt, pdfPart, modelId);
      if (result) {
        onResult(result);
      } else {
        onError("AI không trả về kết quả.");
        setLoading(false);
      }
    } catch (err: any) {
      onError(err.message);
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="bg-blue-50/50 border border-blue-100 rounded-[1.5rem] p-5 text-sm shadow-sm relative overflow-hidden group">
        <h3 className="font-black flex items-center gap-2 mb-3 uppercase text-blue-700 tracking-wider">
            CHUẨN HÓA GIÁO ÁN CŨ
        </h3>
        <ul className="list-none space-y-2.5 text-slate-600 relative z-10">
            <li className="flex items-start gap-2">
                <CheckCircle2 size={16} className="text-blue-500 mt-0.5 shrink-0" />
                <span className="font-medium">Chuyển đổi file cũ sang 5512</span>
            </li>
            <li className="flex items-start gap-2">
                <CheckCircle2 size={16} className="text-blue-500 mt-0.5 shrink-0" />
                <span className="font-medium">Tích hợp Khung năng lực số 2025</span>
            </li>
        </ul>
      </div>

      <div className="space-y-4">
        <div 
          onClick={() => !isLoading && fileInputRef.current?.click()}
          className={`relative group cursor-pointer border-2 border-dashed rounded-2xl p-10 transition-all duration-300 text-center ${
            fileName 
            ? 'border-blue-200 bg-blue-50/30' 
            : 'border-slate-300 bg-slate-50/20 hover:border-blue-400 hover:bg-blue-50/20 hover:shadow-lg'
          }`}
        >
            <input type="file" ref={fileInputRef} onChange={handleFileChange} disabled={isLoading} className="hidden" accept=".docx,.pdf" />
            
            <div className="flex flex-col items-center gap-3">
                <div className={`p-4 rounded-full transition-all duration-300 ${fileName ? 'bg-blue-100 text-blue-600' : 'bg-white text-slate-400 shadow-sm group-hover:scale-110 group-hover:text-blue-500'}`}>
                    {fileName ? <CheckCircle2 size={32} /> : <Upload size={32} />}
                </div>
                <p className={`text-base font-extrabold ${fileName ? 'text-blue-700' : 'text-slate-700'}`}>
                    {fileName || 'Tải giáo án gốc (.docx/.pdf)'}
                </p>
                {fileName && !isLoading && (
                    <button onClick={clearFile} className="absolute top-4 right-4 p-2 rounded-full hover:bg-red-50 text-slate-400 hover:text-red-500 transition-colors">
                        <X size={18} />
                    </button>
                )}
            </div>
        </div>

        <div className="space-y-1.5">
          <label className="text-[11px] font-bold text-slate-500 uppercase tracking-widest ml-1">Nội dung text (Nếu không tải file)</label>
          <textarea
              rows={4}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              disabled={isLoading}
              placeholder="Dán giáo án cũ vào đây..."
              className="w-full rounded-xl border-slate-200 bg-slate-50 focus:bg-white shadow-sm focus:border-blue-500 focus:ring-4 focus:ring-blue-50 p-4 border outline-none transition-all text-sm"
          />
        </div>
      </div>

      <button
        onClick={handleSubmit}
        disabled={isLoading || (!content && !pdfPart)}
        className={`w-full flex justify-center items-center gap-3 font-black py-4.5 px-6 rounded-2xl transition-all shadow-xl active:scale-[0.98] ${
            isLoading 
            ? 'bg-slate-400 cursor-wait text-white shadow-none' 
            : 'bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white shadow-blue-100/50 hover:shadow-blue-200'
        }`}
      >
        {isLoading ? (
            <>
                <Loader2 size={24} className="animate-spin" />
                <span className="tracking-widest uppercase">ĐANG XỬ LÝ TOÀN BỘ...</span>
            </>
        ) : (
            <>
                <Sparkles size={24} />
                <span className="tracking-wider uppercase">CHUẨN HÓA & THÊM NLS</span>
                <ArrowRight size={24} className="group-hover:translate-x-1 transition-transform" />
            </>
        )}
      </button>
    </div>
  );
};

export default TabEnhance;
