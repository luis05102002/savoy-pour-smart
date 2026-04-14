/** Tipo de IVA reducido para hostelería en España. Cambiar aquí para actualizar toda la app. */
export const IVA_RATE = 0.10;

/** Divisor para extraer la base imponible de un precio ya con IVA incluido (1 + IVA_RATE). */
export const IVA_DIVISOR = 1 + IVA_RATE;
