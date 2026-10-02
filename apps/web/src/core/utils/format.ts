const numberFormat = new Intl.NumberFormat("es-CO", { maximumFractionDigits: 0 });
const quantityFormat = new Intl.NumberFormat("es-CO", { maximumFractionDigits: 3 });

/** $1.284.500 · −$2.000 */
export const formatMoney = (value: number): string =>
	`${value < 0 ? "−" : ""}$${numberFormat.format(Math.abs(Math.round(value)))}`;

/** Con signo explícito: +$3.000 / −$5.000 / $0 */
export const formatSignedMoney = (value: number): string => (value > 0 ? `+${formatMoney(value)}` : formatMoney(value));

export const formatNumber = (value: number, maxDecimals = 3): string =>
	new Intl.NumberFormat("es-CO", { maximumFractionDigits: maxDecimals }).format(value);

/** 1,25 kg · 3 und · 1 manojo / 2 manojos */
export const formatQuantity = (value: number, unit: string): string => {
	const label = unit === "manojo" && value !== 1 ? "manojos" : unit;
	return `${quantityFormat.format(value)} ${label}`;
};

/** 1.250 kg con 3 decimales fijos para pantallas de peso. */
export const formatWeight = (value: number): string =>
	new Intl.NumberFormat("es-CO", { minimumFractionDigits: 3, maximumFractionDigits: 3 }).format(value);

/** Interpreta "1,25" o "1.25" como número (con coma, los puntos son de miles). */
export const parseDecimal = (value: string): number => {
	const clean = value.replace(/\s/g, "");
	const normalized = clean.includes(",") ? clean.replace(/\./g, "").replace(",", ".") : clean;
	const parsed = Number.parseFloat(normalized);
	return Number.isFinite(parsed) ? parsed : 0;
};

/** Interpreta "$200.000" como 200000. */
export const parseMoney = (value: string): number => {
	const digits = value.replace(/[^\d-]/g, "");
	return digits ? Number.parseInt(digits, 10) : 0;
};

const toDate = (value: Date | string) => (value instanceof Date ? value : new Date(value));

/** 6:10 a. m. */
export const formatTime = (value: Date | string): string =>
	toDate(value).toLocaleTimeString("es-CO", { hour: "numeric", minute: "2-digit" });

/** 28 sep */
export const formatShortDate = (value: Date | string): string =>
	toDate(value).toLocaleDateString("es-CO", { day: "numeric", month: "short" }).replace(".", "");

/** "Hoy 6:00 a. m." · "28 sep 8:10 p. m." */
export const formatDateTime = (value: Date | string): string => {
	const date = toDate(value);
	const isToday = date.toDateString() === new Date().toDateString();
	return `${isToday ? "Hoy" : formatShortDate(date)} ${formatTime(date)}`;
};

/** Lun, Mar... */
export const formatWeekday = (isoDay: string): string => {
	const label = new Date(`${isoDay}T12:00:00`).toLocaleDateString("es-CO", { weekday: "short" }).replace(".", "");
	return label.charAt(0).toUpperCase() + label.slice(1);
};

/** Fecha local en formato YYYY-MM-DD. */
export const toIsoDay = (date: Date): string => {
	const pad = (n: number) => String(n).padStart(2, "0");
	return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
};
