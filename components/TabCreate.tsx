
import React, { useState, useRef } from 'react';
import { Subject, LessonPlanInput } from '../types';
import { Upload, Sparkles, X, Loader2, CheckCircle2, Cpu, BookOpenText, ChevronDown, ChevronRight, Target, Info } from 'lucide-react';
import { generateLessonPlan, NLS_CONTEXT_REF } from '../services/geminiService';
import { processUploadedFile, ProcessedFile } from '../utils/fileProcessing';

const NLS_FRAMEWORK = [
  {
    domain: "Lĩnh vực 1: Khai thác thiết bị và phần mềm",
    items: [
      { id: '1.1', label: '1.1. Khai thác thiết bị số' },
      { id: '1.2', label: '1.2. Khai thác phần mềm ứng dụng' }
    ]
  },
  {
    domain: "Lĩnh vực 2: Thông tin và dữ liệu",
    items: [
      { id: '2.1', label: '2.1. Tìm kiếm và lọc dữ liệu số' },
      { id: '2.2', label: '2.2. Đánh giá dữ liệu số' },
      { id: '2.3', label: '2.3. Quản lý dữ liệu số' }
    ]
  },
  {
    domain: "Lĩnh vực 3: Truyền thông và cộng tác",
    items: [
      { id: '3.1', label: '3.1. Tương tác trong môi trường số' },
      { id: '3.2', label: '3.2. Chia sẻ thông tin số' },
      { id: '3.3', label: '3.3. Cộng tác số' },
      { id: '3.4', label: '3.4. Ứng xử chuẩn mực số' }
    ]
  },
  {
    domain: "Lĩnh vực 4: Sáng tạo nội dung số",
    items: [
      { id: '4.1', label: '4.1. Phát triển nội dung số' },
      { id: '4.2', label: '4.2. Chỉnh sửa nội dung số' },
      { id: '4.3', label: '4.3. Bản quyền và giấy phép' },
      { id: '4.4', label: '4.4. Lập trình' }
    ]
  },
  {
    domain: "Lĩnh vực 5: An toàn và bảo mật số",
    items: [
      { id: '5.1', label: '5.1. Bảo vệ thiết bị số' },
      { id: '5.2', label: '5.2. Bảo vệ dữ liệu cá nhân' },
      { id: '5.3', label: '5.3. Bảo vệ sức khoẻ' },
      { id: '5.4', label: '5.4. Bảo vệ môi trường' }
    ]
  },
  {
    domain: "Lĩnh vực 6: Giải quyết vấn đề",
    items: [
      { id: '6.1', label: '6.1. Giải quyết vấn đề kỹ thuật' },
      { id: '6.2', label: '6.2. Sáng tạo trong dùng công nghệ' },
      { id: '6.3', label: '6.3. Tự học phát triển NLS' }
    ]
  },
  {
    domain: "Lĩnh vực 7: Định hướng nghề nghiệp",
    items: [
      { id: '7.1', label: '7.1. Tìm hiểu thị trường lao động số' },
      { id: '7.2', label: '7.2. Tìm kiếm việc làm trực tuyến' }
    ]
  }
];

interface TabCreateProps {
  onResult: (result: string) => void;
  onError: (error: string) => void;
  setLoading: (loading: boolean) => void;
  isLoading: boolean;
  modelId: string;
}

const TabCreate: React.FC<TabCreateProps> = ({ onResult, onError, setLoading, isLoading, modelId }) => {
  const [formData, setFormData] = useState<LessonPlanInput>({
    subject: Subject.MATH,
    grade: '12',
    textbook: 'Kết nối tri thức với cuộc sống',
    duration: '1 tiết (45 phút)',
    lessonName: '',
    yccd: '',
    content: '',
    selectedNls: []
  });

  const [expandedDomains, setExpandedDomains] = useState<string[]>([]);
  const [fileName, setFileName] = useState<string | null>(null);
  const [pdfPart, setPdfPart] = useState<{mimeType: string, data: string} | undefined>(undefined);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const toggleDomain = (domain: string) => {
    setExpandedDomains(prev => 
      prev.includes(domain) ? prev.filter(d => d !== domain) : [...prev, domain]
    );
  };

  const toggleNls = (id: string) => {
    setFormData(prev => ({
      ...prev,
      selectedNls: prev.selectedNls.includes(id)
        ? prev.selectedNls.filter(i => i !== id)
        : [...prev.selectedNls, id]
    }));
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setFileName("Đang tải...");
      const processed: ProcessedFile = await processUploadedFile(file);

      if (processed.type === 'pdf_part') {
        setPdfPart({ mimeType: 'application/pdf', data: processed.content });
        setFileName(processed.fileName);
      } else {
        setFormData(prev => ({ 
            ...prev, 
            content: prev.content + "\n" + processed.content 
        }));
        setPdfPart(undefined);
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
      if (fileInputRef.current) fileInputRef.current.value = '';
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.lessonName.trim()) return;
    
    setLoading(true);

    const nlsPrompt = formData.selectedNls.length > 0 
      ? `BẮT BUỘC TÍCH HỢP TRỌNG TÂM các mã Năng lực số sau: ${formData.selectedNls.join(', ')}.`
      : `TỰ ĐỘNG PHÂN TÍCH nội dung và gán ít nhất 2 mã Năng lực số (NLS) phù hợp nhất theo TT 02/2025.`;

    const prompt = `
      HÃY SOẠN MỘT GIÁO ÁN TOÀN DIỆN (CHUẨN 5512 VÀ NLS 2025)
      Môn: ${formData.subject} | Lớp: ${formData.grade} | Bài: "${formData.lessonName}"
      
      YÊU CẦU CẦN ĐẠT (YCCĐ): 
      ${formData.yccd || 'Tự động xác định theo Chương trình GDPT 2018'}

      NĂNG LỰC SỐ:
      ${nlsPrompt}

      DỮ LIỆU ĐẦU VÀO: ${formData.content}
      THAM CHIẾU NLS: ${NLS_CONTEXT_REF}

      YÊU CẦU CỤ THỂ:
      1. BẮT ĐẦU từ phần thông tin hành chính (Trường, Tổ, Giáo viên, Bài học).
      2. HOẠT ĐỘNG 4 (VẬN DỤNG): Phải cực kỳ chi tiết như ảnh mẫu. Bao gồm: Bài toán thực tế liên quan, kịch bản yêu cầu HS giải ra giấy, chụp ảnh nộp qua Azota, GV nhận xét trực tiếp trên màn hình. Cột Sản phẩm phải có lời giải full và đáp số.
      3. PHẦN KẾT: Có dòng ngày tháng năm và khu vực ký tên của Người soạn, Tổ trưởng chuyên môn.
    `;

    try {
      const result = await generateLessonPlan(prompt, pdfPart, modelId);
      if (result) {
        onResult(result);
      } else {
        onError("AI không trả về kết quả.");
      }
    } catch (err: any) {
      onError(err.message || "Đã xảy ra lỗi khi kết nối AI.");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5 animate-fade-in">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div className="space-y-1">
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Môn học</label>
          <select
              name="subject"
              value={formData.subject}
              onChange={handleInputChange}
              disabled={isLoading}
              className="w-full rounded-xl border-2 border-slate-100 bg-slate-50 focus:bg-white p-3 outline-none transition-all font-bold text-sm"
          >
              {Object.values(Subject).map((subj) => (
              <option key={subj} value={subj}>{subj}</option>
              ))}
          </select>
        </div>
        <div className="space-y-1">
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Lớp</label>
          <select
              name="grade"
              value={formData.grade}
              onChange={handleInputChange}
              disabled={isLoading}
              className="w-full rounded-xl border-2 border-slate-100 bg-slate-50 focus:bg-white p-3 outline-none transition-all font-bold text-sm"
          >
              {[6, 7, 8, 9, 10, 11, 12].map((g) => (
              <option key={g} value={g}>Lớp {g}</option>
              ))}
          </select>
        </div>
      </div>

      <div className="space-y-1">
        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Tên bài dạy</label>
        <input
          type="text"
          name="lessonName"
          required
          value={formData.lessonName}
          onChange={handleInputChange}
          disabled={isLoading}
          placeholder="Nhập tên bài học..."
          className="w-full rounded-xl border-2 border-slate-100 bg-slate-50 focus:bg-white p-3.5 outline-none transition-all font-black text-slate-800"
        />
      </div>

      <div className="space-y-1">
        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-2">
          <Target size={14} className="text-blue-500" />
          Yêu cầu cần đạt (YCCĐ)
        </label>
        <textarea
          name="yccd"
          rows={2}
          value={formData.yccd}
          onChange={handleInputChange}
          disabled={isLoading}
          placeholder="Dán chuẩn chương trình GDPT 2018 vào đây..."
          className="w-full rounded-xl border-2 border-slate-100 bg-slate-50 focus:bg-white p-3 outline-none transition-all text-xs font-medium"
        />
      </div>

      <div className="space-y-2">
        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-2">
          <Cpu size={14} className="text-purple-500" />
          Năng lực số (Theo TT 02/2025)
        </label>
        
        <div className="space-y-1.5 max-h-[260px] overflow-y-auto pr-1 custom-scrollbar">
          {NLS_FRAMEWORK.map((group) => (
            <div key={group.domain} className="bg-white rounded-lg border border-slate-100 overflow-hidden shadow-sm">
              <button
                type="button"
                onClick={() => toggleDomain(group.domain)}
                className="w-full flex justify-between items-center px-3 py-2 bg-slate-50 hover:bg-slate-100 transition-colors text-left"
              >
                <span className="text-[9px] font-black text-slate-600 uppercase tracking-tight">{group.domain}</span>
                {expandedDomains.includes(group.domain) ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
              </button>
              
              {expandedDomains.includes(group.domain) && (
                <div className="p-1.5 grid grid-cols-1 gap-1 animate-fade-in">
                  {group.items.map(opt => (
                    <div 
                      key={opt.id}
                      onClick={() => !isLoading && toggleNls(opt.id)}
                      className={`cursor-pointer p-2 rounded border-2 transition-all flex items-center gap-2 text-[11px] font-bold ${
                        formData.selectedNls.includes(opt.id)
                        ? 'border-blue-500 bg-blue-50 text-blue-700'
                        : 'border-slate-50 bg-white text-slate-500 hover:border-slate-100'
                      }`}
                    >
                      <div className={`w-3.5 h-3.5 rounded border flex items-center justify-center shrink-0 ${formData.selectedNls.includes(opt.id) ? 'bg-blue-600 border-blue-600 text-white' : 'bg-white border-slate-300'}`}>
                        {formData.selectedNls.includes(opt.id) && <CheckCircle2 size={8} />}
                      </div>
                      {opt.label}
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
        <div className="flex items-center gap-1.5 px-1">
            <Info size={10} className="text-slate-400" />
            <p className="text-[9px] text-slate-400 font-medium italic">
              Để trống nếu muốn AI tự động đề xuất mã NLS phù hợp nhất.
            </p>
        </div>
      </div>

      <div className="space-y-4 pt-1">
        <div 
          onClick={() => !isLoading && fileInputRef.current?.click()}
          className={`relative group cursor-pointer border-2 border-dashed rounded-2xl p-4 transition-all duration-300 text-center ${
            fileName 
            ? 'border-blue-200 bg-blue-50/20' 
            : 'border-slate-200 bg-slate-50/50 hover:border-blue-300'
          }`}
        >
          {/* Fix: use ref attribute to attach the fileInputRef correctly to the input element. */}
          <input type="file" ref={fileInputRef} onChange={handleFileChange} accept=".doc,.docx,.pdf" className="hidden" />
          <div className="flex flex-col items-center gap-1">
            <div className={`p-2 rounded-full bg-white shadow-sm ${fileName ? 'text-blue-500' : 'text-slate-400 group-hover:scale-110 transition-transform'}`}>
              {fileName ? <CheckCircle2 size={18} /> : <Upload size={18} />}
            </div>
            <p className={`text-[10px] font-black ${fileName ? 'text-blue-700' : 'text-slate-500'}`}>
                {fileName || 'Tài liệu tham khảo (.docx, .pdf)'}
            </p>
          </div>
          {fileName && !isLoading && (
            <button onClick={clearFile} className="absolute top-2 right-2 p-1 rounded-full hover:bg-red-50 text-slate-400 hover:text-red-500 shadow-sm bg-white">
              <X size={12} />
            </button>
          )}
        </div>
      </div>

      <button
        type="submit"
        disabled={isLoading || !formData.lessonName.trim()}
        className={`w-full relative flex justify-center items-center gap-3 font-black py-4 px-6 rounded-2xl transition-all shadow-xl active:scale-[0.98] group overflow-hidden ${
            isLoading 
            ? 'bg-slate-300 cursor-wait text-slate-500 shadow-none' 
            : 'bg-blue-600 hover:bg-blue-700 text-white shadow-blue-200 hover:shadow-blue-300'
        }`}
      >
        {isLoading ? (
            <>
                <Loader2 size={20} className="animate-spin" />
                <span className="tracking-widest uppercase text-xs">Đang soạn thảo trọn bộ...</span>
            </>
        ) : (
            <>
                <Sparkles size={20} className="group-hover:rotate-12 transition-transform" />
                <span className="tracking-wider uppercase text-xs">TẠO GIÁO ÁN TOÀN DIỆN</span>
            </>
        )}
      </button>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 3px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 10px; }
      `}</style>
    </form>
  );
};

export default TabCreate;
