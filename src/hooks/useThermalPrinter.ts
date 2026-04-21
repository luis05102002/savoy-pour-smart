import { useState, useCallback, useRef, useEffect } from 'react';
import { toast } from 'sonner';

// Tipos de conexión soportados
type PrinterType = 'serial' | 'bluetooth' | 'airprint' | 'share' | null;

interface PrintItem {
  name: string;
  quantity: number;
  price?: number;
  notes?: string;
}

interface PrinterCapabilities {
  serial: boolean;
  bluetooth: boolean;
  airprint: boolean;
  share: boolean;
}

// Comandos ESC/POS básicos para impresoras térmicas USB
const ESC = 0x1B;
const GS = 0x1D;
const commands = {
  INIT: new Uint8Array([ESC, 0x40]),
  ALIGN_CENTER: new Uint8Array([ESC, 0x61, 0x01]),
  ALIGN_LEFT: new Uint8Array([ESC, 0x61, 0x00]),
  BOLD_ON: new Uint8Array([ESC, 0x45, 0x01]),
  BOLD_OFF: new Uint8Array([ESC, 0x45, 0x00]),
  DOUBLE_HEIGHT: new Uint8Array([ESC, 0x21, 0x10]),
  DOUBLE_WIDTH: new Uint8Array([ESC, 0x21, 0x20]),
  NORMAL_SIZE: new Uint8Array([ESC, 0x21, 0x00]),
  CUT_PAPER: new Uint8Array([GS, 0x56, 0x41, 0x00]),
  FEED_LINES: (n: number) => new Uint8Array([ESC, 0x64, n]),
};

export const useThermalPrinter = () => {
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [printerType, setPrinterType] = useState<PrinterType>(null);
  const [capabilities, setCapabilities] = useState<PrinterCapabilities>({
    serial: false,
    bluetooth: false,
    airprint: false,
    share: false,
  });
  
  const portRef = useRef<any>(null);
  const writerRef = useRef<WritableStreamDefaultWriter<Uint8Array> | null>(null);
  const bluetoothDeviceRef = useRef<any>(null);

  // Detectar capacidades del dispositivo
  useEffect(() => {
    const caps: PrinterCapabilities = {
      serial: 'serial' in navigator,
      bluetooth: 'bluetooth' in navigator,
      airprint: /iPhone|iPad|iPod|Mac/.test(navigator.userAgent),
      share: 'share' in navigator,
    };
    setCapabilities(caps);
  }, []);

  // Conectar según el tipo de dispositivo
  const connect = useCallback(async () => {
    setIsConnecting(true);
    
    try {
      // iOS/macOS - Usar AirPrint/Share
      if (capabilities.airprint) {
        setPrinterType('airprint');
        setIsConnected(true);
        toast.success('Modo AirPrint listo', {
          description: 'Se abrirá el menú de impresión nativo',
        });
        return true;
      }
      
      // Android con Bluetooth
      if (capabilities.bluetooth && /Android/.test(navigator.userAgent)) {
        try {
          const device = await (navigator as any).bluetooth.requestDevice({
            filters: [
              { namePrefix: 'Printer' },
              { namePrefix: 'POS' },
              { namePrefix: 'RPP' },
              { namePrefix: 'MTP' },
              { services: ['000018f0-0000-1000-8000-00805f9b34fb'] },
            ],
            optionalServices: ['device_information'],
          });

          // Validate device name to prevent connecting to non-printer devices
          const deviceName = (device.name || '').toLowerCase();
          const isPrinterDevice = ['printer', 'pos', 'rpp', 'mtp', 'thermal', 'receipt'].some(k => deviceName.includes(k));
          if (!isPrinterDevice && device.name) {
            toast.error(`Dispositivo "${device.name}" no reconocido como impresora`);
            return false;
          }

          bluetoothDeviceRef.current = device;
          setPrinterType('bluetooth');
          setIsConnected(true);
          toast.success('Impresora Bluetooth conectada');
          return true;
        } catch (btErr) {
          console.log('Bluetooth falló, intentando Serial...');
        }
      }
      
      // Desktop Chrome/Edge - Web Serial API
      if (capabilities.serial) {
        const port = await (navigator as any).serial.requestPort({
          filters: [
            { usbVendorId: 0x0483 }, // STMicroelectronics
            { usbVendorId: 0x067b }, // Prolific
            { usbVendorId: 0x1a86 }, // QinHeng
            { usbVendorId: 0x0416 }, // Winchiphead
          ],
        });

        await port.open({ baudRate: 9600 });
        
        portRef.current = port;
        writerRef.current = port.writable?.getWriter() || null;
        
        setPrinterType('serial');
        setIsConnected(true);
        toast.success('Impresora USB conectada');
        return true;
      }
      
      // Fallback - Compartir/Imprimir
      setPrinterType('share');
      setIsConnected(true);
      toast.info('Modo compartir activado', {
        description: 'Se usará el diálogo nativo del sistema',
      });
      return true;
      
    } catch (err) {
      console.error('Error conectando:', err);
      toast.error('No se pudo conectar la impresora');
      return false;
    } finally {
      setIsConnecting(false);
    }
  }, [capabilities]);

  // Desconectar
  const disconnect = useCallback(async () => {
    try {
      if (writerRef.current) {
        await writerRef.current.close();
        writerRef.current = null;
      }
      if (portRef.current) {
        await portRef.current.close();
        portRef.current = null;
      }
      bluetoothDeviceRef.current = null;
      setPrinterType(null);
      setIsConnected(false);
      toast.success('Impresora desconectada');
    } catch (err) {
      console.error('Error desconectando:', err);
    }
  }, []);

  // Generar texto plano del ticket
  const generateTicketText = useCallback(({
    tableNumber,
    items,
    orderId,
    timestamp = new Date(),
    type = 'comanda',
  }: {
    tableNumber: number;
    items: PrintItem[];
    orderId: string;
    timestamp?: Date;
    type?: 'comanda' | 'factura';
  }): string => {
    const dateStr = timestamp.toLocaleDateString('es-ES');
    const timeStr = timestamp.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
    
    let text = '';
    
    if (type === 'comanda') {
      text += '\n' + '='.repeat(32) + '\n';
      text += '       COMANDA\n';
      text += '='.repeat(32) + '\n\n';
      text += `  MESA: ${tableNumber}\n\n`;
      text += '-'.repeat(32) + '\n';
      text += `Fecha: ${dateStr} ${timeStr}\n`;
      text += `Pedido: #${orderId.slice(-6).toUpperCase()}\n`;
      text += '-'.repeat(32) + '\n\n';
      
      for (const item of items) {
        text += `${item.quantity}x ${item.name}\n`;
        if (item.notes) {
          text += `   >> ${item.notes}\n`;
        }
        text += '\n';
      }
      
      text += '-'.repeat(32) + '\n';
      text += '\n\n\n';
    } else {
      // Factura
      text += '\n' + '='.repeat(32) + '\n';
      text += '       SAVOY by PG\n';
      text += '   Cocktail Bar & Lounge\n';
      text += '  Sanlucar de Barrameda\n';
      text += '='.repeat(32) + '\n\n';
      text += `Mesa: ${tableNumber}\n`;
      text += `Fecha: ${dateStr} ${timeStr}\n`;
      text += '-'.repeat(32) + '\n\n';
      
      let total = 0;
      for (const item of items) {
        const lineTotal = (item.price || 0) * item.quantity;
        total += lineTotal;
        const name = item.name.slice(0, 20).padEnd(20);
        const price = lineTotal.toFixed(2).padStart(6);
        text += `${item.quantity}x ${name} ${price} EUR\n`;
      }
      
      text += '\n' + '-'.repeat(32) + '\n';
      text += `TOTAL: ${total.toFixed(2).toString().padStart(24)} EUR\n`;
      text += '='.repeat(32) + '\n\n';
      text += '  Gracias por su visita\n';
      text += '   Instagram: @savoy_pg\n';
      text += '\n\n\n';
    }
    
    return text;
  }, []);

  // Imprimir por Serial (ESC/POS)
  const printViaSerial = useCallback(async (text: string) => {
    if (!writerRef.current) throw new Error('Impresora no conectada');
    
    const encoder = new TextEncoder();
    await writerRef.current.write(commands.INIT);
    await writerRef.current.write(commands.FEED_LINES(1));
    await writerRef.current.write(encoder.encode(text));
    await writerRef.current.write(commands.CUT_PAPER);
  }, []);

  // Imprimir por AirPrint (iOS/macOS)
  const printViaAirPrint = useCallback(async (text: string) => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      throw new Error('No se pudo abrir ventana de impresión');
    }
    
    const safeText = text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#x27;');

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Comanda - Mesa</title>
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <style>
          @page { size: 80mm auto; margin: 0; }
          body { 
            font-family: 'Courier New', monospace; 
            font-size: 14px; 
            width: 80mm; 
            padding: 5mm;
            margin: 0;
            white-space: pre-wrap;
            word-wrap: break-word;
          }
          @media print {
            body { width: 80mm; }
          }
        </style>
      </head>
      <body>
        <pre>${safeText}</pre>
        <script>
          window.onload = function() {
            setTimeout(function() {
              window.print();
              setTimeout(function() { window.close(); }, 1000);
            }, 200);
          };
        <\/script>
      </body>
      </html>
    `);
    printWindow.document.close();
  }, []);

  // Compartir vía Web Share API
  const shareTicket = useCallback(async (text: string, title: string) => {
    if (!navigator.share) {
      // Fallback: copiar al portapapeles
      await navigator.clipboard.writeText(text);
      toast.success('Ticket copiado al portapapeles');
      return;
    }
    
    const blob = new Blob([text], { type: 'text/plain' });
    const file = new File([blob], `${title}.txt`, { type: 'text/plain' });
    
    try {
      await navigator.share({
        title: title,
        text: text,
        files: [file],
      });
    } catch (err) {
      if ((err as Error).name !== 'AbortError') {
        // Si falla, copiar al portapapeles
        await navigator.clipboard.writeText(text);
        toast.success('Ticket copiado al portapapeles');
      }
    }
  }, []);

  // Imprimir ticket de comanda
  const printOrderTicket = useCallback(async ({
    tableNumber,
    items,
    orderId,
    timestamp = new Date(),
  }: {
    tableNumber: number;
    items: PrintItem[];
    orderId: string;
    timestamp?: Date;
  }) => {
    if (!isConnected) {
      throw new Error('Impresora no conectada');
    }

    const text = generateTicketText({ tableNumber, items, orderId, timestamp, type: 'comanda' });

    try {
      switch (printerType) {
        case 'serial':
          await printViaSerial(text);
          break;
        case 'bluetooth':
          // Para Bluetooth, usar share como fallback
          await shareTicket(text, `Comanda-Mesa-${tableNumber}`);
          break;
        case 'airprint':
          await printViaAirPrint(text);
          break;
        case 'share':
        default:
          await shareTicket(text, `Comanda-Mesa-${tableNumber}`);
          break;
      }
    } catch (err) {
      console.error('Error imprimiendo:', err);
      throw err;
    }
  }, [isConnected, printerType, generateTicketText, printViaSerial, printViaAirPrint, shareTicket]);

  // Imprimir factura/recibo
  const printReceipt = useCallback(async ({
    tableNumber,
    items,
    total,
    timestamp = new Date(),
  }: {
    tableNumber: number;
    items: PrintItem[];
    total: number;
    timestamp?: Date;
  }) => {
    if (!isConnected) {
      throw new Error('Impresora no conectada');
    }

    const text = generateTicketText({ 
      tableNumber, 
      items, 
      orderId: 'FAC-' + Date.now(), 
      timestamp, 
      type: 'factura' 
    });

    try {
      switch (printerType) {
        case 'serial':
          await printViaSerial(text);
          break;
        case 'bluetooth':
          await shareTicket(text, `Factura-Mesa-${tableNumber}`);
          break;
        case 'airprint':
          await printViaAirPrint(text);
          break;
        case 'share':
        default:
          await shareTicket(text, `Factura-Mesa-${tableNumber}`);
          break;
      }
    } catch (err) {
      console.error('Error imprimiendo recibo:', err);
      throw err;
    }
  }, [isConnected, printerType, generateTicketText, printViaSerial, printViaAirPrint, shareTicket]);

  return {
    isConnected,
    isConnecting,
    printerType,
    capabilities,
    connect,
    disconnect,
    printOrderTicket,
    printReceipt,
  };
};
