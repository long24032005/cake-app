import { useState } from 'react';
import { useAppStore } from '../store/useAppStore';
import { SavingsBookCard } from '../components/SavingsBookCard';

type Tab = 'all' | 'standard' | 'accumulate';

export function ManageBooksScreen({ onBack }: { onBack: () => void }) {
  const [activeTab, setActiveTab] = useState<Tab>('all');
  const allBooks = useAppStore(s => s.user.savingsBooks);
  const activeBooks = allBooks.filter(b => b.status === 'active');

  const filteredBooks = activeBooks.filter(b => {
    if (activeTab === 'all') return true;
    return b.bookType === activeTab;
  });

  return (
    <div style={{ background: '#F4F5F7', minHeight: '100%', color: '#0A0A1A', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', padding: '16px 20px', gap: 16, background: '#fff' }}>
        <button onClick={onBack} style={{ background: 'none', border: 'none', color: '#0A0A1A', fontSize: 24, cursor: 'pointer', padding: 0 }}>←</button>
        <div style={{ fontSize: 18, fontWeight: 800, flex: 1, textAlign: 'center', marginRight: 24 }}>Quản lý sổ</div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 12, padding: '16px 20px', background: '#F4F5F7' }}>
        <button 
          onClick={() => setActiveTab('all')}
          style={{ 
            padding: '8px 16px', borderRadius: 20, fontSize: 14, fontWeight: 600, border: 'none', cursor: 'pointer',
            background: activeTab === 'all' ? '#DDF5F5' : '#fff',
            color: activeTab === 'all' ? '#00A896' : '#555'
          }}
        >
          Tất cả
        </button>
        <button 
          onClick={() => setActiveTab('standard')}
          style={{ 
            padding: '8px 16px', borderRadius: 20, fontSize: 14, fontWeight: 600, border: 'none', cursor: 'pointer',
            background: activeTab === 'standard' ? '#DDF5F5' : '#fff',
            color: activeTab === 'standard' ? '#00A896' : '#555'
          }}
        >
          Tiêu chuẩn
        </button>
        <button 
          onClick={() => setActiveTab('accumulate')}
          style={{ 
            padding: '8px 16px', borderRadius: 20, fontSize: 14, fontWeight: 600, border: 'none', cursor: 'pointer',
            background: activeTab === 'accumulate' ? '#DDF5F5' : '#fff',
            color: activeTab === 'accumulate' ? '#00A896' : '#555'
          }}
        >
          Tích lũy
        </button>
      </div>

      {/* Content */}
      <div style={{ flex: 1, padding: '0 20px 24px', overflowY: 'auto' }}>
        {filteredBooks.length > 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {filteredBooks.map(b => <SavingsBookCard key={b.bookId} book={b} />)}
          </div>
        ) : (
          <div style={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: '#888', marginTop: 100 }}>
            <div style={{ fontSize: 80, marginBottom: 16, opacity: 0.3 }}>🐷</div>
            <div style={{ fontSize: 16, fontWeight: 700, color: '#0A0A1A', marginBottom: 8 }}>Bạn chưa mở tài khoản tiền gửi nào</div>
            <div style={{ fontSize: 13, textAlign: 'center', maxWidth: 260, lineHeight: 1.5 }}>
              Nhanh tay mở tài khoản tiền gửi để hưởng các lãi suất hấp dẫn từ Cake bạn nhé!
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
