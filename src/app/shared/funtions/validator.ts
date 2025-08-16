import { ValidationErrors } from '@angular/forms';
import { AbstractControl } from '@angular/forms';

function toLocalDateOnly(value: unknown): Date | null {
  if (!value) return null;

  // 👉 Si ya es Date, lo normalizamos a (año, mes, día) LOCAL
  if (value instanceof Date && !isNaN(value.getTime())) {
    return new Date(value.getFullYear(), value.getMonth(), value.getDate());
  }

  // 👉 Si viene como 'YYYY-MM-DD' (input type="date"), lo parseamos como LOCAL
  if (typeof value === 'string') {
    // Coincide exactamente 'YYYY-MM-DD'
    const m = value.match(/^(\d{4})-(\d{2})-(\d{2})$/);
    if (m) {
      const y = +m[1],
        mo = +m[2] - 1,
        d = +m[3];
      return new Date(y, mo, d); // ← LOCAL 00:00, sin riesgo UTC
    }

    // Fallback defensivo si llegara otro formato
    const d2 = new Date(value);
    if (!isNaN(d2.getTime())) {
      return new Date(d2.getFullYear(), d2.getMonth(), d2.getDate());
    }
  }

  return null;
}

export function futureDateValidator(
  control: AbstractControl
): ValidationErrors | null {
  const selected = toLocalDateOnly(control.value);
  if (!selected) return null; // 'required' se encarga de vacío

  const now = new Date();
  const todayLocal = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  // 📌 Regla: debe ser estrictamente futura (mañana o más)
  if (selected <= todayLocal) {
    return { futureDate: true };
  }
  return null;
}
