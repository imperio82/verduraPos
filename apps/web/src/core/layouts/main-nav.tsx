"use client";

import { BarChart3Icon, BoxIcon, type LucideIcon, ShoppingBasketIcon, WalletIcon } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/core/lib/utils";

interface NavItem {
	href: string;
	label: string;
	icon: LucideIcon;
}

export const NAV_ITEMS: NavItem[] = [
	{ href: "/vender", label: "Vender", icon: ShoppingBasketIcon },
	{ href: "/cajas", label: "Cajas", icon: WalletIcon },
	{ href: "/cuentas", label: "Cuentas", icon: BarChart3Icon },
	{ href: "/inventario", label: "Inventario", icon: BoxIcon },
];

const useIsActive = () => {
	const pathname = usePathname();
	return (href: string) => pathname === href || pathname.startsWith(`${href}/`);
};

/** Barra lateral de escritorio (según pantallas Main/Cajas/Admin/Inventario). */
export function SideNav() {
	const isActive = useIsActive();
	return (
		<nav
			aria-label="Principal"
			className="sticky top-0 hidden h-dvh w-[104px] shrink-0 flex-col items-center gap-2 bg-nav px-2.5 py-5 md:flex"
		>
			<Link
				href="/vender"
				className="mb-4 flex size-[52px] items-center justify-center rounded-2xl bg-brand-dark font-display text-2xl font-extrabold text-brand-yellow"
				aria-label="Inicio"
			>
				V
			</Link>
			{NAV_ITEMS.map(({ href, label, icon: Icon }) => (
				<Link
					key={href}
					href={href}
					aria-current={isActive(href) ? "page" : undefined}
					className={cn(
						"flex w-[84px] flex-col items-center gap-1.5 rounded-[14px] py-3 text-[13px] font-semibold transition-colors",
						isActive(href) ? "bg-primary text-brand-dark" : "text-nav-foreground hover:bg-white/40",
					)}
				>
					<Icon className="size-[26px]" strokeWidth={2} />
					{label}
				</Link>
			))}
		</nav>
	);
}

/** Barra inferior en móvil (según pantallas Movil*). */
export function BottomNav() {
	const isActive = useIsActive();
	return (
		<nav
			aria-label="Principal"
			className="fixed inset-x-0 bottom-0 z-40 grid grid-cols-4 border-t border-[#F0C58F] bg-nav pb-[env(safe-area-inset-bottom,0px)] md:hidden"
		>
			{NAV_ITEMS.map(({ href, label, icon: Icon }) => (
				<Link
					key={href}
					href={href}
					aria-current={isActive(href) ? "page" : undefined}
					className={cn(
						"flex h-[72px] flex-col items-center justify-center gap-1 text-xs font-bold",
						isActive(href) ? "text-brand-dark" : "text-nav-foreground",
					)}
				>
					<span className={cn("flex h-8 w-14 items-center justify-center rounded-full", isActive(href) && "bg-primary")}>
						<Icon className="size-[22px]" />
					</span>
					{label}
				</Link>
			))}
		</nav>
	);
}
