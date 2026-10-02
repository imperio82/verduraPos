import Link from "next/link";

/** Los registros del día van ligados a una caja abierta: sin caja no se registran. */
export function NoOpenSessionNotice({ what }: { what: string }) {
	return (
		<p className="rounded-xl bg-tint-orange p-3 text-sm">
			No hay cajas abiertas. Abre una caja en{" "}
			<Link href="/cajas" className="font-bold underline">
				Cajas
			</Link>{" "}
			para registrar {what}.
		</p>
	);
}
