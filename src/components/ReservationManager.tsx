import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CalendarDays, Users, MapPin, Clock, Check, X, MessageSquare, Phone, Mail, RefreshCw } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface Reservation {
  id: string;
  customer_name: string;
  customer_phone: string;
  customer_email: string | null;
  reservation_date: string;
  reservation_time: string;
  party_size: number;
  preferred_zone: string | null;
  preferred_table: number | null;
  customer_notes: string | null;
  status: 'pending' | 'confirmed' | 'rejected' | 'completed' | 'cancelled';
  staff_notes: string | null;
  created_at: string;
}

const statusConfig = {
  pending: { label: 'Pendiente', color: 'text-warning', bg: 'bg-warning/10 border-warning/30' },
  confirmed: { label: 'Confirmada', color: 'text-gold', bg: 'bg-gold/10 border-gold/30' },
  rejected: { label: 'Rechazada', color: 'text-destructive', bg: 'bg-destructive/10 border-destructive/30' },
  completed: { label: 'Completada', color: 'text-success', bg: 'bg-success/10 border-success/30' },
  cancelled: { label: 'Cancelada', color: 'text-muted-foreground', bg: 'bg-muted/50 border-border' },
};

const zoneLabels: Record<string, string> = { barra: 'Barra', terraza: 'Terraza', salon: 'Salón', privado: 'Privado' };

const ReservationManager = () => {
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>('upcoming');
  const [staffNotesId, setStaffNotesId] = useState<string | null>(null);
  const [staffNotesText, setStaffNotesText] = useState('');
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const fetchReservations = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('reservations')
      .select('*')
      .order('reservation_date', { ascending: true })
      .order('reservation_time', { ascending: true });

    if (error) {
      toast.error('Error al cargar reservas');
    } else {
      setReservations((data as Reservation[]) || []);
    }
    setLoading(false);
  };

  useEffect(() => { fetchReservations(); }, []);

  const updateStatus = async (id: string, status: Reservation['status']) => {
    setUpdatingId(id);
    const { error } = await supabase
      .from('reservations')
      .update({ status })
      .eq('id', id);

    if (error) {
      toast.error('Error al actualizar');
    } else {
      setReservations(prev => prev.map(r => r.id === id ? { ...r, status } : r));
      toast.success(`Reserva ${statusConfig[status].label.toLowerCase()}`);
    }
    setUpdatingId(null);
  };

  const saveStaffNotes = async () => {
    if (!staffNotesId) return;
    const { error } = await supabase
      .from('reservations')
      .update({ staff_notes: staffNotesText.trim() || null })
      .eq('id', staffNotesId);

    if (error) {
      toast.error('Error al guardar notas');
    } else {
      setReservations(prev => prev.map(r => r.id === staffNotesId ? { ...r, staff_notes: staffNotesText.trim() || null } : r));
      setStaffNotesId(null);
      toast.success('Notas guardadas');
    }
  };

  const today = new Date().toISOString().split('T')[0];
  const filtered = reservations.filter(r => {
    if (filter === 'upcoming') return r.reservation_date >= today && !['rejected', 'cancelled', 'completed'].includes(r.status);
    if (filter === 'today') return r.reservation_date === today;
    if (filter === 'past') return r.reservation_date < today || ['completed', 'cancelled', 'rejected'].includes(r.status);
    return true;
  });

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="font-display text-xl gold-text-gradient tracking-wider uppercase">Reservas</h2>
        <button
          onClick={fetchReservations}
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-border text-muted-foreground text-sm hover:text-foreground transition-colors"
        >
          <RefreshCw size={14} />
          Actualizar
        </button>
      </div>

      {/* Filters */}
      <div className="flex gap-2 mb-6">
        {[
          { id: 'upcoming', label: 'Próximas' },
          { id: 'today', label: 'Hoy' },
          { id: 'past', label: 'Historial' },
          { id: 'all', label: 'Todas' },
        ].map(f => (
          <button
            key={f.id}
            onClick={() => setFilter(f.id)}
            className={`px-4 py-2 rounded-lg text-sm transition-all ${
              filter === f.id
                ? 'bg-gold text-primary-foreground'
                : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="text-center py-20">
          <div className="w-8 h-8 border-2 border-gold border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground text-sm">Cargando reservas...</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20 text-muted-foreground">
          <CalendarDays size={48} className="mx-auto mb-4 opacity-30" />
          <p className="font-display text-lg">Sin reservas</p>
          <p className="text-sm mt-1">Las reservas de clientes aparecerán aquí</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <AnimatePresence>
            {filtered.map(r => {
              const sc = statusConfig[r.status];
              const dateStr = new Date(r.reservation_date + 'T12:00').toLocaleDateString('es-ES', {
                weekday: 'short', day: 'numeric', month: 'short',
              });

              return (
                <motion.div
                  key={r.id}
                  layout
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className={`bg-card border rounded-xl p-5 flex flex-col ${sc.bg}`}
                >
                  {/* Header */}
                  <div className="flex items-center justify-between mb-3">
                    <span className="font-display text-lg text-foreground">{r.customer_name}</span>
                    <span className={`text-xs font-medium px-2 py-1 rounded-full ${sc.color} bg-card/50`}>
                      {sc.label}
                    </span>
                  </div>

                  {/* Details */}
                  <div className="space-y-1.5 text-sm text-muted-foreground mb-3">
                    <div className="flex items-center gap-2">
                      <CalendarDays size={14} />
                      <span>{dateStr} — {r.reservation_time.slice(0, 5)}h</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Users size={14} />
                      <span>{r.party_size} {r.party_size === 1 ? 'persona' : 'personas'}</span>
                    </div>
                    {r.preferred_zone && (
                      <div className="flex items-center gap-2">
                        <MapPin size={14} />
                        <span>{zoneLabels[r.preferred_zone] || r.preferred_zone}{r.preferred_table ? ` · Mesa ${r.preferred_table}` : ''}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-2">
                      <Phone size={14} />
                      <a href={`tel:${r.customer_phone}`} className="hover:text-gold transition-colors">{r.customer_phone}</a>
                    </div>
                    {r.customer_email && (
                      <div className="flex items-center gap-2">
                        <Mail size={14} />
                        <a href={`mailto:${r.customer_email}`} className="hover:text-gold transition-colors text-xs">{r.customer_email}</a>
                      </div>
                    )}
                  </div>

                  {r.customer_notes && (
                    <div className="bg-secondary/50 rounded-lg p-3 mb-3 text-xs text-foreground/80">
                      <span className="text-muted-foreground">Nota:</span> {r.customer_notes}
                    </div>
                  )}

                  {r.staff_notes && staffNotesId !== r.id && (
                    <div className="bg-gold/5 border border-gold/20 rounded-lg p-3 mb-3 text-xs text-foreground/80">
                      <span className="text-gold">Staff:</span> {r.staff_notes}
                    </div>
                  )}

                  {/* Staff notes editor */}
                  {staffNotesId === r.id && (
                    <div className="mb-3 space-y-2">
                      <textarea
                        value={staffNotesText}
                        onChange={e => setStaffNotesText(e.target.value)}
                        rows={2}
                        maxLength={500}
                        placeholder="Notas internas del staff..."
                        className="w-full px-3 py-2 rounded-lg bg-secondary border border-border text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-gold transition-colors resize-none"
                      />
                      <div className="flex justify-end -mt-1">
                        <span className={`text-xs ${staffNotesText.length > 450 ? 'text-warning' : 'text-muted-foreground'}`}>
                          {staffNotesText.length}/500
                        </span>
                      </div>
                      <div className="flex gap-2">
                        <button onClick={saveStaffNotes} className="flex-1 py-1.5 rounded-lg bg-gold text-primary-foreground text-xs font-medium">
                          Guardar
                        </button>
                        <button onClick={() => setStaffNotesId(null)} className="px-3 py-1.5 rounded-lg border border-border text-xs text-muted-foreground">
                          Cancelar
                        </button>
                      </div>
                    </div>
                  )}

                  <div className="art-deco-line my-2" />

                  {/* Actions */}
                  <div className="flex gap-2 mt-2 flex-wrap">
                    {r.status === 'pending' && (
                      <>
                        <button
                          onClick={() => updateStatus(r.id, 'confirmed')}
                          disabled={updatingId === r.id}
                          className="flex-1 py-2 rounded-lg bg-gold text-primary-foreground text-sm font-medium flex items-center justify-center gap-1.5 disabled:opacity-60"
                        >
                          {updatingId === r.id
                            ? <div className="w-3.5 h-3.5 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" />
                            : <Check size={14} />}
                          Confirmar
                        </button>
                        <button
                          onClick={() => updateStatus(r.id, 'rejected')}
                          disabled={updatingId === r.id}
                          className="py-2 px-3 rounded-lg border border-destructive/40 text-destructive text-sm flex items-center gap-1.5 disabled:opacity-60"
                        >
                          <X size={14} /> Rechazar
                        </button>
                      </>
                    )}
                    {r.status === 'confirmed' && (
                      <button
                        onClick={() => updateStatus(r.id, 'completed')}
                        disabled={updatingId === r.id}
                        className="flex-1 py-2 rounded-lg bg-gold text-primary-foreground text-sm font-medium flex items-center justify-center gap-1.5 disabled:opacity-60"
                      >
                        {updatingId === r.id
                          ? <div className="w-3.5 h-3.5 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" />
                          : <Check size={14} />}
                        Completar
                      </button>
                    )}
                    {!['completed', 'cancelled', 'rejected'].includes(r.status) && (
                      <button
                        onClick={() => updateStatus(r.id, 'cancelled')}
                        disabled={updatingId === r.id}
                        className="py-2 px-3 rounded-lg border border-border text-muted-foreground text-xs hover:text-foreground disabled:opacity-60"
                      >
                        Cancelar
                      </button>
                    )}
                    <button
                      onClick={() => { setStaffNotesId(r.id); setStaffNotesText(r.staff_notes || ''); }}
                      className="py-2 px-3 rounded-lg border border-border text-muted-foreground text-xs hover:text-gold transition-colors flex items-center gap-1"
                    >
                      <MessageSquare size={12} /> Nota
                    </button>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
};

export default ReservationManager;
