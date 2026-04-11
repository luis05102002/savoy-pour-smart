import { useState, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Wine, ScanLine, CalendarDays } from 'lucide-react';
import QRScanner from '@/components/QRScanner';

const Index = () => {
  const navigate = useNavigate();
  const [showScanner, setShowScanner] = useState(false);
  const tapCount = useRef(0);
  const tapTimer = useRef<ReturnType<typeof setTimeout>>();

  const handleLogoTap = useCallback(() => {
    tapCount.current += 1;
    if (tapTimer.current) clearTimeout(tapTimer.current);
    if (tapCount.current >= 3) {
      tapCount.current = 0;
      navigate('/login', { replace: true });
      return;
    }
    tapTimer.current = setTimeout(() => { tapCount.current = 0; }, 5000);
  }, [navigate]);

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="text-center"
      >
        <div className="art-deco-line w-32 mx-auto mb-8" />
        <h1
          onClick={handleLogoTap}
          className="font-display text-5xl md:text-7xl gold-text-gradient tracking-[0.25em] uppercase cursor-default select-none"
        >
          Savoy
        </h1>
        <p className="text-muted-foreground text-sm tracking-[0.4em] uppercase mt-3">
          Cocktail Bar
        </p>
        <div className="art-deco-line w-32 mx-auto mt-8" />
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5, duration: 0.6 }}
        className="mt-16 flex flex-col gap-4 w-full max-w-xs"
      >
        <button
          onClick={() => setShowScanner(true)}
          className="w-full px-8 py-4 rounded-lg gold-gradient text-primary-foreground font-display text-lg tracking-wider hover:opacity-90 transition-opacity flex items-center justify-center gap-3"
        >
          <ScanLine size={20} />
          Escanear QR de Mesa
        </button>
        <button
          onClick={() => navigate('/menu')}
          className="w-full px-8 py-4 rounded-lg border border-gold/40 text-gold font-display text-lg tracking-wider hover:bg-gold/10 transition-colors flex items-center justify-center gap-3"
        >
          <Wine size={20} />
          Ver Carta
        </button>
        <button
          onClick={() => navigate('/reservar')}
          className="w-full px-8 py-4 rounded-lg border border-gold/40 text-gold font-display text-lg tracking-wider hover:bg-gold/10 transition-colors flex items-center justify-center gap-3"
        >
          <CalendarDays size={20} />
          Reservar Mesa
        </button>
      </motion.div>

      <AnimatePresence>
        {showScanner && (
          <QRScanner
            onScan={(mesa) => {
              setShowScanner(false);
              navigate(`/menu?mesa=${mesa}`);
            }}
            onClose={() => setShowScanner(false)}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default Index;
