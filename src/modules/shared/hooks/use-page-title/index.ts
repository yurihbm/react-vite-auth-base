import { formatDocumentTitle, useDocumentTitle } from "@lib/ui";

/**
 * Titles the browser tab "Page | App" for the current page. The app name comes
 * from `APP_NAME` in `vite.config.ts`.
 */
export function usePageTitle(page: string | undefined) {
	useDocumentTitle(formatDocumentTitle(page, import.meta.env.VITE_APP_NAME));
}
