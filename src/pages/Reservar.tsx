import { useState } from 'react';
import { motion } from 'framer-motion';
import { CalendarDays, Users, MapPin, Clock, Send, CheckCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import BackButton from '@/components/BackButton';

const zones = [
  { value: 'barra', label: 'Barra' },
  { value: 'terraza', label: 'Terraza' },
  { value: 'salon', label: 'Salón' },
  { value: 'privado', label: 'Privado' },
] as const;

const timeSlots = Array.from({ length: 13 }, (_, i) => {
  const h = 12 + i;
  return `${h.toString().padStart(2, '0')}:00`;
});

const Reservar = () => {
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    customer_name: '',
    customer_phone: '',
    customer_email: '',
    reservation_date: '',
    reservation_time: '',
    party_size: 2,
    preferred_zone: '' as string,
    preferred_table: '' as string,
    customer_notes: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const { error } = await supabase.from('reservations').insert({
      customer_name: form.customer_name.trim(),
      customer_phone: form.customer_phone.trim(),
      customer_email: form.customer_email.trim() || null,
      reservation_date: form.reservation_date,
      reservation_time: form.reservation_time,
      party_size: Number(form.party_size),
      preferred_zone: form.preferred_zone || null,
      preferred_table: form.preferred_table ? Number(form.preferred_table) : null,
      customer_notes: form.customer_notes.trim() || null,
    } as any);

    setLoading(false);
    if (error) {
      toast.error('Error al enviar la reserva. Inténtalo de nuevo.');
      console.error(error);
    } else {
      setSubmitted(true);
    }
  };

  const today = new Date().toISOString().split('T')[0];

  if (submitted) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center px-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center max-w-sm"
        >
          <CheckCircle size={64} className="text-gold mx-auto mb-6" />
          <h2 className="font-display text-3xl gold-text-gradient tracking-wider uppercase mb-3">
            ¡Reserva Enviada!
          </h2>
          <p className="text-muted-foreground text-sm leading-relaxed mb-2">
            Hemos recibido tu solicitud para <strong className="text-foreground">{form.party_size} personas</strong> el{' '}
            <strong className="text-foreground">{new Date(form.reservation_date + 'T12:00').toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' })}</strong> a las{' '}
            <strong className="text-foreground">{form.reservation_time}h</strong>.
          </p>
          <p className="text-muted-foreground text-xs mt-4">
            Te confirmaremos por teléfono o email en breve.
          </p>
          <div className="art-deco-line w-24 mx-auto mt-8 mb-6" />
          <BackButton to="/" label="Volver al inicio" />
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background px-4 py-8">
      <div className="max-w-md mx-auto">
        <BackButton to="/" label="Inicio" />

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-6 text-center mb-8"
        >
          <div className="art-deco-line w-24 mx-auto mb-6" />
          <h1 className="font-display text-3xl gold-text-gradient tracking-[0.15em] uppercase">
            Reservar Mesa
          </h1>
          <p className="text-muted-foreground text-xs tracking-wider mt-2">
            Solicita tu reserva y te confirmaremos
          </p>
          <div className="art-deco-line w-24 mx-auto mt-6" />
        </motion.div>

        <motion.form
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          onSubmit={handleSubmit}
          className="space-y-4"
        >
          {/* Name */}
          <div>
            <label className="text-xs text-muted-foreground tracking-wider uppercase mb-1.5 block">
              Nombre *
            </label>
            <input
              name="customer_name"
              value={form.customer_name}
              onChange={handleChange}
              required
              maxLength={100}
              placeholder="Tu nombre"
              className="w-full px-4 py-3 rounded-lg bg-secondary border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-gold transition-colors"
            />
          </div>

          {/* Phone */}
          <div>
            <label className="text-xs text-muted-foreground tracking-wider uppercase mb-1.5 block">
              Teléfono *
            </label>
            <input
              name="customer_phone"
              type="tel"
              value={form.customer_phone}
              onChange={handleChange}
              required
              maxLength={20}
              placeholder="+34 600 000 000"
              className="w-full px-4 py-3 rounded-lg bg-secondary border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-gold transition-colors"
            />
          </div>

          {/* Email */}
          <div>
            <label className="text-xs text-muted-foreground tracking-wider uppercase mb-1.5 block">
              Email <span className="text-muted-foreground/50">(opcional)</span>
            </label>
            <input
              name="customer_email"
              type="email"
              value={form.customer_email}
              onChange={handleChange}
              maxLength={255}
              placeholder="tu@email.com"
              className="w-full px-4 py-3 rounded-lg bg-secondary border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-gold transition-colors"
            />
          </div>

          {/* Date & Time */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-muted-foreground tracking-wider uppercase mb-1.5 flex items-center gap-1.5">
                <CalendarDays size={12} /> Fecha *
              </label>
              <input
                name="reservation_date"
                type="date"
                value={form.reservation_date}
                onChange={handleChange}
                required
                min={today}
                className="w-full px-4 py-3 rounded-lg bg-secondary border border-border text-foreground focus:outline-none focus:border-gold transition-colors"
              />
            </div>
            <div>
              <label className="text-xs text-muted-foreground tracking-wider uppercase mb-1.5 flex items-center gap-1.5">
                <Clock size={12} /> Hora *
              </label>
              <select
                name="reservation_time"
                value={form.reservation_time}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 rounded-lg bg-secondary border border-border text-foreground focus:outline-none focus:border-gold transition-colors"
              >
                <option value="">Seleccionar</option>
                {timeSlots.map(t => (
                  <option key={t} value={t}>{t}h</option>
                ))}
              </select>
            </div>
          </div>

          {/* Party size */}
          <div>
            <label className="text-xs text-muted-foreground tracking-wider uppercase mb-1.5 flex items-center gap-1.5">
              <Users size={12} /> Personas *
            </label>
            <select
              name="party_size"
              value={form.party_size}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 rounded-lg bg-secondary border border-border text-foreground focus:outline-none focus:border-gold transition-colors"
            >
              {Array.from({ length: 12 }, (_, i) => i + 1).map(n => (
                <option key={n} value={n}>{n} {n === 1 ? 'persona' : 'personas'}</option>
              ))}
            </select>
          </div>

          {/* Zone */}
          <div>
            <label className="text-xs text-muted-foreground tracking-wider uppercase mb-1.5 flex items-center gap-1.5">
              <MapPin size={12} /> Zona preferida
            </label>
            <div className="grid grid-cols-4 gap-2">
              {zones.map(z => (
                <button
                  key={z.value}
                  type="button"
                  onClick={() => setForm(prev => ({ ...prev, preferred_zone: prev.preferred_zone === z.value ? '' : z.value }))}
                  className={`py-2.5 rounded-lg text-sm transition-all ${
                    form.preferred_zone === z.value
                      ? 'bg-gold text-primary-foreground font-medium'
                      : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
                  }`}
                >
                  {z.label}
                </button>
              ))}
            </div>
          </div>

          {/* Preferred table */}
          <div>
            <label className="text-xs text-muted-foreground tracking-wider uppercase mb-1.5 block">
              Mesa preferida <span className="text-muted-foreground/50">(opcional, 1-20)</span>
            </label>
            <input
              name="preferred_table"
              type="number"
              min={1}
              max={20}
              value={form.preferred_table}
              onChange={handleChange}
              placeholder="Nº de mesa"
              className="w-full px-4 py-3 rounded-lg bg-secondary border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-gold transition-colors"
            />
          </div>

          {/* Notes */}
          <div>
            <label className="text-xs text-muted-foreground tracking-wider uppercase mb-1.5 block">
              Notas especiales
            </label>
            <textarea
              name="customer_notes"
              value={form.customer_notes}
              onChange={handleChange}
              maxLength={500}
              rows={3}
              placeholder="Cumpleaños, alergias, silla de niño..."
              className="w-full px-4 py-3 rounded-lg bg-secondary border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-gold transition-colors resize-none"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 rounded-lg gold-gradient text-primary-foreground font-display text-lg tracking-wider hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center justify-center gap-2 mt-6"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <Send size={18} />
                Enviar Reserva
              </>
            )}
          </button>
        </motion.form>
      </div>
    </div>
  );
};

export default Reservar;
