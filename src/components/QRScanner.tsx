import { useEffect, useRef, useState } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import { X, Camera } from 'lucide-react';
import { motion } from 'framer-motion';

interface QRScannerProps {
  onScan: (tableNumber: number) => void;
  onClose: () => void;
}

const QRScanner = ({ onScan, onClose }: QRScannerProps) => {
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const [error, setError] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const scanner = new Html5Qrcode('qr-reader');
    scannerRef.current = scanner;

    scanner
      .start(
        { facingMode: 'environment' },
        { fps: 10, qrbox: { width: 250, height: 250 } },
        (decodedText) => {
          // Parse mesa number from URL like /menu?mesa=5
          try {
            const url = new URL(decodedText);
            const mesa = url.searchParams.get('mesa');
            if (mesa) {
              const num = parseInt(mesa);
              if (!isNaN(num) && num > 0) {
                scanner.stop().catch(() => {});
                onScan(num);
                return;
              }
            }
          } catch {
            // Try plain number
            const num = parseInt(decodedText);
            if (!isNaN(num) && num > 0) {
              scanner.stop().catch(() => {});
              onScan(num);
              return;
            }
          }
        },
        () => {} // ignore scan failures
      )
      .catch(() => {
        setError('No se pudo acceder a la cámara. Permite el acceso en los ajustes del navegador.');
      });

    return () => {
      scanner.stop().catch(() => {});
    };
  }, [onScan]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[60] bg-background flex flex-col"
    >
      <div className="flex items-center justify-between p-4 border-b border-border">
        <div className="flex items-center gap-2 text-gold">
          <Camera size={20} />
          <span className="font-display text-lg">Escanear QR de mesa</span>
        </div>
        <button
          onClick={() => {
            scannerRef.current?.stop().catch(() => {});
            onClose();
          }}
          className="w-10 h-10 rounded-full border border-border flex items-center justify-center text-muted-foreground hover:text-foreground"
        >
          <X size={20} />
        </button>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center p-6">
        <div
          id="qr-reader"
          ref={containerRef}
          className="w-full max-w-sm rounded-xl overflow-hidden"
        />
        {error ? (
          <div className="mt-6 text-center">
            <p className="text-destructive text-sm">{error}</p>
            <p className="text-muted-foreground text-xs mt-2">
              Asegúrate de permitir el acceso a la cámara
            </p>
          </div>
        ) : (
          <p className="mt-6 text-muted-foreground text-sm text-center">
            Apunta la cámara al código QR de tu mesa
          </p>
        )}
      </div>
    </motion.div>
  );
};

export default QRScanner;
