import { useEffect } from "react";

/**
 * Sets `document.title` while the calling component is mounted and restores the
 * previous title when it unmounts.
 */
export function useDocumentTitle(title: string) {
	useEffect(() => {
		const previous = document.title;
		document.title = title;

		return () => {
			document.title = previous;
		};
	}, [title]);
}
