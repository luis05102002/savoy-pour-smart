import { useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { motion } from 'framer-motion';
import { Download, Printer, QrCode } from 'lucide-react';
import BackButton from '@/components/BackButton';

const QRCodes = () => {
  const [tableCount, setTableCount] = useState(10);
  const baseUrl = import.meta.env.VITE_APP_URL || window.location.origin;

  const tables = Array.from({ length: tableCount }, (_, i) => i + 1);

  const handlePrintAll = () => {
    window.print();
  };

  const handleDownloadSVG = (tableNumber: number) => {
    const svgElement = document.getElementById(`qr-${tableNumber}`);
    if (!svgElement) return;
    const svgData = new XMLSerializer().serializeToString(svgElement);
    const blob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `savoy-mesa-${tableNumber}.svg`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card">
        <div className="max-w-6xl mx-auto px-6 py-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <BackButton to="/dashboard" label="Panel" />
              <div>
                <h1 className="font-display text-2xl gold-text-gradient tracking-[0.15em] uppercase">
                  Códigos QR
                </h1>
                <p className="text-muted-foreground text-xs tracking-wider">
                  Un QR por cada mesa · Los clientes escanean y piden
                </p>
              </div>
            </div>
            <button
              onClick={handlePrintAll}
              className="hidden md:flex items-center gap-2 px-5 py-2.5 rounded-lg gold-gradient text-primary-foreground font-medium text-sm hover:opacity-90 transition-opacity print:hidden"
            >
              <Printer size={16} />
              Imprimir todos
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-6 py-6 print:px-2">
        {/* Config */}
        <div className="flex items-center gap-4 mb-8 print:hidden">
          <label className="text-sm text-muted-foreground">Nº de mesas:</label>
          <input
            type="number"
            min={1}
            max={50}
            value={tableCount}
            onChange={(e) => setTableCount(Math.min(50, Math.max(1, parseInt(e.target.value) || 1)))}
            className="w-20 px-3 py-2 rounded-lg bg-secondary border border-border text-foreground text-center font-display focus:outline-none focus:border-gold"
          />
        </div>

        {/* QR Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6 print:grid-cols-3 print:gap-4">
          {tables.map((tableNumber) => (
            <motion.div
              key={tableNumber}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: tableNumber * 0.02 }}
              className="bg-card border border-border rounded-xl p-5 flex flex-col items-center text-center print:border-black/20 print:rounded-none print:p-3"
            >
              <div className="bg-white p-3 rounded-lg mb-3">
                <QRCodeSVG
                  id={`qr-${tableNumber}`}
                  value={`${baseUrl}/menu?mesa=${tableNumber}`}
                  size={140}
                  level="H"
                  includeMargin={false}
                  fgColor="#1a1a1a"
                  bgColor="#ffffff"
                />
              </div>
              <span className="font-display text-lg text-gold">Mesa {tableNumber}</span>
              <span className="text-xs text-muted-foreground mt-1 print:hidden">
                /menu?mesa={tableNumber}
              </span>
              <button
                onClick={() => handleDownloadSVG(tableNumber)}
                className="mt-3 flex items-center gap-1.5 text-xs text-muted-foreground hover:text-gold transition-colors print:hidden"
              >
                <Download size={12} />
                Descargar SVG
              </button>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default QRCodes;
