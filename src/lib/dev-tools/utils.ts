/**
 * Whether the dev tools render: outside production unless
 * `VITE_DISABLE_DEV_TOOLS` is `"true"` (env values are strings). Lets the
 * layout reserve room for their floating buttons.
 */
export function areDevToolsEnabled() {
	return (
		!import.meta.env.PROD && import.meta.env.VITE_DISABLE_DEV_TOOLS !== "true"
	);
}
