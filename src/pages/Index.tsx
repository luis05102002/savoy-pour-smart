import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Wine, LayoutDashboard } from 'lucide-react';

const Index = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="text-center"
      >
        <div className="art-deco-line w-32 mx-auto mb-8" />
        <h1 className="font-display text-5xl md:text-7xl gold-text-gradient tracking-[0.25em] uppercase">
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
        className="mt-16 flex flex-col sm:flex-row gap-4"
      >
        <button
          onClick={() => navigate('/menu')}
          className="px-8 py-4 rounded-lg gold-gradient text-primary-foreground font-display text-lg tracking-wider hover:opacity-90 transition-opacity flex items-center gap-3"
        >
          <Wine size={20} />
          Ver Carta
        </button>
        <button
          onClick={() => navigate('/dashboard')}
          className="px-8 py-4 rounded-lg border border-gold/40 text-gold font-display text-lg tracking-wider hover:bg-gold/10 transition-colors flex items-center gap-3"
        >
          <LayoutDashboard size={20} />
          Panel Bar
        </button>
      </motion.div>
    </div>
  );
};

export default Index;
