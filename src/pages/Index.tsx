import { useRef, useCallback, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Wine, CalendarDays, Info, MapPin } from 'lucide-react';
import savoyLogo from '@/assets/savoy-logo.png';
import VideoIntro from '@/components/VideoIntro';

const Index = () => {
  const navigate = useNavigate();
  const tapCount = useRef(0);
  const tapTimer = useRef<ReturnType<typeof setTimeout>>();
  const [showIntro, setShowIntro] = useState(() => {
    // Only show intro once per device, skip on revisit
    if (localStorage.getItem('savoy-intro-seen')) return false;
    return true;
  });

  const handleIntroComplete = useCallback(() => {
    localStorage.setItem('savoy-intro-seen', '1');
    setShowIntro(false);
  }, []);

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
    <>
      <AnimatePresence>
        {showIntro && <VideoIntro onComplete={handleIntroComplete} />}
      </AnimatePresence>

      <motion.div
        className="min-h-screen bg-background flex flex-col items-center justify-center px-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: showIntro ? 0 : 1 }}
        transition={{ duration: 0.6, delay: 0.2 }}
      >
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: showIntro ? 0 : 1, y: showIntro ? 20 : 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="text-center"
        >
          <div
            onClick={handleLogoTap}
            className="w-44 h-44 md:w-56 md:h-56 mx-auto rounded-[22%] overflow-hidden cursor-default select-none"
            style={{
              backgroundColor: '#7c9786',
              backgroundImage: `url(${savoyLogo})`,
              backgroundSize: '170%',
              backgroundPosition: 'center',
            }}
            role="img"
            aria-label="Savoy by PG"
          />

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: showIntro ? 0 : 1 }}
            transition={{ delay: 0.6, duration: 0.6 }}
            className="mt-4 space-y-1"
          >
            <p className="font-display text-xl gold-text-gradient tracking-[0.25em] uppercase">
              Savoy by PG
            </p>
            <p className="text-muted-foreground text-sm tracking-wider font-light">
              Cocktail Bar & Lounge
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: showIntro ? 0 : 1 }}
            transition={{ delay: 0.9, duration: 0.5 }}
            className="mt-4 flex items-center justify-center gap-3 text-xs text-muted-foreground/70"
          >
            <span className="flex items-center gap-1">
              <MapPin size={11} />
              Sanlúcar de Barrameda
            </span>
            <span className="w-1 h-1 rounded-full bg-muted-foreground/40" />
            <span className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-success animate-pulse" />
              Abierto desde las 16:00
            </span>
          </motion.div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: showIntro ? 0 : 1 }}
          transition={{ delay: 1.1, duration: 0.6 }}
          className="mt-10 flex flex-col gap-3 w-full max-w-xs"
        >
          <button
            onClick={() => navigate('/menu')}
            className="w-full px-8 py-4 rounded-lg gold-gradient text-primary-foreground font-display text-lg tracking-wider hover:opacity-90 transition-opacity flex items-center justify-center gap-3 animate-pulse-gold"
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

          <button
            onClick={() => navigate('/promo')}
            className="w-full px-8 py-3 rounded-lg border border-border/50 text-muted-foreground font-display text-sm tracking-wider hover:border-gold/30 hover:text-gold transition-colors flex items-center justify-center gap-2"
          >
            <Info size={16} />
            Conócenos
          </button>
        </motion.div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: showIntro ? 0 : 1 }}
          transition={{ delay: 1.5, duration: 0.5 }}
          className="mt-6 text-xs text-muted-foreground/40 tracking-wider text-center"
        >
          Una experiencia distinta cada noche
        </motion.p>
      </motion.div>
    </>
  );
};

export default Index;
