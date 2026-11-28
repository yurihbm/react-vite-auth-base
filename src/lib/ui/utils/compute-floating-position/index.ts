import type { CSSProperties } from "react";

export interface ComputeFloatingPositionOptions {
	gap?: number;
	edgePadding?: number;
	/**
	 * Size the floating element to exactly match the trigger's width instead of
	 * clamping its own measured (or fallback) width inside the viewport.
	 */
	matchTriggerWidth?: boolean;
	/**
	 * Width estimate used before the floating element has rendered. Ignored when
	 * `matchTriggerWidth` is set.
	 */
	fallbackWidth?: number;
}

const DEFAULT_GAP = 4;
const DEFAULT_EDGE_PADDING = 8;
const DEFAULT_FALLBACK_WIDTH = 240;

/**
 * Computes a `position: fixed` style anchoring a floating element (dropdown
 * panel, popover, menu) to its trigger — flipping above when there's more room
 * there than below, and clamping horizontally to stay inside the viewport.
 * Shared by hooks backing portaled floating UI so the flip/clamp math lives in
 * one place.
 */
export function computeFloatingPosition(
	trigger: HTMLElement,
	content: HTMLElement | null,
	options: ComputeFloatingPositionOptions = {},
): CSSProperties {
	const {
		gap = DEFAULT_GAP,
		edgePadding = DEFAULT_EDGE_PADDING,
		matchTriggerWidth = false,
		fallbackWidth = DEFAULT_FALLBACK_WIDTH,
	} = options;

	const rect = trigger.getBoundingClientRect();
	const vw = window.innerWidth;
	const vh = window.innerHeight;

	const contentWidth = matchTriggerWidth
		? rect.width
		: content?.offsetWidth || fallbackWidth;
	const contentHeight = content?.offsetHeight || 0;

	const left = matchTriggerWidth
		? rect.left
		: Math.max(
				edgePadding,
				Math.min(rect.left, vw - contentWidth - edgePadding),
			);

	const spaceBelow = vh - rect.bottom - gap;
	const spaceAbove = rect.top - gap;

	const base: CSSProperties = {
		position: "fixed",
		left,
		...(matchTriggerWidth
			? { width: rect.width }
			: { maxWidth: vw - 2 * edgePadding }),
	};

	// Flip above the trigger when there is more space above than below.
	if (content && contentHeight > spaceBelow && spaceAbove > spaceBelow) {
		return { ...base, bottom: vh - rect.top + gap };
	}

	return { ...base, top: rect.bottom + gap };
}
