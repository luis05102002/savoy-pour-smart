import { useState, useCallback, useRef } from 'react';
import { toast } from 'sonner';

// Comandos ESC/POS básicos para impresoras térmicas
const ESC = 0x1B;
const GS = 0x1D;
const LF = 0x0A;
const NUL = 0x00;

// Comandos ESC/POS
const commands = {
  INIT: new Uint8Array([ESC, 0x40]), // Initialize printer
  ALIGN_CENTER: new Uint8Array([ESC, 0x61, 0x01]),
  ALIGN_LEFT: new Uint8Array([ESC, 0x61, 0x00]),
  ALIGN_RIGHT: new Uint8Array([ESC, 0x61, 0x02]),
  BOLD_ON: new Uint8Array([ESC, 0x45, 0x01]),
  BOLD_OFF: new Uint8Array([ESC, 0x45, 0x00]),
  DOUBLE_HEIGHT: new Uint8Array([ESC, 0x21, 0x10]),
  DOUBLE_WIDTH: new Uint8Array([ESC, 0x21, 0x20]),
  NORMAL_SIZE: new Uint8Array([ESC, 0x21, 0x00]),
  CUT_PAPER: new Uint8Array([GS, 0x56, 0x41, 0x00]), // Cut paper
  FEED_LINES: (n: number) => new Uint8Array([ESC, 0x64, n]), // Feed n lines
  LINE: new Uint8Array([0xC4, 0xC4, 0xC4, 0xC4, 0xC4, 0xC4, 0xC4, 0xC4, 0xC4, 0xC4, 0xC4, 0xC4, 0xC4, 0xC4, 0xC4, 0xC4, 0xC4, 0xC4, 0xC4, 0xC4, 0xC4, 0xC4, 0xC4, 0xC4, 0xC4, 0xC4, 0xC4, 0xC4, 0xC4, 0xC4, 0xC4, 0xC4]),
};

interface PrinterConfig {
  vendorId?: number;
  productId?: number;
}

interface PrintItem {
  name: string;
  quantity: number;
  price?: number;
  notes?: string;
}

export const useThermalPrinter = () => {
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const portRef = useRef<SerialPort | null>(null);
  const writerRefRef = useRef<WritableStreamDefaultWriter<Uint8Array> | null>(null);

  // Conectar a impresora térmica vía Web Serial API
  const connect = useCallback(async () => {
    if (!('serial' in navigator)) {
      toast.error('Tu navegador no soporta impresión USB. Usa Chrome o Edge.');
      return false;
    }

    setIsConnecting(true);
    try {
      // Solicitar puerto serial
      const port = await navigator.serial.requestPort({
        filters: [
          { usbVendorId: 0x0483 }, // STMicroelectronics (común en impresoras térmicas)
          { usbVendorId: 0x067b }, // Prolific
          { usbVendorId: 0x1a86 }, // QinHeng
          { usbVendorId: 0x0416 }, // Winchiphead
        ],
      });

      await port.open({ baudRate: 9600 });
      
      portRef.current = port;
      writerRefRef.current = port.writable?.getWriter() || null;
      
      setIsConnected(true);
      toast.success('Impresora conectada');
      return true;
    } catch (err) {
      console.error('Error conectando impresora:', err);
      toast.error('No se pudo conectar la impresora');
      return false;
    } finally {
      setIsConnecting(false);
    }
  }, []);

  // Desconectar impresora
  const disconnect = useCallback(async () => {
    try {
      if (writerRefRef.current) {
        await writerRefRef.current.close();
        writerRefRef.current = null;
      }
      if (portRef.current) {
        await portRef.current.close();
        portRef.current = null;
      }
      setIsConnected(false);
      toast.success('Impresora desconectada');
    } catch (err) {
      console.error('Error desconectando:', err);
    }
  }, []);

  // Enviar datos a la impresora
  const sendData = useCallback(async (data: Uint8Array) => {
    if (!writerRefRef.current) {
      throw new Error('Impresora no conectada');
    }
    await writerRefRef.current.write(data);
  }, []);

  // Enviar texto
  const sendText = useCallback(async (text: string) => {
    const encoder = new TextEncoder();
    await sendData(encoder.encode(text));
  }, [sendData]);

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
    if (!isConnected || !writerRefRef.current) {
      throw new Error('Impresora no conectada');
    }

    try {
      // Inicializar impresora
      await sendData(commands.INIT);
      await sendData(commands.FEED_LINES(1));

      // Título centrado y grande
      await sendData(commands.ALIGN_CENTER);
      await sendData(commands.BOLD_ON);
      await sendData(commands.DOUBLE_HEIGHT);
      await sendData(commands.DOUBLE_WIDTH);
      await sendText('COMANDA\n');
      await sendData(commands.NORMAL_SIZE);
      await sendData(commands.BOLD_OFF);
      await sendData(commands.FEED_LINES(1));

      // Mesa
      await sendData(commands.DOUBLE_HEIGHT);
      await sendData(commands.BOLD_ON);
      await sendText(`MESA ${tableNumber}\n`);
      await sendData(commands.BOLD_OFF);
      await sendData(commands.NORMAL_SIZE);
      await sendData(commands.FEED_LINES(1));

      // Línea separadora
      await sendData(commands.ALIGN_LEFT);
      await sendText('--------------------------------\n');

      // Fecha y hora
      const dateStr = timestamp.toLocaleDateString('es-ES');
      const timeStr = timestamp.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
      await sendText(`Fecha: ${dateStr} ${timeStr}\n`);
      await sendText(`Pedido: #${orderId.slice(-6).toUpperCase()}\n`);
      await sendText('--------------------------------\n');
      await sendData(commands.FEED_LINES(1));

      // Items
      for (const item of items) {
        await sendData(commands.BOLD_ON);
        await sendText(`${item.quantity}x ${item.name}\n`);
        await sendData(commands.BOLD_OFF);
        
        if (item.notes) {
          await sendText(`   >> ${item.notes}\n`);
        }
        await sendData(commands.FEED_LINES(1));
      }

      // Línea final
      await sendText('--------------------------------\n');
      await sendData(commands.FEED_LINES(2));

      // Cortar papel
      await sendData(commands.CUT_PAPER);

    } catch (err) {
      console.error('Error imprimiendo:', err);
      throw err;
    }
  }, [isConnected, sendData, sendText]);

  // Imprimir precuenta/factura
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
    if (!isConnected || !writerRefRef.current) {
      throw new Error('Impresora no conectada');
    }

    try {
      await sendData(commands.INIT);
      await sendData(commands.FEED_LINES(1));

      // Header
      await sendData(commands.ALIGN_CENTER);
      await sendData(commands.BOLD_ON);
      await sendData(commands.DOUBLE_HEIGHT);
      await sendText('SAVOY by PG\n');
      await sendData(commands.NORMAL_SIZE);
      await sendData(commands.BOLD_OFF);
      await sendText('Cocktail Bar & Lounge\n');
      await sendText('Sanlucar de Barrameda\n');
      await sendData(commands.FEED_LINES(1));

      // Info
      await sendData(commands.ALIGN_LEFT);
      await sendText(`Mesa: ${tableNumber}\n`);
      await sendText(`Fecha: ${timestamp.toLocaleString('es-ES')}\n`);
      await sendText('--------------------------------\n');

      // Items
      for (const item of items) {
        const lineTotal = (item.price || 0) * item.quantity;
        await sendText(`${item.quantity}x ${item.name.padEnd(20).slice(0, 20)} ${lineTotal.toFixed(2).padStart(6)} EUR\n`);
      }

      await sendText('--------------------------------\n');
      
      // Total
      await sendData(commands.ALIGN_RIGHT);
      await sendData(commands.BOLD_ON);
      await sendText(`TOTAL: ${total.toFixed(2)} EUR\n`);
      await sendData(commands.BOLD_OFF);
      await sendData(commands.FEED_LINES(2));

      // Footer
      await sendData(commands.ALIGN_CENTER);
      await sendText('Gracias por su visita\n');
      await sendText('Instagram: @savoy_pg\n');
      await sendData(commands.FEED_LINES(3));
      await sendData(commands.CUT_PAPER);

    } catch (err) {
      console.error('Error imprimiendo recibo:', err);
      throw err;
    }
  }, [isConnected, sendData, sendText]);

  return {
    isConnected,
    isConnecting,
    connect,
    disconnect,
    printOrderTicket,
    printReceipt,
  };
};
