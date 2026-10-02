export interface DateRange {
  from: Date;
  to: Date;
}

const startOfDay = (date: Date): Date => new Date(date.getFullYear(), date.getMonth(), date.getDate());
const endOfDay = (date: Date): Date => new Date(date.getFullYear(), date.getMonth(), date.getDate(), 23, 59, 59, 999);

/** Construye un rango de días completos (YYYY-MM-DD). Sin parámetros devuelve hoy. */
export const toDateRange = (from?: string, to?: string): DateRange => {
  const now = new Date();
  return {
    from: startOfDay(from ? new Date(`${from.slice(0, 10)}T00:00:00`) : now),
    to: endOfDay(to ? new Date(`${to.slice(0, 10)}T00:00:00`) : now),
  };
};

/** Los últimos `days` días, incluyendo hoy. */
export const lastDays = (days: number): DateRange => {
  const now = new Date();
  const from = new Date(now);
  from.setDate(now.getDate() - (days - 1));
  return { from: startOfDay(from), to: endOfDay(now) };
};

/** Clave YYYY-MM-DD en hora local. */
export const dayKey = (date: Date): string => {
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
};

/** Todos los días (clave YYYY-MM-DD) dentro del rango. */
export const daysInRange = ({ from, to }: DateRange): string[] => {
  const keys: string[] = [];
  const cursor = new Date(from);
  while (cursor <= to) {
    keys.push(dayKey(cursor));
    cursor.setDate(cursor.getDate() + 1);
  }
  return keys;
};
