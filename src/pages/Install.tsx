import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Download, Share, CheckCircle, Smartphone } from 'lucide-react';
import BackButton from '@/components/BackButton';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

const Install = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isIOS, setIsIOS] = useState(false);

  useEffect(() => {
    const isIOSDevice = /iPad|iPhone|iPod/.test(navigator.userAgent);
    setIsIOS(isIOSDevice);

    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true);
    }

    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    await deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') setIsInstalled(true);
    setDeferredPrompt(null);
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center px-6 py-12">
      <div className="w-full max-w-md">
        <BackButton />

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mt-8"
        >
          <img
            src="/logo.png"
            alt="Savoy Cocktail Bar"
            className="w-32 h-32 mx-auto mb-6 object-contain"
            width={512}
            height={512}
          />

          <h1 className="font-display text-3xl gold-text-gradient tracking-wider uppercase">
            Instalar Savoy
          </h1>
          <p className="text-muted-foreground text-sm mt-3 leading-relaxed">
            Añade Savoy a tu pantalla de inicio para acceder rápidamente sin abrir el navegador.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="mt-10 space-y-4"
        >
          {/* Features */}
          {[
            { icon: Smartphone, text: 'Acceso directo desde tu pantalla de inicio' },
            { icon: Download, text: 'Sin descargar nada de la App Store' },
            { icon: CheckCircle, text: 'Pantalla completa, como una app nativa' },
          ].map(({ icon: Icon, text }, i) => (
            <div key={i} className="flex items-center gap-4 bg-surface-elevated rounded-lg p-4">
              <Icon className="text-gold shrink-0" size={22} />
              <span className="text-foreground text-sm">{text}</span>
            </div>
          ))}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mt-10"
        >
          {isInstalled ? (
            <div className="text-center py-4">
              <CheckCircle className="text-success mx-auto mb-2" size={40} />
              <p className="text-success font-display tracking-wider">
                ¡App instalada!
              </p>
            </div>
              </p>
            </div>
          ) : isIOS ? (
            <div className="bg-surface-elevated rounded-lg p-6 text-center space-y-4">
              <Share className="text-gold mx-auto" size={28} />
              <p className="text-foreground font-display text-lg tracking-wider">
                Instrucciones para iPhone
              </p>
              <ol className="text-muted-foreground text-sm text-left space-y-3">
                <li className="flex gap-2">
                  <span className="text-gold font-bold">1.</span>
                  Pulsa el botón <strong className="text-foreground">Compartir</strong> en Safari (el cuadrado con flecha)
                </li>
                <li className="flex gap-2">
                  <span className="text-gold font-bold">2.</span>
                  Desplázate y selecciona <strong className="text-foreground">"Añadir a pantalla de inicio"</strong>
                </li>
                <li className="flex gap-2">
                  <span className="text-gold font-bold">3.</span>
                  Pulsa <strong className="text-foreground">"Añadir"</strong> y listo
                </li>
              </ol>
            </div>
          ) : deferredPrompt ? (
            <button
              onClick={handleInstall}
              className="w-full px-8 py-4 rounded-lg gold-gradient text-primary-foreground font-display text-lg tracking-wider hover:opacity-90 transition-opacity flex items-center justify-center gap-3"
            >
              <Download size={20} />
              Instalar App
            </button>
          ) : (
            <div className="bg-surface-elevated rounded-lg p-6 text-center space-y-3">
              <p className="text-muted-foreground text-sm">
                Abre esta página en el navegador de tu móvil (Chrome o Safari) para instalar la app.
              </p>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default Install;
