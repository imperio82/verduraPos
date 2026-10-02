import { formatMoney, formatWeekday } from "@/core/utils/format";
import { type DailyBalance, seriesMax } from "../../domain/entities/accounting-summary.entity";

/** Barras ventas vs. gastos por día (sin librerías de gráficas). */
export function BalanceChart({ serie }: { serie: DailyBalance[] }) {
	const max = seriesMax(serie);
	const days = serie.slice(-14);

	return (
		<div className="flex flex-col gap-3">
			<div className="flex h-40 items-end gap-2">
				{days.map((day) => (
					<div key={day.fecha} className="flex h-full flex-1 flex-col items-center justify-end gap-1.5">
						<div className="flex h-full w-full items-end justify-center gap-1">
							<div
								className="w-full max-w-4 rounded-t-md bg-primary"
								style={{ height: `${(day.ventas / max) * 100}%` }}
								title={`Ventas ${formatMoney(day.ventas)}`}
							/>
							<div
								className="w-full max-w-4 rounded-t-md bg-[#B8C4AF]"
								style={{ height: `${(day.gastos / max) * 100}%` }}
								title={`Gastos ${formatMoney(day.gastos)}`}
							/>
						</div>
						<span className="text-xs font-semibold text-muted-foreground">{formatWeekday(day.fecha)}</span>
					</div>
				))}
			</div>
			<div className="flex gap-4 text-[13px] text-muted-foreground">
				<span className="flex items-center gap-1.5">
					<span className="size-2.5 rounded-sm bg-primary" /> Ventas
				</span>
				<span className="flex items-center gap-1.5">
					<span className="size-2.5 rounded-sm bg-[#B8C4AF]" /> Gastos
				</span>
			</div>
		</div>
	);
}
