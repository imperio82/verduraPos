"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

interface ActiveSessionState {
	/** Sesión de caja sobre la que se registran las ventas en este equipo. */
	sessionId: string | null;
	setSessionId: (sessionId: string | null) => void;
}

export const useActiveSessionStore = create<ActiveSessionState>()(
	persist(
		(set) => ({
			sessionId: null,
			setSessionId: (sessionId) => set({ sessionId }),
		}),
		{ name: "verdura-pos:active-session" },
	),
);
