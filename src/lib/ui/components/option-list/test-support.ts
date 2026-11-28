/**
 * Test helpers for components that rely on `@tanstack/react-virtual`.
 *
 * Happy-dom reports zero-sized elements (`offset*`/`client*` sizes are 0), so
 * the virtualizer renders no rows. This helper gives elements a measurable size
 * while active. Not used in the app bundle — only imported from tests.
 */

const VIEWPORT_WIDTH = 250;
const VIEWPORT_HEIGHT = 300;

const SIZE_PROPERTIES = {
	offsetWidth: VIEWPORT_WIDTH,
	offsetHeight: VIEWPORT_HEIGHT,
	clientWidth: VIEWPORT_WIDTH,
	clientHeight: VIEWPORT_HEIGHT,
} as const;

/**
 * Stubs `offset*`/`client*` sizes so the virtualizer measures a non-zero scroll
 * viewport under happy-dom. Returns a cleanup function to restore them.
 */
export function setupVirtualizerEnv(): () => void {
	const prototype = HTMLElement.prototype as unknown as Record<string, unknown>;
	const originals = Object.keys(SIZE_PROPERTIES).map(
		(property) =>
			[
				property,
				Object.getOwnPropertyDescriptor(HTMLElement.prototype, property),
			] as const,
	);

	for (const [property, value] of Object.entries(SIZE_PROPERTIES)) {
		Object.defineProperty(HTMLElement.prototype, property, {
			configurable: true,
			get() {
				return value;
			},
		});
	}

	return () => {
		for (const [property, original] of originals) {
			if (original) {
				Object.defineProperty(HTMLElement.prototype, property, original);
			} else {
				delete prototype[property];
			}
		}
	};
}
