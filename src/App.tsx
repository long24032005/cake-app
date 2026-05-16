import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MainCakeHomeScreen, CakeBottomNav } from './screens/MainCakeHomeScreen';
import { CakeSavingsScreen } from './screens/CakeSavingsScreen';
import { ManageBooksScreen } from './screens/ManageBooksScreen';
import { PetApp } from './PetApp';
import { OpenStandardBookFlow } from './screens/OpenStandardBookFlow';
import { OpenAccumulateBookFlow } from './screens/OpenAccumulateBookFlow';

export default function App() {
  // Routes for the outer Cake app
  const [activeTab, setActiveTab] = useState('vay_nhanh'); // The bottom nav tab
  const [currentView, setCurrentView] = useState<'cake_main' | 'cake_savings' | 'pet_app' | 'open_standard' | 'open_accumulate' | 'manage_books'>('cake_main');

  function handleTabChange(tabId: string) {
    setActiveTab(tabId);
    if (tabId === 'tiet_kiem') {
      setCurrentView('cake_savings');
    } else {
      setCurrentView('cake_main');
    }
  }

  // A generic placeholder for non-functional tabs
  function ComingSoonPlaceholder() {
    return (
      <div style={{ background: '#0A0A1A', minHeight: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#888', paddingBottom: 80 }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 40, marginBottom: 16 }}>🚧</div>
          <div>Tính năng đang phát triển</div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ width: '100%', height: '100%', position: 'relative', display: 'flex', flexDirection: 'column' }}>
      <AnimatePresence mode="wait">
        {currentView === 'cake_main' && (
          <motion.div key="cake_main" className="page-content" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} style={{ height: '100%' }}>
            {activeTab === 'vay_nhanh' ? <MainCakeHomeScreen onGoToSavings={() => handleTabChange('tiet_kiem')} /> : <ComingSoonPlaceholder />}
          </motion.div>
        )}

        {currentView === 'cake_savings' && (
          <motion.div key="cake_savings" className="page-content" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} style={{ height: '100%' }}>
            <CakeSavingsScreen 
              onBack={() => handleTabChange('vay_nhanh')} 
              onGoToPetApp={() => setCurrentView('pet_app')}
              onOpenStandard={() => setCurrentView('open_standard')}
              onOpenAccumulate={() => setCurrentView('open_accumulate')}
              onManageBooks={() => setCurrentView('manage_books')}
            />
          </motion.div>
        )}

        {currentView === 'manage_books' && (
          <motion.div key="manage_books" className="page-content" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} style={{ height: '100%' }}>
            <ManageBooksScreen onBack={() => setCurrentView('cake_savings')} />
          </motion.div>
        )}

        {currentView === 'open_standard' && (
          <motion.div key="open_standard" className="page-content" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 20 }} style={{ height: '100%', background: '#1A1635' }}>
            <OpenStandardBookFlow 
              onBack={() => setCurrentView('cake_savings')}
              onSuccess={() => setCurrentView('cake_savings')}
            />
          </motion.div>
        )}

        {currentView === 'open_accumulate' && (
          <motion.div key="open_accumulate" className="page-content" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 20 }} style={{ height: '100%', background: '#1A1635' }}>
            <OpenAccumulateBookFlow 
              onBack={() => setCurrentView('cake_savings')}
              onSuccess={() => setCurrentView('cake_savings')}
            />
          </motion.div>
        )}

        {currentView === 'pet_app' && (
          <motion.div key="pet_app" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} style={{ height: '100%', display: 'flex', flexDirection: 'column', background: 'var(--color-bg)' }}>
            <PetApp onClose={() => setCurrentView('cake_savings')} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* The 5-tab nav is only visible in the "Cake" outer shell views */}
      {(currentView === 'cake_main' || currentView === 'cake_savings') && (
        <CakeBottomNav activeTab={activeTab} onTabChange={handleTabChange} />
      )}
    </div>
  );
}
