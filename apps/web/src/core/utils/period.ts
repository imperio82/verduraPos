import { toIsoDay } from "./format";

export type PeriodPreset = "hoy" | "2dias" | "semana" | "mes" | "rango";

export interface DateRangeParams {
	from: string;
	to: string;
}

export const PERIOD_OPTIONS = [
	{ value: "hoy", label: "Hoy" },
	{ value: "2dias", label: "2 días" },
	{ value: "semana", label: "Semana" },
	{ value: "mes", label: "Mes" },
] as const satisfies readonly { value: PeriodPreset; label: string }[];

const PRESET_DAYS: Record<Exclude<PeriodPreset, "rango">, number> = { hoy: 1, "2dias": 2, semana: 7, mes: 30 };

/** Convierte un preset ("semana") en un rango de fechas que termina hoy. */
export const presetToRange = (preset: Exclude<PeriodPreset, "rango">, today = new Date()): DateRangeParams => {
	const from = new Date(today);
	from.setDate(today.getDate() - (PRESET_DAYS[preset] - 1));
	return { from: toIsoDay(from), to: toIsoDay(today) };
};

export const PERIOD_LABELS: Record<PeriodPreset, string> = {
	hoy: "del día",
	"2dias": "de 2 días",
	semana: "de la semana",
	mes: "del mes",
	rango: "del periodo",
};
