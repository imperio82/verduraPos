"use client";

import { useState } from "react";
import { Field } from "@/core/components/field";
import { Button } from "@/core/ui/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/core/ui/dialog";
import { Input } from "@/core/ui/input";
import type { DateRangeParams } from "@/core/utils/period";

export function DateRangeDialog({
	open,
	onOpenChange,
	initial,
	onApply,
}: {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	initial: DateRangeParams;
	onApply: (range: DateRangeParams) => void;
}) {
	const [from, setFrom] = useState(initial.from);
	const [to, setTo] = useState(initial.to);

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="sm:max-w-sm">
				<DialogHeader>
					<DialogTitle>Elegir fechas</DialogTitle>
				</DialogHeader>
				<div className="grid grid-cols-2 gap-3">
					<Field label="Desde" htmlFor="from">
						<Input id="from" type="date" value={from} max={to} onChange={(e) => setFrom(e.target.value)} />
					</Field>
					<Field label="Hasta" htmlFor="to">
						<Input id="to" type="date" value={to} min={from} onChange={(e) => setTo(e.target.value)} />
					</Field>
				</div>
				<DialogFooter>
					<Button
						variant="dark"
						disabled={!from || !to || from > to}
						onClick={() => {
							onApply({ from, to });
							onOpenChange(false);
						}}
					>
						Ver periodo
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
