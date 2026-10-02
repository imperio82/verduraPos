"use client";

import { type QueryKey, useQueryClient } from "@tanstack/react-query";
import { useCallback } from "react";

/** Invalida varias consultas a la vez después de una mutación. */
export function useInvalidate() {
	const queryClient = useQueryClient();
	return useCallback(
		(keys: readonly QueryKey[]) =>
			Promise.all(keys.map((queryKey) => queryClient.invalidateQueries({ queryKey }))),
		[queryClient],
	);
}
