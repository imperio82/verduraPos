import type { Metadata, Viewport } from "next";
import { Bricolage_Grotesque, Figtree } from "next/font/google";
import { AppProviders } from "@/core/providers/app-providers";
import "./globals.css";

const figtree = Figtree({ variable: "--font-figtree", subsets: ["latin"] });
const bricolage = Bricolage_Grotesque({
	variable: "--font-bricolage",
	subsets: ["latin"],
	weight: ["600", "700", "800"],
});

export const metadata: Metadata = {
	title: { default: "Verdura POS", template: "%s · Verdura POS" },
	description: "Punto de venta para verdulería: ventas, cajas, contabilidad e inventario.",
};

export const viewport: Viewport = {
	themeColor: "#FFD8A8",
	width: "device-width",
	initialScale: 1,
	viewportFit: "cover",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
	return (
		<html lang="es">
			<body className={`${figtree.variable} ${bricolage.variable}`}>
				<AppProviders>{children}</AppProviders>
			</body>
		</html>
	);
}
