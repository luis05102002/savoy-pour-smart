import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Instagram, MapPin, Clock, Wine, CalendarDays, ArrowRight, Sparkles } from 'lucide-react';
import savoyLogo from '@/assets/savoy-logo.png';

const Promo = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Hero */}
      <section className="relative min-h-screen flex flex-col items-center justify-center px-6 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-gold/5 via-transparent to-transparent" />
        
        <motion.img
          src={savoyLogo}
          alt="Savoy by PG"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1 }}
          className="w-40 h-40 md:w-56 md:h-56 object-contain mb-8 relative z-10"
          width={512}
          height={512}
        />

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="text-center text-muted-foreground text-lg md:text-xl font-light tracking-wide max-w-md relative z-10"
        >
          Cocktail Bar & Lounge
        </motion.p>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
          className="text-center text-muted-foreground/70 text-sm mt-3 max-w-sm font-light tracking-wider relative z-10"
        >
          Donde cada copa cuenta una historia
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1 }}
          className="mt-12 flex flex-col sm:flex-row gap-4 relative z-10"
        >
          <button
            onClick={() => navigate('/')}
            className="px-8 py-4 rounded-lg gold-gradient text-primary-foreground font-display text-lg tracking-wider hover:opacity-90 transition-opacity flex items-center gap-3"
          >
            <Sparkles size={20} />
            Entrar a la App
            <ArrowRight size={18} />
          </button>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.5 }}
          transition={{ delay: 1.5 }}
          className="absolute bottom-8 text-muted-foreground/50 animate-bounce"
        >
          <div className="w-6 h-10 border-2 border-current rounded-full flex justify-center pt-2">
            <div className="w-1 h-2 bg-current rounded-full" />
          </div>
        </motion.div>
      </section>

      {/* About */}
      <section className="py-24 px-6">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="font-display text-3xl md:text-4xl gold-text-gradient tracking-wider mb-6">
              La Experiencia Savoy
            </h2>
            <div className="art-deco-line max-w-xs mx-auto mb-8" />
            <p className="text-muted-foreground text-base md:text-lg leading-relaxed max-w-2xl mx-auto font-light">
              Un espacio donde la coctelería clásica se encuentra con la innovación. 
              Ingredientes premium, técnicas de autor y un ambiente que te transporta 
              a otra época. Cada detalle, cuidadosamente pensado para ti.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                icon: Wine,
                title: 'Coctelería de Autor',
                desc: 'Carta curada con clásicos reinventados y creaciones exclusivas de nuestra barra.',
              },
              {
                icon: Sparkles,
                title: 'Ambiente Único',
                desc: 'Diseño Art Deco contemporáneo con la calidez de un club privado.',
              },
              {
                icon: CalendarDays,
                title: 'Eventos Privados',
                desc: 'Espacios exclusivos para celebraciones y eventos corporativos.',
              },
            ].map(({ icon: Icon, title, desc }, i) => (
              <motion.div
                key={title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.15 }}
                className="text-center p-8 rounded-2xl bg-card border border-border hover:border-gold/30 transition-colors"
              >
                <div className="w-14 h-14 rounded-full bg-gold/10 flex items-center justify-center mx-auto mb-5">
                  <Icon size={24} className="text-gold" />
                </div>
                <h3 className="font-display text-lg text-foreground mb-3">{title}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed font-light">{desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Info & CTA */}
      <section className="py-24 px-6 bg-card/50">
        <div className="max-w-2xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
          >
            <h2 className="font-display text-2xl gold-text-gradient tracking-wider mb-10">
              Visítanos
            </h2>

            <div className="space-y-4 mb-12">
              <div className="flex items-center justify-center gap-3 text-muted-foreground">
                <MapPin size={18} className="text-gold" />
                <span className="text-sm">Puerto de Gandía, Valencia</span>
              </div>
              <div className="flex items-center justify-center gap-3 text-muted-foreground">
                <Clock size={18} className="text-gold" />
                <span className="text-sm">Jue-Dom · 20:00 - 03:00</span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={() => navigate('/')}
                className="px-8 py-4 rounded-lg gold-gradient text-primary-foreground font-display tracking-wider hover:opacity-90 transition-opacity flex items-center justify-center gap-3"
              >
                <Wine size={20} />
                Ver Carta & Reservar
              </button>
              <a
                href="https://www.instagram.com/savoy_pg"
                target="_blank"
                rel="noopener noreferrer"
                className="px-8 py-4 rounded-lg border border-gold/40 text-gold font-display tracking-wider hover:bg-gold/10 transition-colors flex items-center justify-center gap-3"
              >
                <Instagram size={20} />
                Síguenos
              </a>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-6 border-t border-border">
        <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-muted-foreground">
          <span className="font-display text-gold tracking-widest">SAVOY by PG</span>
          <span>© {new Date().getFullYear()} Todos los derechos reservados</span>
        </div>
      </footer>
    </div>
  );
};

export default Promo;
