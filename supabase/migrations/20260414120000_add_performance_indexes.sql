-- Índices de rendimiento para columnas frecuentemente filtradas
-- Mejora el tiempo de respuesta en listados de pedidos, reservas y llamadas al camarero

-- Pedidos: filtrado por mesa, estado y fecha (consultas del dashboard en tiempo real)
CREATE INDEX IF NOT EXISTS idx_orders_table_number ON orders(table_number);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at DESC);

-- Reservas: filtrado por fecha y estado (vista de reservas del staff)
CREATE INDEX IF NOT EXISTS idx_reservations_date ON reservations(reservation_date);
CREATE INDEX IF NOT EXISTS idx_reservations_status ON reservations(status);

-- Llamadas al camarero: filtrado por estado pendiente y mesa
CREATE INDEX IF NOT EXISTS idx_waiter_calls_status ON waiter_calls(status);
CREATE INDEX IF NOT EXISTS idx_waiter_calls_table_number ON waiter_calls(table_number);
