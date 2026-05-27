import type { Transaction, ChatMessage } from '../types';

export interface AIScenario {
  id: string;
  name: string;
  description: string;
  transactions: Transaction[];
  externalTransactions: Transaction[];
  initialAiGreeting: string;
  quickReplies: string[];
  externalBankName: string;
}

// ─────────────────────────────────────────────────────────────
// CẤU HÌNH 3 KỊCH BẢN TÀI CHÍNH MOCK
// ─────────────────────────────────────────────────────────────

export const AI_SCENARIOS: Record<string, AIScenario> = {
  impulsive_spender: {
    id: 'impulsive_spender',
    name: 'Người trẻ chi tiêu bốc đồng (Impulsive Spender)',
    description: 'Chi tiêu nhiều trà sữa, shopee trên Cake. Nhận lương ở ngân hàng ngoài và tiêu sạch ngay trong tháng.',
    externalBankName: 'Techcombank',
    quickReplies: [
      'Yêu cầu báo cáo phân tích chi tiêu trên Cake 📊',
      'Đánh giá lý do chưa tích lũy hiệu quả 🔍',
      'Mẹo hành vi để kiểm soát mua sắm bộc phát 💡',
      'Tư vấn kế hoạch phân bổ tiết kiệm hợp lý 🐷'
    ],
    initialAiGreeting: 'Xin kính chào quý khách! Tôi là Gato AI - Cố vấn Tài chính Cá nhân được tích hợp trên Cake. Nhận định sơ bộ từ lịch sử giao dịch Cake cho thấy cơ cấu tài khoản của bạn đang có tỷ lệ phân bổ cao vào các chi phí ăn uống và mua sắm không thiết yếu. Tôi có thể hỗ trợ bạn thiết lập một lộ trình phân bổ tài chính hợp lý hơn?',
    transactions: [
      { id: 'tx_c1', amount: 45000, type: 'expense', category: 'Ăn uống', description: 'Highlands Coffee', date: '2026-05-25', bank: 'Cake' },
      { id: 'tx_c2', amount: 65000, type: 'expense', category: 'Ăn uống', description: 'GongCha Tra Sua', date: '2026-05-24', bank: 'Cake' },
      { id: 'tx_c3', amount: 450000, type: 'expense', category: 'Mua sắm', description: 'Shopee Pay', date: '2026-05-23', bank: 'Cake' },
      { id: 'tx_c4', amount: 120000, type: 'expense', category: 'Giải trí', description: 'CGV Cinemas', date: '2026-05-22', bank: 'Cake' },
      { id: 'tx_c5', amount: 260000, type: 'expense', category: 'Giải trí', description: 'Netflix Subscription', date: '2026-05-01', bank: 'Cake' },
      { id: 'tx_c6', amount: 85000, type: 'expense', category: 'Di chuyển', description: 'Grab Car', date: '2026-05-20', bank: 'Cake' },
      { id: 'tx_c7', amount: 1500000, type: 'income', category: 'Thu nhập', description: 'Bố mẹ chuyển khoản', date: '2026-05-05', bank: 'Cake' },
    ],
    externalTransactions: [
      { id: 'tx_e1', amount: 15000000, type: 'income', category: 'Thu nhập', description: 'NHAN LUONG CONG TY', date: '2026-05-05', bank: 'Techcombank' },
      { id: 'tx_e2', amount: 3500000, type: 'expense', category: 'Mua sắm', description: 'Tra gop iPhone 15', date: '2026-05-10', bank: 'Techcombank' },
      { id: 'tx_e3', amount: 1200000, type: 'expense', category: 'Mua sắm', description: 'Shopee Pay - Quan ao', date: '2026-05-12', bank: 'Techcombank' },
      { id: 'tx_e4', amount: 2100000, type: 'expense', category: 'Giải trí', description: 'Sinh nhat Beer Club', date: '2026-05-15', bank: 'Techcombank' },
      { id: 'tx_e5', amount: 350000, type: 'expense', category: 'Ăn uống', description: 'GrabFood an toi', date: '2026-05-18', bank: 'Techcombank' },
      { id: 'tx_e6', amount: 5000000, type: 'expense', category: 'Mua sắm', description: 'Rut tien mat tieu xai', date: '2026-05-06', bank: 'Techcombank' },
    ]
  },
  disciplined_saver: {
    id: 'disciplined_saver',
    name: 'Người tích lũy kỷ luật (Disciplined Saver)',
    description: 'Mở sổ tích lũy đều đặn trên Cake. Chi tiêu ngân hàng ngoài rất có kế hoạch và tiết kiệm.',
    externalBankName: 'Vietcombank',
    quickReplies: [
      'Đánh giá phong độ kỷ luật tiết kiệm của tôi 🏆',
      'Phương án tối ưu hóa số dư nhàn rỗi 📈',
      'Tư vấn điều chỉnh hạn mức tích lũy hàng tháng 🐷',
      'Mẹo hành vi duy trì kỷ luật tích lũy dài hạn 💡'
    ],
    initialAiGreeting: 'Kính chào quý khách! Gato AI hân hạnh đồng hành cùng bạn. Hệ thống ghi nhận bạn đang thực hiện kỷ luật trích lập tiết kiệm cực kỳ xuất sắc và đều đặn hàng tháng. Bạn có muốn đánh giá chi tiết hiệu quả đầu tư hoặc tối ưu hóa nguồn vốn nhàn rỗi khả dụng khác?',
    transactions: [
      { id: 'tx_c1', amount: 2000000, type: 'expense', category: 'Tiết kiệm', description: 'Gui gop so Tich Luy Gato', date: '2026-05-05', bank: 'Cake' },
      { id: 'tx_c2', amount: 1500000, type: 'expense', category: 'Tiết kiệm', description: 'Trich tien tu dong Tiet Kiem', date: '2026-05-15', bank: 'Cake' },
      { id: 'tx_c3', amount: 50000, type: 'expense', category: 'Di chuyển', description: 'Grab Bike di lam', date: '2026-05-20', bank: 'Cake' },
    ],
    externalTransactions: [
      { id: 'tx_e1', amount: 18000000, type: 'income', category: 'Thu nhập', description: 'LUONG THANG 05', date: '2026-05-05', bank: 'Vietcombank' },
      { id: 'tx_e2', amount: 850000, type: 'expense', category: 'Chi tiêu thiết yếu', description: 'Thanh toan tien dien nuoc', date: '2026-05-07', bank: 'Vietcombank' },
      { id: 'tx_e3', amount: 1200000, type: 'expense', category: 'Ăn uống', description: 'Sieu thi Winmart', date: '2026-05-08', bank: 'Vietcombank' },
      { id: 'tx_e4', amount: 400000, type: 'expense', category: 'Di chuyển', description: 'Do xang xe oto', date: '2026-05-12', bank: 'Vietcombank' },
      { id: 'tx_e5', amount: 2000000, type: 'income', category: 'Thu nhập', description: 'Thuong hoan thanh du an', date: '2026-05-25', bank: 'Vietcombank' },
    ]
  },
  variable_income: {
    id: 'variable_income',
    name: 'Thu nhập biến động (Variable Income Entrepreneur)',
    description: 'Chủ shop kinh doanh có dòng tiền ra vào lớn và liên tục. Khó gửi tiết kiệm kỳ hạn dài vì cần xoay vòng vốn.',
    externalBankName: 'BIDV',
    quickReplies: [
      'Báo cáo phân tích dòng tiền kinh doanh trên Cake 📊',
      'Giải pháp tiết kiệm tối ưu thanh khoản xoay vòng vốn 🏦',
      'Cơ chế rút gốc một phần giúp quản trị vốn lưu động thế nào? 💡',
      'Đề xuất chiến lược tối ưu hóa nguồn tiền nhàn rỗi tuần này 📈'
    ],
    initialAiGreeting: 'Kính chào quý khách! Tôi là Gato AI. Lịch sử tài khoản cho thấy bạn đang vận hành một nguồn dòng tiền kinh doanh có tần suất xoay vòng lớn và biến động số dư cao. Để hỗ trợ quản trị vốn lưu động tối ưu nhất, tôi xin đề xuất các giải pháp gửi tiết kiệm linh hoạt thanh khoản. Bạn có muốn bắt đầu phân tích?',
    transactions: [
      { id: 'tx_c1', amount: 8500000, type: 'income', category: 'Thu nhập', description: 'Khach chuyen khoan mua hang', date: '2026-05-25', bank: 'Cake' },
      { id: 'tx_c2', amount: 5000000, type: 'expense', category: 'Mua sắm', description: 'Chuyen tien nhap hang NCC', date: '2026-05-24', bank: 'Cake' },
      { id: 'tx_c3', amount: 12000000, type: 'income', category: 'Thu nhập', description: 'Chuyen khoan don hang si', date: '2026-05-23', bank: 'Cake' },
    ],
    externalTransactions: [
      { id: 'tx_e1', amount: 25000000, type: 'income', category: 'Thu nhập', description: 'DOANH THU SHOP ONLINE', date: '2026-05-05', bank: 'BIDV' },
      { id: 'tx_e2', amount: 18000000, type: 'expense', category: 'Mua sắm', description: 'Thanh toan tien hang NCC BIDV', date: '2026-05-10', bank: 'BIDV' },
      { id: 'tx_e3', amount: 4500000, type: 'expense', category: 'Chi tiêu thiết yếu', description: 'Tien mat bang kinh doanh', date: '2026-05-15', bank: 'BIDV' },
      { id: 'tx_e4', amount: 3000000, type: 'expense', category: 'Mua sắm', description: 'Rut tien mat chi tieu', date: '2026-05-18', bank: 'BIDV' },
    ]
  }
};

// ─────────────────────────────────────────────────────────────
// LOCAL simulated RESPONSE ENGINE (FALLBACK)
// ─────────────────────────────────────────────────────────────

function getLocalFallbackResponse(message: string, scenarioId: string, linked: boolean): string {
  const query = message.toLowerCase();
  
  if (scenarioId === 'impulsive_spender') {
    if (query.includes('chi tiêu') || query.includes('cake')) {
      return `📊 **Báo cáo Phân tích Chi tiêu trên Cake:**
• **Tổng chi tiêu ẩm thực/giải trí**: 560.000đ (Highlands Coffee, GongCha, CGV). Chiếm 51.4% tổng cơ cấu chi tiêu trên Cake.
• **Chi tiêu mua sắm (Shopee)**: 450.000đ. Chiếm 41.3%.
• **Di chuyển**: 85.000đ. Chiếm 7.3%.
👉 **Nhận xét chuyên môn**: Bạn đang có tỷ lệ phân bổ chi tiêu bất hợp lý vào các nhóm dịch vụ phi thiết yếu. Việc tích lũy các khoản chi tiêu nhỏ lẻ này đang trực tiếp ảnh hưởng đến khả năng hình thành quỹ dự phòng khẩn cấp của bạn. Khuyến nghị thiết lập hạn mức tối đa 200.000đ/tuần cho các dịch vụ ăn uống giải trí.`;
    }
    if (query.includes('tại sao') || query.includes('không tiết kiệm')) {
      if (!linked) {
        return `📊 **Đánh giá Sức khỏe Tài chính:**
Hiện tại, tài khoản Cake của bạn chưa ghi nhận bất kỳ dòng tiền tiết kiệm hay tích lũy nào. Để thực hiện phân tích sâu sắc và tìm ra nguyên nhân gốc rễ, chúng tôi cần đối chiếu cơ cấu thu nhập của bạn.
👉 **Khuyến nghị**: Hãy cấp quyền truy cập lịch sử giao dịch ngân hàng ngoài để chúng tôi đồng bộ hóa dòng tiền lương đầu vào và đưa ra giải pháp tối ưu hóa.`;
      } else {
        return `📊 **Báo cáo Phân tích Tài chính Hợp nhất (Cake + Techcombank):**
• **Thu nhập cố định (Lương)**: 15.000.000đ (Techcombank, ngày 5 hàng tháng).
• **Cơ cấu chi tiêu lũy kế (Đến ngày 15)**: 13.500.000đ (Trả góp iPhone 15, Shopee, Highlands, Beer Club). Tốc độ cạn kiệt dòng tiền đạt **90% thu nhập chỉ sau 10 ngày**.
👉 **Nguyên nhân cốt lõi**: Thiếu kiểm soát dòng tiền đầu ra ngay sau khi nhận thu nhập và chưa thiết lập quy tắc "Tiết kiệm trước - Chi tiêu sau".
👉 **Giải pháp Khuyến nghị**: Trích lập tự động **2.000.000đ (13% thu nhập)** vào ngày 6 hàng tháng để mở một **Sổ tiết kiệm Tích lũy Gato** trên Cake. Đây là phương án cưỡng chế tích lũy hiệu quả để bảo toàn vốn.`;
      }
    }
    if (query.includes('mẹo') || query.includes('kiềm chế')) {
      return `📊 **Khuyến nghị Mẹo Kiềm chế Mua sắm (Hành vi học Tài chính):**
1. **Áp dụng Quy tắc trì hoãn 48 giờ**: Đối với các đơn hàng mua sắm trực tuyến (Shopee), hãy lưu sản phẩm trong giỏ hàng tối thiểu 48 giờ. Điều này giúp giảm thiểu 80% các quyết định mua sắm bốc phát do cảm xúc nhất thời.
2. **Quy đổi Chi phí cơ hội**: Hãy quy đổi giá trị món đồ ra số giờ lao động thực tế. Ví dụ, một ly trà sữa 65.000đ tương đương với gần 2 giờ làm việc. Việc đối chiếu này giúp bạn có cái nhìn lý trí hơn trước khi quyết định chi tiêu.`;
    }
  }

  if (scenarioId === 'disciplined_saver') {
    if (query.includes('nhận xét') || query.includes('phong độ')) {
      return `📊 **Đánh giá Sức khỏe Tài chính:**
Bạn đang duy trì một phong độ tích lũy xuất sắc và kỷ luật:
• **Tỷ lệ tích lũy**: Đạt 19.4% trên tổng thu nhập hàng tháng (gửi góp 3.500.000đ từ tổng thu nhập 18.000.000đ).
• **Đánh giá**: Hành vi gửi góp đều đặn vào Sổ tích lũy Gato giúp tối ưu hóa lãi suất kép và thúc đẩy tiến độ tiến hóa của thú cưng Gato vượt mục tiêu đề ra. Tiếp tục duy trì tỷ lệ tích lũy này để đảm bảo an toàn tài chính dài hạn.`;
    }
    if (query.includes('tối ưu') || query.includes('nhàn rỗi')) {
      if (!linked) {
        return `📊 **Cố vấn Tối ưu hóa Tiền nhàn rỗi:**
Hệ thống ghi nhận bạn đang thực hiện kỷ luật tiết kiệm rất tốt trên Cake. Để đưa ra phương án phân bổ danh mục đầu tư/tiết kiệm hiệu quả nhất, chúng tôi cần đánh giá số dư khả dụng ở các tài khoản khác.
👉 **Khuyến nghị**: Hãy cấp quyền truy cập lịch sử giao dịch ngân hàng ngoài để Gato AI phân tích sâu nguồn vốn khả dụng của bạn.`;
      } else {
        return `📊 **Phương án Tối ưu hóa Vốn nhàn rỗi lũy kế (Cake + Vietcombank):**
• **Số dư vãng lai tại Vietcombank**: 8.000.000đ (đang nhận lãi suất không kỳ hạn cực thấp ~0.1%/năm).
👉 **Đề xuất tái cấu trúc danh mục**:
1. Giữ lại **3.000.000đ** tại Vietcombank làm thanh khoản chi tiêu thiết yếu.
2. Chuyển **5.000.000đ** sang Cake để mở một **Sổ tiết kiệm Tiêu chuẩn kỳ hạn 6 tháng** hưởng mức lãi suất ưu đãi **7.2%/năm** (sinh lời gấp 72 lần so với để tài khoản thường).
3. Việc này đồng thời giúp bạn nhận thêm **500 điểm chốt**, giúp thúc đẩy nhanh tiến trình đạt mốc phần thưởng tiếp theo.`;
      }
    }
  }

  if (scenarioId === 'variable_income') {
    if (query.includes('dòng tiền') || query.includes('kinh doanh')) {
      return `📊 **Báo cáo Dòng tiền Doanh nghiệp trên Cake:**
• **Dòng tiền vào (Doanh thu)**: 20.500.000đ.
• **Dòng tiền ra (Chi phí nhà cung cấp)**: 5.000.000đ.
• **Thặng dư dòng tiền khả dụng**: +15.500.000đ.
👉 **Nhận xét chuyên môn**: Bạn có dòng tiền dương rất mạnh mẽ. Tuy nhiên, toàn bộ thặng dư đang nằm ở tài khoản thanh toán không kỳ hạn, làm suy giảm hiệu suất sinh lời của dòng vốn lưu động trong khi chờ thanh toán.`;
    }
    if (query.includes('loại nào') || query.includes('xoay vốn')) {
      if (!linked) {
        return `📊 **Cố vấn Quản lý Vốn Lưu động:**
Để đề xuất giải pháp chia rổ tài sản và phân bổ kỳ hạn tối ưu giúp doanh nghiệp vừa sinh lời vừa đảm bảo thanh khoản, chúng tôi cần dữ liệu dòng tiền chi tiết từ tài khoản chính.
👉 **Khuyến nghị**: Vui lòng cấp quyền truy cập lịch sử giao dịch ngân hàng ngoài để đồng bộ hóa.`;
      } else {
        return `📊 **Phương án Tối ưu hóa Dòng tiền Liên ngân hàng (Cake + BIDV):**
Do tính chất kinh doanh cần thanh toán công nợ nhà cung cấp liên tục, chúng tôi đề xuất chiến lược quản trị vốn như sau:
1. **Sử dụng Sổ tiết kiệm Standard kỳ hạn ngắn (1 tháng)**: Hưởng lãi suất ổn định 4.75% thay vì 0.1%, phù hợp cho chu kỳ thanh toán NCC định kỳ cuối tháng.
2. **Tận dụng cơ chế Rút gốc một phần**: Cake cho phép rút tối đa 90% số dư sổ tiết kiệm khi cần xoay vòng vốn gấp. Phần tiền còn lại trong sổ vẫn được bảo toàn nguyên vẹn lãi suất ưu đãi ban đầu, giúp tối đa hóa lợi ích tài chính của bạn.`;
      }
    }
  }

  // Phản hồi chung
  if (query.includes('liên kết') || query.includes('ngân hàng ngoài')) {
    return `📊 **Hướng dẫn Liên kết Ngân hàng ngoài qua Open Banking:**
Việc liên kết tài khoản ngân hàng ngoài giúp Gato AI hợp nhất dữ liệu giao dịch dưới sự đồng ý của bạn.
Từ đó, hệ thống có thể tính toán chính xác tỷ lệ thu nhập/chi tiêu và tự động đưa ra các cảnh báo dòng tiền thông thái nhất. Vui lòng cấp quyền truy cập lịch sử giao dịch để tiến hành.`;
  }

  return `📊 **Xin chào! Tôi là Gato AI - Cố vấn Tài chính Cá nhân của bạn.**
Bạn có thể yêu cầu tôi thực hiện các nghiệp vụ sau:
1. Phân tích chi tiết cơ cấu chi tiêu trên Cake.
2. Đánh giá sức khỏe tài chính và tư vấn lý do chưa tích lũy hiệu quả.
3. Tối ưu hóa dòng tiền nhàn rỗi giữa Cake và các ngân hàng liên kết.
*(Vui lòng lựa chọn các nút Quick Replies bên dưới hoặc nhập câu hỏi trực tiếp để bắt đầu).*`;
}

// ─────────────────────────────────────────────────────────────
// GEMINI LIVE API CONNECTOR
// ─────────────────────────────────────────────────────────────

export async function getChatbotResponse(
  message: string,
  chatHistory: ChatMessage[],
  state: {
    scenarioId: string;
    externalBankLinked: boolean;
    transactions: Transaction[];
    externalTransactions: Transaction[];
  },
  apiKey: string | null
): Promise<string> {
  // Chạy Gemini API thật
  const scenario = AI_SCENARIOS[state.scenarioId] || AI_SCENARIOS.impulsive_spender;
  
  // Xây dựng prompt bối cảnh (Context) gửi kèm
  const cakeTxStr = JSON.stringify(state.transactions, null, 2);
  const extTxStr = state.externalBankLinked ? JSON.stringify(state.externalTransactions, null, 2) : 'CHƯA LIÊN KẾT';
  
  const systemInstruction = `Bạn là Gato AI, một chuyên gia tư vấn tài chính cá nhân cao cấp (Wealth Advisor) và thông thái, được tích hợp trực tiếp trong ứng dụng ngân hàng số Cake by VPBank.
Vai trò của bạn: Đồng hành, cố vấn tài chính chuyên nghiệp và đáng tin cậy. Phân tích chi tiết số liệu dòng tiền, chỉ ra các lỗ hổng tài chính và thiết kế kế hoạch phân bổ vốn tối ưu để giúp người dùng đạt mục tiêu tiết kiệm và nuôi thú cưng Gato.
Về văn phong và ngôn ngữ:
- Sử dụng tiếng Việt chuẩn mực, lịch sự, chuyên nghiệp nhưng vẫn gần gũi, tạo cảm giác tin cậy của một chuyên gia tài chính thực thụ.
- Tránh ngôn từ quá bông đùa, hời hợt hoặc thiếu nghiêm túc. Có thể dùng một vài icon tinh tế (như 📊, 📈, 💼, 🏦) để bài viết sinh động nhưng phải giữ được sự trang trọng.
- Câu trả lời cần có cấu trúc rõ ràng (sử dụng gạch đầu dòng, số liệu phần trăm cụ thể), phân tích logic chặt chẽ và đưa ra giải pháp hành động (actionable advice).
- Độ dài câu trả lời lý tưởng: dưới 300 từ để đảm bảo phân tích đủ sâu nhưng không bị lan man.

Bối cảnh tài chính của người dùng hiện tại:
- Kịch bản kĩ thuật: ${scenario.name}
- Mô tả thói quen: ${scenario.description}
- Các giao dịch trên Cake:
${cakeTxStr}
- Liên kết ngân hàng ngoài (${scenario.externalBankName}): ${state.externalBankLinked ? 'ĐÃ LIÊN KẾT' : 'CHƯA LIÊN KẾT'}
- Giao dịch ở ngân hàng ngoài (${scenario.externalBankName}):
${extTxStr}

Quy tắc phân tích chuyên sâu:
1. Nếu người dùng CHƯA LIÊN KẾT ngân hàng ngoài:
   - Hãy chỉ ra hạn chế khi chỉ phân tích trên Cake (ví dụ: chỉ thấy dòng tiền chi tiêu nhỏ lẻ, chưa thấy bức tranh thu nhập tổng thể).
   - Đưa ra lời khuyên chuyên môn về tầm quan trọng của việc hợp nhất dòng tiền qua Open Banking để lập kế hoạch tài chính toàn diện. Gợi ý rõ ràng người dùng cấp quyền truy cập lịch sử giao dịch để tiếp tục.
2. Nếu người dùng ĐÃ LIÊN KẾT ngân hàng ngoài:
   - Thực hiện phân tích chuyên sâu dữ liệu đa ngân hàng. Tính toán tỷ lệ chi tiêu cụ thể (ví dụ: ăn uống chiếm bao nhiêu % thu nhập, chi tiêu thiết yếu vs không thiết yếu).
   - Đánh giá sức khỏe tài chính: Chỉ ra các điểm yếu lớn (ví dụ: tốc độ cạn kiệt số dư sau ngày nhận lương, hoặc dòng tiền nhàn rỗi lớn không sinh lời tại tài khoản vãng lai ở ngân hàng Vietcombank/BIDV/Techcombank).
   - Đề xuất sản phẩm tiết kiệm Cake phù hợp (ví dụ: gửi góp tích lũy tự động hàng tháng từ lương để duy trì kỷ luật, hoặc chuyển dòng tiền nhàn rỗi sang sổ tiết kiệm tiêu chuẩn với lãi suất cao và tận dụng tính năng rút gốc một phần linh hoạt).
3. Đảm bảo các con số phân tích khớp 100% với dữ liệu giao dịch mock ở trên nhưng được trình bày một cách phân tích chuyên nghiệp và bài bản.`;

  // Map lịch sử chat sang định dạng Gemini, lọc bỏ tin nhắn chào mừng đầu tiên (bot) nếu ở đầu để đảm bảo hội thoại bắt đầu bằng user role
  const historyToMap = chatHistory.length > 0 && chatHistory[0].sender === 'bot'
    ? chatHistory.slice(1)
    : chatHistory;

  const contents = historyToMap.map(msg => ({
    role: msg.sender === 'user' ? ('user' as const) : ('model' as const),
    parts: [{ text: msg.text }]
  }));
  
  // Push tin nhắn hiện tại
  const userMsgText = message;
  contents.push({
    role: 'user' as const,
    parts: [{ text: userMsgText }]
  });

  try {
    // 1. Thử gọi qua Vercel Proxy API (để ẩn API Key trên Vercel)
    console.log('[Gato AI] Thử kết nối qua Vercel Proxy API /api/chat...');
    console.log('[Gato AI] Request Payload:', JSON.stringify({
      contents,
      systemInstruction: { parts: [{ text: systemInstruction.substring(0, 100) + '...' }] }
    }, null, 2));
    let data;
    let success = false;
    
    try {
      const proxyResponse = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': apiKey || '',
        },
        body: JSON.stringify({
          contents,
          systemInstruction: {
            parts: [{ text: systemInstruction }]
          },
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 4000,
          }
        })
      });

      if (proxyResponse.ok) {
        data = await proxyResponse.json();
        success = true;
        console.log('[Gato AI] Kết nối qua Proxy API thành công:', data);
      } else {
        const errText = await proxyResponse.text();
        console.error(`[Gato AI] Proxy API trả về mã lỗi: ${proxyResponse.status}`, errText);
      }
    } catch (e: any) {
      console.warn('[Gato AI] Không thể kết nối với Proxy API (đang chạy local hoặc dev server hoặc lỗi mạng):', e.message);
    }

    // 2. Nếu Proxy không khả dụng hoặc lỗi, gọi trực tiếp Google API bằng key client-side (chỉ khi có apiKey)
    if (!success) {
      if (apiKey) {
        const apiKeys = apiKey.split(',').map(k => k.trim()).filter(Boolean);
        let lastError = null;

        for (const key of apiKeys) {
          try {
            console.log(`[Gato AI] Đang gọi trực tiếp Google API bằng key ...${key.slice(-6)}`);
            const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${key}`;
            const response = await fetch(endpoint, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                contents,
                systemInstruction: {
                  parts: [{ text: systemInstruction }]
                },
                generationConfig: {
                  temperature: 0.7,
                  maxOutputTokens: 4000,
                }
              })
            });

            if (response.ok) {
              data = await response.json();
              success = true;
              console.log(`[Gato AI] Gọi trực tiếp thành công với key kết thúc bằng ...${key.slice(-6)}`);
              break;
            } else {
              const errText = await response.text();
              console.warn(`[Gato AI] Key ...${key.slice(-6)} thất bại: status ${response.status}`);
              lastError = `Status ${response.status} - ${errText}`;
            }
          } catch (err: any) {
            console.warn(`[Gato AI] Kết nối lỗi với key ...${key.slice(-6)}: ${err.message}`);
            lastError = err.message;
          }
        }

        if (!success) {
          throw new Error(`All direct Google API keys failed. Last error: ${lastError}`);
        }
      } else {
        // Không có client apiKey và Proxy lỗi -> Chạy chế độ fallback cục bộ
        console.log('[Gato AI] Không có API Key client và Proxy lỗi -> Chạy chế độ fallback cục bộ');
        return getLocalFallbackResponse(message, state.scenarioId, state.externalBankLinked);
      }
    }

    const botText = data.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!botText) {
      throw new Error('Invalid API response format');
    }

    return botText.trim();
  } catch (error) {
    console.error('[Gato AI] Lỗi gọi Gemini API, chuyển sang fallback:', error);
    // Fallback nếu gọi API thật lỗi
    return getLocalFallbackResponse(message, state.scenarioId, state.externalBankLinked) + '\n\n*(Lưu ý: Đang chạy chế độ offline do lỗi kết nối API)*';
  }
}
