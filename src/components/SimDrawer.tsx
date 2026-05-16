/**
 * SimDrawer — Simulation Mode (Spec D)
 * Drawer từ cạnh phải, width 320px, bg #0D0B1F, border-left 2px #FF2D8C
 * Kích hoạt: 5 tap logo | swipe phải | ?sim=true
 */
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppStore } from '../store/useAppStore';
import { ALL_MILESTONES, ROUND_COMPLETE_THRESHOLD, LOCK_CYCLE_DAYS } from '../config';
import { toISODate, addDays } from '../engine/pointEngine';
import type { PetForm } from '../types';

// ── Sub-UI helpers ────────────────────────────────────────
const SH = ({ t }: { t: string }) => (
  <div style={{ fontSize: 10, fontWeight: 800, letterSpacing: '0.1em', color: 'rgba(255,45,140,0.7)', textTransform: 'uppercase', margin: '16px 0 8px' }}>{t}</div>
);
const HR = () => <div style={{ height: 1, background: 'rgba(255,45,140,0.15)', margin: '4px 0' }} />;

function SimBtn({ label, onClick, id, variant = 'ghost', full = false, small = false }: {
  label: string; onClick: () => void; id?: string;
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost'; full?: boolean; small?: boolean;
}) {
  const styles: Record<string, React.CSSProperties> = {
    primary:   { background: 'linear-gradient(135deg,#FF2D8C,#C21A7A)', border: 'none', color: '#fff' },
    secondary: { background: 'transparent', border: '1px solid rgba(255,45,140,0.5)', color: '#FF2D8C' },
    danger:    { background: 'transparent', border: '1px solid rgba(255,107,107,0.5)', color: '#FF6B6B' },
    ghost:     { background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#9B96C8' },
  };
  return (
    <button id={id} onClick={onClick} style={{
      ...styles[variant],
      borderRadius: 8, padding: small ? '5px 10px' : '8px 12px',
      fontSize: small ? 11 : 12, fontWeight: 700, cursor: 'pointer',
      width: full ? '100%' : undefined, textAlign: 'left',
    }}>{label}</button>
  );
}

// ── Section 2: Points (priority) ─────────────────────────
function S2Points() {
  const [addV, setAddV] = useState('500');
  const [subV, setSubV] = useState('100');
  const progressPoints = useAppStore(s => s.user.journey.progressPoints);
  const runningPoints  = useAppStore(s => s.user.journey.runningPoints);
  const store = useAppStore();

  const next = [...ALL_MILESTONES].sort((a,b)=>a.pointsRequired-b.pointsRequired)
    .find(m => m.pointsRequired > progressPoints);

  return (
    <div>
      <SH t="② Điều chỉnh điểm" />
      <div style={{ fontSize: 11, color: '#9B96C8', marginBottom: 8 }}>
        ✓ <b style={{color:'#FF2D8C'}}>{progressPoints.toLocaleString('vi-VN')}</b> chốt &nbsp;|&nbsp;
        ~ <b style={{color:'rgba(255,128,192,0.8)'}}>{runningPoints.toLocaleString('vi-VN')}</b> chạy
        {next && <> &nbsp;→&nbsp; mốc {next.id} ({next.pointsRequired.toLocaleString('vi-VN')})</>}
      </div>
      <div style={{ display:'flex', gap:6, marginBottom:6 }}>
        <input type="number" value={addV} onChange={e=>setAddV(e.target.value)}
          style={{ flex:1, background:'rgba(255,255,255,0.07)', border:'1px solid rgba(255,255,255,0.1)', borderRadius:6, padding:'6px 8px', color:'#fff', fontSize:12 }} />
        <SimBtn id="sim-add-pts" label="＋ Thêm" variant="secondary" onClick={() => store.addProgressPoints(Number(addV)||0)} />
      </div>
      <div style={{ display:'flex', gap:6, marginBottom:10 }}>
        <input type="number" value={subV} onChange={e=>setSubV(e.target.value)}
          style={{ flex:1, background:'rgba(255,255,255,0.07)', border:'1px solid rgba(255,255,255,0.1)', borderRadius:6, padding:'6px 8px', color:'#fff', fontSize:12 }} />
        <SimBtn id="sim-sub-pts" label="－ Trừ" variant="ghost" onClick={() => store.subtractProgressPoints(Number(subV)||0)} />
      </div>
      <div style={{ display:'flex', gap:6 }}>
        <SimBtn id="sim-near-milestone" full label="🎯 Set = mốc tiếp theo − 10" variant="secondary" onClick={() => store.setPointsNearNextMilestone()} />
      </div>
      <div style={{ marginTop:6 }}>
        <SimBtn id="sim-reset-pts" full label="⚠ Reset điểm về 0" variant="danger" onClick={() => { if(confirm('Reset progressPoints + runningPoints về 0?')) store.resetPoints(); }} />
      </div>
    </div>
  );
}

// ── Section 7: Scenarios (priority) ──────────────────────
function S7Scenarios() {
  const store = useAppStore();
  const [lastRun, setLastRun] = useState('');

  const scenarios = [
    {
      id:'s1', icon:'🔄', title:'Kịch bản 1: Người dùng mới',
      desc:'Reset toàn bộ → tạo 1 sổ 2tr/6T',
      run: () => {
        store.hardReset();
        setTimeout(() => {
          const { addBook } = useAppStore.getState();
          const today = toISODate(new Date());
          addBook({ bookId:`book_s1_${Date.now()}`, bookType:'standard', status:'active', principalAmount:2_000_000, currentBalance:2_000_000, interestRate:7.2, termMonths:6, startDate:today, maturityDate:addDays(today,180),
            pointTracking:{ balanceHistory:[{date:today,balance:2_000_000}], lockedPoints:0, runningPoints:0, commitmentBonusPoints:0, lockCycleDays:LOCK_CYCLE_DAYS, lastLockDate:today, nextLockDate:addDays(today,LOCK_CYCLE_DAYS), violationRatio:null } });
        }, 50);
        return 'Reset xong + tạo sổ 2tr/6T';
      },
    },
    {
      id:'s2', icon:'🎯', title:'Kịch bản 2: Sắp đạt mốc L1',
      desc:'Set điểm = 2800 + tạo sổ active',
      run: () => {
        store.createDemoStandardBook();
        store.resetPoints();
        store.addProgressPoints(2_800);
        return 'progressPoints = 2800 (mốc L1 ở 3000)';
      },
    },
    {
      id:'s3', icon:'⚠️', title:'Kịch bản 3: Vi phạm giữa chừng',
      desc:'Tạo sổ → chạy 20 ngày → vi phạm',
      run: () => {
        store.createDemoStandardBook();
        store.runDailyJob(20);
        const books = useAppStore.getState().user.savingsBooks.filter(b=>b.status==='active');
        const last = books[books.length-1];
        if (last) { store.violateBook(last.bookId); return `Đã vi phạm ${last.bookId} (r≈0.06 → mất 100% running)`; }
        return 'Không tìm thấy sổ active';
      },
    },
    {
      id:'s4', icon:'🎉', title:'Kịch bản 4: Sắp hoàn vòng',
      desc:'Set điểm = 59900 → +100 là trigger',
      run: () => {
        store.resetPoints();
        store.addProgressPoints(59_900);
        return 'progressPoints = 59900. Thêm 100 pts để hoàn vòng!';
      },
    },
    {
      id:'s5', icon:'📚', title:'Kịch bản 5: Multi-book',
      desc:'Tạo 1 sổ thường + 1 sổ tích lũy',
      run: () => {
        store.createDemoStandardBook();
        store.createDemoAccumulateBook();
        return 'Đã tạo 2 sổ — xem contribution trên Home';
      },
    },
  ];

  return (
    <div>
      <SH t="⑦ Kịch bản demo" />
      {lastRun && (
        <div style={{ fontSize: 10, color:'#4ECDA4', background:'rgba(78,205,164,0.1)', border:'1px solid rgba(78,205,164,0.2)', borderRadius:6, padding:'6px 8px', marginBottom:8 }}>
          ✓ {lastRun}
        </div>
      )}
      <div style={{ display:'flex', flexDirection:'column', gap:6 }}>
        {scenarios.map(sc => (
          <button key={sc.id} id={`sim-scenario-${sc.id}`} onClick={() => setLastRun(sc.run())} style={{
            background:'rgba(255,45,140,0.06)', border:'1px solid rgba(255,45,140,0.2)',
            borderRadius:8, padding:'9px 12px', cursor:'pointer', textAlign:'left',
            display:'flex', gap:10, alignItems:'center',
          }}>
            <span style={{fontSize:18,flexShrink:0}}>{sc.icon}</span>
            <div>
              <div style={{fontSize:12,fontWeight:700,color:'#fff'}}>{sc.title}</div>
              <div style={{fontSize:10,color:'#9B96C8',marginTop:1}}>{sc.desc}</div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

// ── Section 1: Time Control ───────────────────────────────
function S1Time() {
  const store = useAppStore();
  const simDate = useAppStore(s => s.simDate);
  const displayDate = simDate ?? new Date().toISOString().split('T')[0];

  return (
    <div>
      <SH t="① Tua thời gian" />
      <div style={{ fontSize: 11, color:'#9B96C8', marginBottom:8 }}>
        📅 Ngày hiện tại: <b style={{color:'#5BC8F5'}}>{displayDate}</b>
      </div>
      {!simDate && (
        <SimBtn label="▶ Bật Sim Date (từ hôm nay)" variant="secondary" full
          onClick={() => store.setSimDate(new Date().toISOString().split('T')[0])} />
      )}
      {simDate && (
        <>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:6 }}>
            {[
              { label:'+1 Ngày',  days:1  },
              { label:'+7 Ngày',  days:7  },
              { label:'+30 Ngày', days:30 },
              { label:'+3 Tháng', days:90 },
            ].map(({label,days}) => (
              <SimBtn key={days} id={`sim-time-${days}`} label={label} variant="secondary"
                onClick={() => {
                  store.runDailyJob(days);
                  if (days >= 30) store.runLockCycle(useAppStore.getState().user.savingsBooks.find(b=>b.status==='active')?.bookId ?? '');
                }} />
            ))}
          </div>
          <div style={{ marginTop:6 }}>
            <SimBtn label="✕ Tắt Sim Date" variant="danger" full onClick={() => store.setSimDate(null)} />
          </div>
        </>
      )}
    </div>
  );
}

// ── Section 3: Book Actions ───────────────────────────────
function S3Books() {
  const store = useAppStore();
  const books = useAppStore(s => s.user.savingsBooks);
  const [sel, setSel] = useState('');
  const [log, setLog] = useState('');

  return (
    <div>
      <SH t="③ Sổ tiết kiệm" />
      <div style={{ display:'flex', flexDirection:'column', gap:6 }}>
        <SimBtn id="sim-create-std" full label="➕ Tạo sổ thường (5tr/12T/7.4%)" variant="secondary"
          onClick={() => { store.createDemoStandardBook(); setLog('Đã tạo sổ thường'); }} />
        <SimBtn id="sim-create-acc" full label="➕ Tạo sổ tích lũy (500k/12kỳ)" variant="ghost"
          onClick={() => { store.createDemoAccumulateBook(); setLog('Đã tạo sổ tích lũy'); }} />
      </div>
      {books.length > 0 && (
        <div style={{ marginTop:10 }}>
          <div style={{ fontSize:11, color:'#9B96C8', marginBottom:4 }}>Chọn sổ để test:</div>
          <select value={sel} onChange={e=>setSel(e.target.value)} style={{
            width:'100%', background:'rgba(255,255,255,0.07)', border:'1px solid rgba(255,255,255,0.1)',
            borderRadius:6, padding:'6px 8px', color:'#fff', fontSize:11, marginBottom:6,
          }}>
            <option value="">-- chọn sổ --</option>
            {books.map(b => <option key={b.bookId} value={b.bookId}>{b.bookId.slice(0,20)} ({b.status})</option>)}
          </select>
          <div style={{ display:'flex', gap:6 }}>
            <SimBtn label="⚠ Vi phạm" variant="danger" small onClick={() => {
              if (!sel) return;
              const bk = useAppStore.getState().user.savingsBooks.find(b=>b.bookId===sel);
              const r = bk?.pointTracking.runningPoints ?? 0;
              store.violateBook(sel);
              setLog(`Vi phạm ${sel} — running: ${r} → ${useAppStore.getState().user.savingsBooks.find(b=>b.bookId===sel)?.pointTracking.runningPoints??0}`);
            }} />
            <SimBtn label="⏰ Đáo hạn" variant="ghost" small onClick={() => {
              if (!sel) return;
              store.runMaturity(sel);
              setLog(`Đã đáo hạn ${sel}`);
            }} />
          </div>
        </div>
      )}
      {log && <div style={{ fontSize:10, color:'#4ECDA4', marginTop:6 }}>✓ {log}</div>}
    </div>
  );
}

// ── Section 4: Pet Control ────────────────────────────────
function S4Pet() {
  const store = useAppStore();
  const { form, mood } = useAppStore(s => s.user.petState);
  const FORMS = ['egg','baby','teen','adult','reborn_1','reborn_2'] as const;
  const MOODS = ['happy','neutral','sleeping'] as const;

  return (
    <div>
      <SH t="④ Trạng thái Pet" />
      <div style={{ fontSize:11, color:'#9B96C8', marginBottom:4 }}>Form:</div>
      <div style={{ display:'flex', flexWrap:'wrap', gap:5, marginBottom:10 }}>
        {FORMS.map(f => (
          <button key={f} onClick={() => store.setPetForm(f)} style={{
            padding:'4px 9px', borderRadius:16, fontSize:10, fontWeight:700, cursor:'pointer',
            background: form===f ? '#FF2D8C' : 'rgba(255,255,255,0.05)',
            border: form===f ? '1px solid #FF2D8C' : '1px solid rgba(255,255,255,0.1)',
            color: form===f ? '#fff' : '#9B96C8',
          }}>{f}</button>
        ))}
      </div>
      <div style={{ fontSize:11, color:'#9B96C8', marginBottom:4 }}>Mood:</div>
      <div style={{ display:'flex', gap:5, marginBottom:10 }}>
        {MOODS.map(m => (
          <button key={m} onClick={() => store.setPetMood(m)} style={{
            padding:'4px 9px', borderRadius:16, fontSize:10, fontWeight:700, cursor:'pointer',
            background: mood===m ? '#5BC8F5' : 'rgba(255,255,255,0.05)',
            border: mood===m ? '1px solid #5BC8F5' : '1px solid rgba(255,255,255,0.1)',
            color: mood===m ? '#0D0B1F' : '#9B96C8',
          }}>{m}</button>
        ))}
      </div>
      <SimBtn full id="sim-trigger-round" label="🎉 Trigger Hoàn vòng" variant="secondary"
        onClick={() => store.doTriggerRoundComplete()} />
    </div>
  );
}

// ── Section 5: Reward Control ─────────────────────────────
function S5Rewards() {
  const store = useAppStore();
  const inventory = useAppStore(s => s.user.inventory);
  const [selM, setSelM] = useState(ALL_MILESTONES[0]?.id ?? '');
  const [bagResult, setBagResult] = useState('');

  return (
    <div>
      <SH t="⑤ Test Reward" />
      <div style={{ fontSize:11, color:'#9B96C8', marginBottom:4 }}>Chọn mốc để unlock:</div>
      <select value={selM} onChange={e=>setSelM(e.target.value)} style={{
        width:'100%', background:'rgba(255,255,255,0.07)', border:'1px solid rgba(255,255,255,0.1)',
        borderRadius:6, padding:'6px 8px', color:'#fff', fontSize:11, marginBottom:6,
      }}>
        {ALL_MILESTONES.map(m => (
          <option key={m.id} value={m.id}>{m.id} — {m.pointsRequired.toLocaleString('vi-VN')} pts ({m.rewardType})</option>
        ))}
      </select>
      <SimBtn full id="sim-unlock-milestone" label="🏆 Unlock mốc này → xem popup" variant="primary"
        onClick={() => { if(selM) store.unlockMilestone(selM); }} />
      <div style={{ display:'flex', gap:6, marginTop:8 }}>
        <SimBtn label="🎲 Roll Blind Bag" variant="secondary" small onClick={() => {
          const r = store.doRollBlindBag();
          setBagResult(r);
        }} />
        <SimBtn label="🗑 Xóa Inventory" variant="danger" small onClick={() => {
          if(confirm('Xóa toàn bộ inventory?')) store.clearInventory();
        }} />
      </div>
      {bagResult && <div style={{ fontSize:10, color:'#5BC8F5', marginTop:6 }}>🎲 Kết quả: {bagResult}</div>}
      <div style={{ fontSize:10, color:'#9B96C8', marginTop:6 }}>
        Inventory: {inventory.length} items
        {inventory.slice(0,3).map(i => <span key={i.instanceId}> [{i.type}]</span>)}
        {inventory.length > 3 && <span> +{inventory.length-3} nữa</span>}
      </div>
    </div>
  );
}

// ── Section 6: Debug Info ─────────────────────────────────
function S6Debug() {
  const user = useAppStore(s => s.user);
  const { journey, petState, savingsBooks } = user;
  const total = journey.progressPoints + journey.runningPoints;

  return (
    <div>
      <SH t="⑥ Debug Info" />
      <div style={{
        background:'rgba(0,0,0,0.3)', borderRadius:8, padding:'10px', fontSize:10,
        color:'#9B96C8', fontFamily:'monospace', lineHeight:1.7,
      }}>
        <div><span style={{color:'#FF2D8C'}}>round:</span> {journey.currentRound} (done: {journey.totalRoundsCompleted})</div>
        <div><span style={{color:'#FF2D8C'}}>progress✓:</span> {journey.progressPoints.toLocaleString('vi-VN')}</div>
        <div><span style={{color:'#FF2D8C'}}>running~:</span> {journey.runningPoints.toLocaleString('vi-VN')}</div>
        <div><span style={{color:'#4ECDA4'}}>total:</span> {total.toLocaleString('vi-VN')} / {ROUND_COMPLETE_THRESHOLD.toLocaleString('vi-VN')}</div>
        <div><span style={{color:'#FF2D8C'}}>milestones:</span> {journey.milestoneHistory.map(h=>h.milestoneId).join(', ')||'none'}</div>
        <div><span style={{color:'#5BC8F5'}}>pet:</span> {petState.form} / {petState.mood}</div>
        <div style={{marginTop:4}}><span style={{color:'#FF2D8C'}}>books ({savingsBooks.length}):</span></div>
        {savingsBooks.map(b => (
          <div key={b.bookId} style={{paddingLeft:8}}>
            {b.bookId.slice(-8)} {b.status} L:{b.pointTracking.lockedPoints} R:{b.pointTracking.runningPoints}
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Main SimDrawer ────────────────────────────────────────
interface SimDrawerProps { open: boolean; onClose: () => void; }

export function SimDrawer({ open, onClose }: SimDrawerProps) {
  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}}
            onClick={onClose}
            style={{ position:'fixed',inset:0,zIndex:400,background:'rgba(0,0,0,0.5)' }}
          />

          {/* Drawer */}
          <motion.div
            initial={{x:330}} animate={{x:0}} exit={{x:330}}
            transition={{type:'spring',stiffness:300,damping:30}}
            style={{
              position:'fixed', right:0, top:0, bottom:0, width:320,
              background:'#0D0B1F', borderLeft:'2px solid #FF2D8C',
              zIndex:401, overflowY:'auto', overflowX:'hidden',
              display:'flex', flexDirection:'column',
            }}
          >
            {/* Header */}
            <div style={{
              padding:'16px 16px 12px', borderBottom:'1px solid rgba(255,45,140,0.2)',
              display:'flex', alignItems:'center', gap:8, flexShrink:0,
              position:'sticky', top:0, background:'#0D0B1F', zIndex:1,
            }}>
              <span style={{fontSize:16}}>⚡</span>
              <div style={{flex:1}}>
                <div style={{fontSize:14,fontWeight:900,color:'#fff'}}>Simulation Mode</div>
              </div>
              <div style={{
                background:'rgba(255,45,140,0.2)', border:'1px solid rgba(255,45,140,0.4)',
                borderRadius:8, padding:'2px 8px', fontSize:10, fontWeight:800, color:'#FF2D8C',
              }}>[DEMO]</div>
              <button onClick={onClose} style={{
                background:'none', border:'none', cursor:'pointer',
                color:'#9B96C8', fontSize:20, padding:'0 4px',
              }}>×</button>
            </div>

            {/* Scrollable content */}
            <div style={{ padding:'0 16px 24px', flex:1 }}>
              {/* Priority sections first */}
              <S2Points />
              <HR />
              <S7Scenarios />
              <HR />
              <S1Time />
              <HR />
              <S3Books />
              <HR />
              <S4Pet />
              <HR />
              <S5Rewards />
              <HR />
              <S6Debug />
              <div style={{height:16}} />
              <SimBtn full id="sim-hard-reset" label="⚠ Reset toàn bộ app" variant="danger"
                onClick={() => { if(confirm('Reset toàn bộ?')) { useAppStore.getState().hardReset(); onClose(); } }} />
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
