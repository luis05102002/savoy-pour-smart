import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Instagram, MapPin, Clock, Wine, Sparkles, CalendarDays, ArrowRight, ArrowLeft, Heart } from 'lucide-react';
import savoyLogo from '@/assets/savoy-logo.png';

// Import drink images that ARE bundled with the app
import drinks1 from '@/assets/drinks/veuve-clicquot.jpg';
import drinks2 from '@/assets/drinks/velvet-noir.jpg';
import drinks3 from '@/assets/drinks/truffle-old-fashioned.jpg';
import drinks4 from '@/assets/drinks/mediterranean-breeze.jpg';
import drinks5 from '@/assets/drinks/golden-elixir.jpg';
import drinks6 from '@/assets/drinks/botanical-garden.jpg';
import drinks7 from '@/assets/drinks/dom-perignon.jpg';
import drinks8 from '@/assets/drinks/clase-azul.jpg';
import drinks9 from '@/assets/drinks/cloudy-bay.jpg';
import drinks10 from '@/assets/drinks/golden-night.jpg';
import drinks11 from '@/assets/drinks/savoy-royale.jpg';
import drinks12 from '@/assets/drinks/macallan-18.jpg';

import imgCafeCopa from '@/assets/savoy-cafe-copa.jpg';
import imgGracias from '@/assets/savoy-gracias.jpg';
import imgApertura from '@/assets/savoy-apertura.jpg';
import imgSemanaSanta from '@/assets/savoy-semana-santa.jpg';
import imgVermut from '@/assets/savoy-vermut.jpg';
import imgHaVuelto from '@/assets/savoy-ha-vuelto.jpg';


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
  { name: 'Old Fashioned', desc: 'Bourbon, azúcar, Angostura. Puro carácter.' },
  { name: 'Espresso Martini', desc: 'Vodka, café, licor de café. Energía y elegancia.' },
  { name: 'Daiquiri de Fresa', desc: 'Ron blanco, lima, fresas frescas. Verano en copa.' },
  { name: 'Margarita Ahumada', desc: 'Tequila mezcal, Cointreau, lima. Con borde de sal ahumada.' },
  { name: 'Savoy Sour', desc: 'Creación de la casa. Whisky, limón, clara, y nuestro toque secreto.' },
];

// Use bundled drink images instead of external /images paths
const storyMoments = [
  {
    image: drinks1,
    quote: 'Después de muchos años en silencio, este sitio vuelve a latir. Misma esencia. Nueva energía.',
    sub: 'Aquí se-brindó, se-bailó, se-vivió. Y ahora… se vuelve a-empezar.',
  },
  {
    image: drinks2,
    quote: 'Savoy despierta. Con otra luz, otras ganas y la misma alma que loizo único.',
    sub: 'Lo-que-fue, vuelve a-ser. Y lo-que-viene… promete días que no se-cuentan, se-sienten.',
  },
  {
    image: drinks3,
    quote: 'En 1988, Pigüi estaba detrás de esta barra. Ahora, en 2026, vuelve a hacerlo… junto a su hijo.',
    sub: 'Un-legado-familiar que continúa, con la misma esencia de siempre y muchas ganas de escribir nuevos días y noches en Savoy.',
  },
];

const highlights = [
  { icon: Wine, title: 'Coctelería de Autor', desc: 'Carta curada con clásicos reinventados y creaciones exclusivas de nuestra barra.' },
  { icon: Sparkles, title: 'Ambiente Inconfundible', desc: 'Música que se siente, copas bien servidas y noches que no se parecen a ninguna otra.' },
  { icon: CalendarDays, title: 'Eventos & Privados', desc: 'Espacios exclusivos para celebraciones íntimas y eventos corporativos.' },
];

const Promo = () => {
  // Página de Conócenos - Savoy
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Botón Volver */}
      <button
        onClick={() => navigate('/')}
        className="fixed top-4 left-4 z-50 p-3 rounded-full bg-background/80 backdrop-blur-sm border border-border hover:border-gold/50 transition-colors"
        aria-label="Volver"
      >
        <ArrowLeft size={20} className="text-foreground" />
      </button>

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
          Desde la primera hasta la última. Aquí apetece.
        </motion.p>

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

      {/* Nuestra Historia — Real content from @savoy_pg */}
      <section className="py-20 px-6">
        <div className="max-w-5xl mx-auto">
          <motion.div {...fadeUp} className="text-center mb-14">
            <h2 className="font-display text-3xl md:text-4xl gold-text-gradient tracking-wider mb-4">
              Nuestra Historia
            </h2>
            <div className="art-deco-line max-w-xs mx-auto mb-6" />
            <p className="text-muted-foreground text-base md:text-lg leading-relaxed max-w-2xl mx-auto font-light">
              En 1988, Pigüi estaba detrás de esta barra. Ahora, en 2026, vuelve a hacerlo…
              pero esta vez junto a su hijo, que ha crecido entre bares, negocios y el amor por la hostelería.
            </p>
          </motion.div>

          <div className="space-y-20">
            {storyMoments.map(({ image, quote, sub }, i) => (
              <motion.div
                key={i}
                {...fadeUp}
                transition={{ delay: i * 0.1 }}
                className={`flex flex-col ${i % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'} gap-8 items-center`}
              >
                <div className="w-full md:w-1/2">
                  <img
                    src={image}
                    alt={quote}
                    className="w-full aspect-[4/3] object-cover rounded-2xl border border-border/50"
                    loading="lazy"
                  />
                </div>
                <div className="w-full md:w-1/2 space-y-4">
                  <p className="font-display text-xl md:text-2xl text-foreground leading-relaxed">
                    "{quote}"
                  </p>
                  <p className="text-muted-foreground font-light leading-relaxed">
                    {sub}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Savoy No Se Explica, Se Vive */}
      <section className="py-20 px-6 bg-card/30">
        <div className="max-w-4xl mx-auto">
          <motion.div {...fadeUp} className="text-center mb-12">
            <h2 className="font-display text-3xl md:text-4xl gold-text-gradient tracking-wider mb-4">
              Más Que Un Bar
            </h2>
            <div className="art-deco-line max-w-xs mx-auto mb-6" />
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
            <motion.div {...stagger} className="relative overflow-hidden rounded-2xl">
              <img
                src={drinks4}
                alt="Un rincón para los que no buscan lo de siempre"
                className="w-full aspect-[3/4] object-cover"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-transparent to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-6">
                <p className="font-display text-lg text-white leading-relaxed">
                  Un rincón para los que no buscan lo de siempre.
                </p>
                <p className="text-white/70 text-sm mt-2 font-light">
                  Para los que prefieren música que se siente, copas bien servidas y noches que no se parecen a ninguna otra.
                </p>
              </div>
            </motion.div>

            <motion.div {...stagger} transition={{ delay: 0.1 }} className="relative overflow-hidden rounded-2xl">
              <img
                src={imgVermut}
                alt="La hora del vermut"
                className="w-full aspect-[3/4] object-cover"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-transparent to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-6">
                <p className="font-display text-lg text-white leading-relaxed">
                  La hora del vermut siempre apetece.
                </p>
                <p className="text-white/70 text-sm mt-2 font-light">
                  No es una hora… es una actitud 🥃 Vermut bien frío, gildas que abren el apetito y ese ambiente que te engancha sin darte cuenta.
                </p>
              </div>
            </motion.div>
          </div>

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

      {/* Galería — Vibe */}
      <section className="py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <motion.div {...fadeUp} className="text-center mb-12">
            <h2 className="font-display text-3xl md:text-4xl gold-text-gradient tracking-wider mb-4">
              Savoy No Se Explica, Se Vive
            </h2>
            <div className="art-deco-line max-w-xs mx-auto mb-6" />
            <p className="text-muted-foreground font-light max-w-2xl mx-auto">
              Un café si vienes temprano. Una copa si vienes tarde. Y si vienes sin plan… mejor todavía.
            </p>
          </motion.div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {[
              { src: imgHaVuelto, alt: 'Savoy ha vuelto al centro de Sanlúcar' },
              { src: imgApertura, alt: 'Apertura de Savoy' },
              { src: imgSemanaSanta, alt: 'Semana Santa en Savoy con Perico The Long' },
              { src: imgGracias, alt: 'GRACIAS por el reencuentro' },
              { src: imgCafeCopa, alt: 'Un café o una copa en Sanlúcar' },
            ].map(({ src, alt }, i) => (
              <motion.div
                key={src}
                {...stagger}
                transition={{ delay: i * 0.08 }}
                className="relative overflow-hidden rounded-xl group"
              >
                <img
                  src={src}
                  alt={alt}
                  className="w-full aspect-square object-cover transition-transform duration-500 group-hover:scale-105"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gold/0 group-hover:bg-gold/10 transition-colors duration-300" />
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

      {/* Ubicación y Contacto */}
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
                <p className="font-display text-foreground">Centro de Sanlúcar</p>
                <p className="text-muted-foreground text-sm">Sanlúcar de Barrameda, Cádiz</p>
              </div>
            </div>

            <div className="flex items-center gap-4 p-5 rounded-xl bg-card border border-border">
              <div className="w-12 h-12 rounded-full bg-gold/10 flex items-center justify-center shrink-0">
                <Clock size={22} className="text-gold" />
              </div>
              <div>
                <p className="font-display text-foreground">Horario</p>
                <p className="text-muted-foreground text-sm">Abierto todos los días · A partir de las 16:00</p>
              </div>
            </div>

            <div className="flex items-center gap-4 p-5 rounded-xl bg-card border border-border">
              <div className="w-12 h-12 rounded-full bg-gold/10 flex items-center justify-center shrink-0">
                <Instagram size={22} className="text-gold" />
              </div>
              <div>
                <p className="font-display text-foreground">Síguenos</p>
                <p className="text-muted-foreground text-sm">
                  <a href="https://www.instagram.com/savoy_pg" target="_blank" rel="noopener noreferrer" className="text-gold hover:underline">
                    @savoy_pg
                  </a> · Momentos que no se explican, se viven
                </p>
              </div>
            </div>
          </motion.div>

          <motion.div {...fadeUp}>
            <a
              href="https://www.instagram.com/savoy_pg"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-3 px-8 py-4 rounded-lg border border-gold/40 text-gold font-display tracking-wider hover:bg-gold/10 transition-colors"
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
            <span>&copy; {new Date().getFullYear()} Savoy Cocktail Bar &middot; Sanlúcar de Barrameda</span>
            <span className="flex items-center gap-1">Hecho con <Heart size={12} className="text-gold" /> y buen gusto</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Promo;