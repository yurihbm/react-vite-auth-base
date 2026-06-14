/**
 * Test helpers for components that rely on `@tanstack/react-virtual`.
 *
 * happy-dom reports zero-sized elements (`offsetWidth`/`offsetHeight` are 0),
 * so the virtualizer renders no rows. This helper gives elements a measurable
 * size while active. Not used in the app bundle — only imported from tests.
 */

const VIEWPORT_WIDTH = 250;
const VIEWPORT_HEIGHT = 300;

/**
 * Stubs `offsetWidth`/`offsetHeight` so the virtualizer measures a non-zero
 * scroll viewport under happy-dom. Returns a cleanup function to restore them.
 */
export function setupVirtualizerEnv(): () => void {
	const originalWidth = Object.getOwnPropertyDescriptor(
		HTMLElement.prototype,
		"offsetWidth",
	);
	const originalHeight = Object.getOwnPropertyDescriptor(
		HTMLElement.prototype,
		"offsetHeight",
	);

	Object.defineProperty(HTMLElement.prototype, "offsetWidth", {
		configurable: true,
		get() {
			return VIEWPORT_WIDTH;
		},
	});
	Object.defineProperty(HTMLElement.prototype, "offsetHeight", {
		configurable: true,
		get() {
			return VIEWPORT_HEIGHT;
		},
	});

	const prototype = HTMLElement.prototype as unknown as Record<string, unknown>;

	return () => {
		if (originalWidth) {
			Object.defineProperty(
				HTMLElement.prototype,
				"offsetWidth",
				originalWidth,
			);
		} else {
			delete prototype.offsetWidth;
		}

		if (originalHeight) {
			Object.defineProperty(
				HTMLElement.prototype,
				"offsetHeight",
				originalHeight,
			);
		} else {
			delete prototype.offsetHeight;
		}
	};
}
