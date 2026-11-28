/**
 * Formats a document (tab) title as "Page | App", or just the app name when
 * there is no page title.
 */
export function formatDocumentTitle(page: string | undefined, app: string) {
	const trimmed = page?.trim();

	return trimmed ? `${trimmed} | ${app}` : app;
}
