import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Instagram, MapPin, Clock, Wine, CalendarDays, ArrowRight, Sparkles, Phone, Mail, Heart } from 'lucide-react';
import savoyLogo from '@/assets/savoy-logo.png';

const fadeUp = {
  initial: { opacity: 0, y: 30 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
  transition: { duration: 0.6 },
};

const stagger = {
  initial: { opacity: 0, y: 20 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
};

const cocktails = [
  { name: 'Negroni Clásico', desc: 'Gin, Campari, vermut rojo. El eterno favorito.' },
  { name: 'Old Fashioned', desc: 'Bourbon, azúcar, Angostura. puro carácter.' },
  { name: 'Espresso Martini', desc: 'Vodka, café, licor de café. Energía y elegancia.' },
  { name: 'Daiquiri de Fresa', desc: 'Ron blanco, lima, fresas frescas. Verano en copa.' },
  { name: 'Margarita Ahumada', desc: 'Tequila mezcal, Cointreau, lima. Con borde de sal ahumada.' },
  { name: 'Savoy Sour', desc: 'Creación de la casa. Whisky, limón, clara, y nuestro toque secreto.' },
];

const highlights = [
  { icon: Wine, title: 'Coctelería de Autor', desc: 'Carta curada con clásicos reinventados y creaciones exclusivas de nuestra barra.' },
  { icon: Sparkles, title: 'Ambiente Art Deco', desc: 'Diseño contemporáneo con la calidez de un club privado. Luces tenues, música selecta.' },
  { icon: CalendarDays, title: 'Eventos & Privados', desc: 'Espacios exclusivos para celebraciones íntimas y eventos corporativos.' },
];

const Promo = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Hero */}
      <section className="relative min-h-screen flex flex-col items-center justify-center px-6 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-gold/5 via-transparent to-transparent pointer-events-none" />

        <motion.img
          src={savoyLogo}
          alt="Savoy by PG"
          initial={{ opacity: 0, scale: 0.85 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1 }}
          className="w-44 h-44 md:w-60 md:h-60 object-contain mb-8 relative z-10"
          width={512}
          height={512}
        />

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="font-display text-3xl md:text-5xl gold-text-gradient tracking-[0.2em] uppercase relative z-10"
        >
          Savoy
        </motion.h1>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-center text-muted-foreground text-lg md:text-xl font-light tracking-wide mt-3 relative z-10"
        >
          Cocktail Bar & Lounge
        </motion.p>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
          className="text-center text-muted-foreground/60 text-sm mt-2 italic relative z-10"
        >
          Donde cada copa cuenta una historia
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1 }}
          className="mt-10 flex flex-col sm:flex-row gap-3 relative z-10"
        >
          <button
            onClick={() => navigate('/menu')}
            className="px-8 py-4 rounded-lg gold-gradient text-primary-foreground font-display text-lg tracking-wider hover:opacity-90 transition-opacity flex items-center justify-center gap-3"
          >
            <Sparkles size={20} />
            Ver Carta
            <ArrowRight size={18} />
          </button>
          <button
            onClick={() => navigate('/reservar')}
            className="px-8 py-4 rounded-lg border border-gold/40 text-gold font-display text-lg tracking-wider hover:bg-gold/10 transition-colors flex items-center justify-center gap-3"
          >
            <CalendarDays size={20} />
            Reservar Mesa
          </button>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.4 }}
          transition={{ delay: 1.5 }}
          className="absolute bottom-8 text-muted-foreground animate-bounce"
        >
          <div className="w-6 h-10 border-2 border-current rounded-full flex justify-center pt-2">
            <div className="w-1 h-2 bg-current rounded-full" />
          </div>
        </motion.div>
      </section>

      {/* Sobre Nosotros */}
      <section className="py-20 px-6">
        <div className="max-w-4xl mx-auto">
          <motion.div {...fadeUp} className="text-center mb-14">
            <h2 className="font-display text-3xl md:text-4xl gold-text-gradient tracking-wider mb-4">
              La Experiencia Savoy
            </h2>
            <div className="art-deco-line max-w-xs mx-auto mb-6" />
            <p className="text-muted-foreground text-base md:text-lg leading-relaxed max-w-2xl mx-auto font-light">
              Un espacio donde la coctelería clásica se encuentra con la innovación.
              Ingredientes premium, técnicas de autor y un ambiente que te transporta
              a otra época. Cada detalle, cuidadosamente pensado para ti.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {highlights.map(({ icon: Icon, title, desc }, i) => (
              <motion.div
                key={title}
                {...stagger}
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

      {/* Carta Destacada */}
      <section className="py-20 px-6 bg-card/30">
        <div className="max-w-4xl mx-auto">
          <motion.div {...fadeUp} className="text-center mb-12">
            <h2 className="font-display text-3xl md:text-4xl gold-text-gradient tracking-wider mb-4">
              De Nuestra Carta
            </h2>
            <div className="art-deco-line max-w-xs mx-auto mb-6" />
            <p className="text-muted-foreground font-light">
              Algunos de nuestros cócteles más pedidos
            </p>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {cocktails.map((cocktail, i) => (
              <motion.div
                key={cocktail.name}
                {...stagger}
                transition={{ delay: i * 0.1 }}
                className="flex items-start gap-4 p-4 rounded-xl bg-card/50 border border-border/50 hover:border-gold/30 transition-colors"
              >
                <div className="w-2 h-2 rounded-full bg-gold mt-2 shrink-0" />
                <div>
                  <h4 className="font-display text-foreground">{cocktail.name}</h4>
                  <p className="text-muted-foreground text-sm font-light">{cocktail.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>

          <motion.div {...fadeUp} className="text-center mt-10">
            <button
              onClick={() => navigate('/menu')}
              className="px-8 py-3 rounded-lg border border-gold/40 text-gold font-display tracking-wider hover:bg-gold/10 transition-colors flex items-center gap-2 mx-auto"
            >
              <Wine size={18} />
              Ver carta completa
              <ArrowRight size={16} />
            </button>
          </motion.div>
        </div>
      </section>

      {/* Ubicación y Horario */}
      <section className="py-20 px-6">
        <div className="max-w-2xl mx-auto">
          <motion.div {...fadeUp} className="text-center mb-12">
            <h2 className="font-display text-3xl md:text-4xl gold-text-gradient tracking-wider mb-4">
              Visítanos
            </h2>
            <div className="art-deco-line max-w-xs mx-auto" />
          </motion.div>

          <motion.div {...fadeUp} className="space-y-6 mb-10">
            <div className="flex items-center gap-4 p-5 rounded-xl bg-card border border-border">
              <div className="w-12 h-12 rounded-full bg-gold/10 flex items-center justify-center shrink-0">
                <MapPin size={22} className="text-gold" />
              </div>
              <div>
                <p className="font-display text-foreground">Puerto de Gandía</p>
                <p className="text-muted-foreground text-sm">Valencia, España</p>
              </div>
            </div>

            <div className="flex items-center gap-4 p-5 rounded-xl bg-card border border-border">
              <div className="w-12 h-12 rounded-full bg-gold/10 flex items-center justify-center shrink-0">
                <Clock size={22} className="text-gold" />
              </div>
              <div>
                <p className="font-display text-foreground">Horario</p>
                <p className="text-muted-foreground text-sm">Jueves a Domingo · 20:00 – 03:00</p>
              </div>
            </div>

            <div className="flex items-center gap-4 p-5 rounded-xl bg-card border border-border">
              <div className="w-12 h-12 rounded-full bg-gold/10 flex items-center justify-center shrink-0">
                <Phone size={22} className="text-gold" />
              </div>
              <div>
                <p className="font-display text-foreground">Reservas</p>
                <p className="text-muted-foreground text-sm">Reserva directamente desde la app o llámanos</p>
              </div>
            </div>
          </motion.div>

          <motion.div {...fadeUp} className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => navigate('/menu')}
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
              @savoy_pg
            </a>
          </motion.div>
        </div>
      </section>

      {/* Instagram CTA */}
      <section className="py-20 px-6 bg-card/30">
        <div className="max-w-3xl mx-auto text-center">
          <motion.div {...fadeUp}>
            <Instagram size={40} className="text-gold mx-auto mb-4" />
            <h2 className="font-display text-2xl md:text-3xl gold-text-gradient tracking-wider mb-4">
              Síguenos en Instagram
            </h2>
            <p className="text-muted-foreground font-light mb-2">
              @savoy_pg
            </p>
            <p className="text-muted-foreground/70 text-sm font-light mb-8 max-w-md mx-auto">
              Cócteles, momentos y noches que valen la pena recordar.
              Etiquétanos en tus fotos con <span className="text-gold font-medium">#SavoyPG</span>
            </p>
            <a
              href="https://www.instagram.com/savoy_pg"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-3 px-8 py-4 rounded-lg border border-gold/40 text-gold font-display tracking-wider hover:bg-gold/10 transition-colors"
            >
              <Instagram size={20} />
              Ir a Instagram
              <ArrowRight size={16} />
            </a>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-10 px-6 border-t border-border">
        <div className="max-w-4xl mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6 mb-6">
            <div className="flex items-center gap-3">
              <img src={savoyLogo} alt="Savoy" className="w-10 h-10 object-contain" />
              <span className="font-display text-gold tracking-widest text-lg">SAVOY by PG</span>
            </div>
            <div className="flex items-center gap-6 text-sm text-muted-foreground">
              <a href="/menu" className="hover:text-gold transition-colors">Carta</a>
              <a href="/reservar" className="hover:text-gold transition-colors">Reservar</a>
              <a href="https://www.instagram.com/savoy_pg" target="_blank" rel="noopener noreferrer" className="hover:text-gold transition-colors flex items-center gap-1">
                <Instagram size={14} />
                Instagram
              </a>
            </div>
          </div>
          <div className="art-deco-line mb-4" />
          <div className="flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-muted-foreground/60">
            <span>© {new Date().getFullYear()} Savoy Cocktail Bar · Puerto de Gandía</span>
            <span className="flex items-center gap-1">Hecho con <Heart size={12} className="text-gold" /> y buen gusto</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Promo;