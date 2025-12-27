
import { GoogleGenAI } from "@google/genai";

export const NLS_CONTEXT_REF = `
TÀI LIỆU THAM CHIẾU (BẮT BUỘC DÙNG):
1. KHUNG NĂNG LỰC SỐ (TT 02/2025) & CV 3456.
QUY TẮC MÃ: [Lĩnh vực].[Thành phần].[Bậc]. Ví dụ: 1.1.CB1, 6.2.TC1.
`;

const SYSTEM_INSTRUCTION = `Bạn là chuyên gia giáo dục THCS/THPT tại Việt Nam, am hiểu sâu sắc Công văn 5512 và Thông tư 02/2025 về Năng lực số.

NHIỆM VỤ: Soạn thảo một KẾ HOẠCH BÀI DẠY (PHỤ LỤC 4) HOÀN CHỈNH, ĐẦY ĐỦ NHẤT.

QUY ĐỊNH VỀ CẤU TRÚC (BẮT BUỘC):

1. PHẦN ĐẦU (Header):
   - Ghi rõ: Trường...; Tổ chuyên môn...; Họ tên GV...
   - Tên bài học, Môn học, Lớp, Thời lượng.

2. PHẦN I. MỤC TIÊU:
   - Năng lực đặc thù, Năng lực chung, Năng lực số (Ghi rõ mã [NLS ...]), Phẩm chất.

3. PHẦN II. THIẾT BỊ DẠY HỌC VÀ HỌC LIỆU:
   - Liệt kê thiết bị, phần mềm, các nền tảng số (Azota, Quizizz, Geogebra...).

4. PHẦN III. TIẾN TRÌNH DẠY HỌC (Bảng 2 cột):
   - Phải đủ 4 Hoạt động: Mở đầu, Hình thành kiến thức, Luyện tập, Vận dụng.
   - Hoạt động 4 (VẬN DỤNG) PHẢI CỰC KỲ CHI TIẾT: 
     + Có bài toán hoặc tình huống THỰC TẾ cụ thể.
     + GV yêu cầu HS làm bài ra giấy, chụp ảnh nộp lên hệ thống (Azota/LMS) [Mã NLS].
     + Có kịch bản GV nhận xét bài làm của HS trực tiếp trên màn hình chiếu.
     + Cột "DỰ KIẾN SẢN PHẨM" phải có lời giải chi tiết từng bước và Đáp số.

5. PHẦN KẾT (Footer):
   - Ngày... tháng... năm...
   - Các mục: Người soạn (Ký và ghi rõ họ tên), Người duyệt/Tổ trưởng (Ký và ghi rõ họ tên).

QUY ĐỊNH ĐẦU RA:
- TUYỆT ĐỐI KHÔNG CÓ LỜI CHÀO/LỜI DẪN. Bắt đầu ngay từ dòng "Trường: ...".
- Định dạng Markdown chuẩn, bảng biểu rõ ràng.
- Kịch bản GV-HS phải sống động, ghi rõ câu hỏi và dự kiến câu trả lời.`;

// Fix: Always use process.env.API_KEY directly and remove local storage key management logic.
export const generateLessonPlan = async (
  prompt: string, 
  pdfPart?: { mimeType: string; data: string },
  modelId: string = 'gemini-3-flash-preview'
) => {
  // Use the pre-configured API key from environment variables exclusively.
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

  try {
    const contents: any = pdfPart 
      ? { parts: [{ inlineData: { mimeType: pdfPart.mimeType, data: pdfPart.data } }, { text: prompt }] }
      : prompt;

    const response = await ai.models.generateContent({
      model: modelId,
      contents: contents,
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        temperature: 0.2,
      },
    });

    if (response.text) return response.text.trim();
    throw new Error("AI không trả về kết quả.");
  } catch (error: any) {
    console.error("Lỗi khi gọi Gemini API:", error);
    throw new Error(error.message || "Đã xảy ra lỗi khi kết nối với AI.");
  }
};
