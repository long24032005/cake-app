import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect, useRef, useCallback } from 'react';
import { HomeScreen } from './screens/HomeScreen';
import { SavingsScreen } from './screens/SavingsScreen';
import { MilestoneRewardPopup } from './components/MilestoneRewardPopup';
import { InventoryScreen } from './screens/InventoryScreen';
import { ProfileScreen } from './screens/ProfileScreen';
import { MilestoneMapScreen } from './screens/MilestoneMapScreen';
import { SimDrawer } from './components/SimDrawer';
import { useAppStore } from './store/useAppStore';
import { GatoFloatingBubble } from './components/GatoFloatingBubble';
import { GatoAIChatScreen } from './screens/GatoAIChatScreen';
import { BankConsentModal } from './components/BankConsentModal';

// ── Tab definitions ────────────────────────────────────────
const TABS = [
  { id: 'home',      label: 'Trang chủ', icon: '🏠' },
  { id: 'savings',   label: 'Tiết kiệm', icon: '🐷' },
  { id: 'inventory', label: 'Kho đồ',    icon: '🎒' },
  { id: 'profile',   label: 'Hồ sơ',     icon: '👤' },
] as const;
type TabId = typeof TABS[number]['id'] | 'milestoneMap' | 'chat';

function PlaceholderPage({ tab }: { tab: typeof TABS[number] }) {
  return (
    <div className="placeholder-page">
      <div className="placeholder-icon">{tab.icon}</div>
      <p>{tab.label} — coming soon</p>
    </div>
  );
}

function BottomNav({ activeTab, onTabChange }: { activeTab: TabId; onTabChange: (id: TabId) => void }) {
  return (
    <nav className="bottom-nav" role="navigation" aria-label="Main navigation">
      {TABS.map((tab) => {
        const isActive = activeTab === tab.id;
        return (
          <button key={tab.id} id={`nav-tab-${tab.id}`}
            className={`nav-tab${isActive ? ' active' : ''}`}
            onClick={() => onTabChange(tab.id)}
            aria-label={tab.label} aria-current={isActive ? 'page' : undefined}
          >
            <motion.span className="nav-tab-icon"
              animate={isActive ? { scale: [1, 1.25, 1] } : { scale: 1 }}
              transition={{ duration: 0.3, ease: 'easeOut' }}
            >{tab.icon}</motion.span>
            <span className="nav-tab-label">{tab.label}</span>
          </button>
        );
      })}
    </nav>
  );
}

export function PetApp({ onClose }: { onClose?: () => void }) {
  const [activeTab, setActiveTab]   = useState<TabId>('home');
  const [simOpen, setSimOpen]       = useState(false);
  const [tapCount, setTapCount]     = useState(0);
  const tapTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const currentTab         = TABS.find((t) => t.id === activeTab) || TABS[0];
  const pendingMilestone   = useAppStore(s => s.pendingMilestonePopup);
  const pendingBlindBagItem = useAppStore(s => s.pendingBlindBagItem);
  const dismissMilestone   = useAppStore(s => s.dismissMilestonePopup);
  const user               = useAppStore(s => s.user);
  const [consentOpen, setConsentOpen] = useState(false);

  // ── Activate via URL param ?sim=true ─────────────────────
  useEffect(() => {
    const p = new URLSearchParams(window.location.search);
    if (p.get('sim') === 'true') setSimOpen(true);
  }, []);

  // ── Right-edge swipe activation ───────────────────────────
  useEffect(() => {
    let startX = 0;
    const onTouchStart = (e: TouchEvent) => { startX = e.touches[0].clientX; };
    const onTouchEnd   = (e: TouchEvent) => {
      const endX = e.changedTouches[0].clientX;
      const deltaX = startX - endX;          // negative = swipe left (from right edge in)
      if (startX > window.innerWidth - 40 && deltaX < -50) setSimOpen(true);
    };
    window.addEventListener('touchstart', onTouchStart, { passive: true });
    window.addEventListener('touchend', onTouchEnd, { passive: true });
    return () => { window.removeEventListener('touchstart', onTouchStart); window.removeEventListener('touchend', onTouchEnd); };
  }, []);

  // ── 5-tap logo handler ────────────────────────────────────
  const handleLogoTap = useCallback(() => {
    if (tapTimerRef.current) clearTimeout(tapTimerRef.current);
    setTapCount(prev => {
      const next = prev + 1;
      if (next >= 5) { setSimOpen(true); return 0; }
      tapTimerRef.current = setTimeout(() => setTapCount(0), 1500);
      return next;
    });
  }, []);

  function handleViewInventory() { setActiveTab('inventory'); dismissMilestone(); }

  function renderTab() {
    switch (activeTab) {
      case 'home':    return <HomeScreen onGoToInventory={() => setActiveTab('inventory')} onGoToSavings={() => setActiveTab('savings')} onGoToMilestoneMap={() => setActiveTab('milestoneMap')} onLogoTap={handleLogoTap} />;
      case 'savings': return <SavingsScreen />;
      case 'inventory': return <InventoryScreen />;
      case 'profile': return <ProfileScreen />;
      case 'milestoneMap': return <MilestoneMapScreen onBack={() => setActiveTab('home')} />;
      case 'chat': return <GatoAIChatScreen onBack={() => setActiveTab('home')} />;
      default:        return <PlaceholderPage tab={currentTab} />;
    }
  }

  return (
    <>
      <main className="page-content" id="main-content">
        <AnimatePresence mode="wait">
          <motion.div key={activeTab}
            initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.2 }}
            style={{ minHeight: '100%' }}
          >{renderTab()}</motion.div>
        </AnimatePresence>
      </main>

      {activeTab !== 'chat' && activeTab !== 'milestoneMap' && (
        <BottomNav activeTab={activeTab} onTabChange={setActiveTab} />
      )}

      {activeTab === 'home' && (
        <GatoFloatingBubble onClick={() => {
          if (user?.externalBankLinked) {
            setActiveTab('chat');
          } else {
            setConsentOpen(true);
          }
        }} />
      )}

      {/* ── ⚡ DEMO badge when Sim Mode ever opened (spec D3) */}
      <AnimatePresence>
        {simOpen && (
          <motion.button
            initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.8 }}
            onClick={() => setSimOpen(true)}
            style={{
              position: 'fixed', top: 14, right: 16, zIndex: 200,
              background: 'rgba(255,45,140,0.15)', border: '1px solid rgba(255,45,140,0.4)',
              borderRadius: 10, padding: '3px 10px', cursor: 'pointer',
              fontSize: 11, fontWeight: 800, color: '#FF2D8C',
            }}
          >⚡ DEMO</motion.button>
        )}
      </AnimatePresence>

      {/* Tap count hint (subtle, disappears) */}
      <AnimatePresence>
        {tapCount >= 2 && tapCount < 5 && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ position:'fixed', top:50, left:'50%', transform:'translateX(-50%)', zIndex:200,
              background:'rgba(0,0,0,0.7)', borderRadius:20, padding:'4px 12px',
              fontSize:10, color:'#FF2D8C', fontWeight:700, pointerEvents:'none' }}
          >⚡ Tap {5 - tapCount} lần nữa</motion.div>
        )}
      </AnimatePresence>

      {/* Milestone popup */}
      <AnimatePresence>
        {pendingMilestone && (
          <MilestoneRewardPopup key={pendingMilestone.id}
            milestone={pendingMilestone} blindBagItem={pendingBlindBagItem}
            onClose={dismissMilestone} onViewInventory={handleViewInventory}
          />
        )}
      </AnimatePresence>

      {/* Simulation Drawer */}
      <SimDrawer open={simOpen} onClose={() => setSimOpen(false)} />

      {/* Bank Consent Modal */}
      <BankConsentModal 
        isOpen={consentOpen} 
        onClose={() => setConsentOpen(false)} 
        onAgreeSuccess={() => setActiveTab('chat')} 
      />

      {/* Global Exit Button */}
      {onClose && activeTab !== 'milestoneMap' && (
        <button
          onClick={onClose}
          style={{
            position: 'absolute', top: 14, left: 16, zIndex: 100,
            background: 'rgba(0,0,0,0.5)', border: '1px solid rgba(255,255,255,0.2)',
            borderRadius: '50%', width: 40, height: 40, color: '#fff', fontSize: 20,
            display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
            backdropFilter: 'blur(4px)'
          }}
        >
          ←
        </button>
      )}
    </>
  );
}
