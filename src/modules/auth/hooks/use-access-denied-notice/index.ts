import { useEffect, useRef } from "react";

import { useTranslate } from "@lib/i18n";
import { useToast } from "@lib/ui";

/**
 * Shows a one-time "you don't have access" toast after a role guard sent the
 * user away (`reason=forbidden`), then calls `onShown` so the caller can drop
 * the reason from the URL.
 */
export function useAccessDeniedNotice(denied: boolean, onShown: () => void) {
	const t = useTranslate("auth");
	const { toast } = useToast();
	const shown = useRef(false);

	useEffect(() => {
		if (!denied || shown.current) {
			return;
		}

		shown.current = true;
		toast({
			title: t("accessDenied.title"),
			description: t("accessDenied.description"),
			color: "warning",
		});
		onShown();
	}, [denied, onShown, t, toast]);
}
