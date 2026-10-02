"use client";

import { useEffect, useMemo } from "react";
import { useActiveSessionStore } from "../store/active-session.store";
import { useOpenCashSessions } from "./use-cash-registers";

/**
 * Caja activa para vender en este equipo. Si la guardada ya no está abierta,
 * toma la primera caja abierta disponible.
 */
export function useActiveSession() {
	const { data: openSessions = [], isLoading } = useOpenCashSessions();
	const { sessionId, setSessionId } = useActiveSessionStore();

	const session = useMemo(
		() => openSessions.find((s) => s.id === sessionId) ?? openSessions[0] ?? null,
		[openSessions, sessionId],
	);

	useEffect(() => {
		if (!isLoading && session?.id !== sessionId) setSessionId(session?.id ?? null);
	}, [isLoading, session, sessionId, setSessionId]);

	return { session, openSessions, isLoading, selectSession: setSessionId };
}
