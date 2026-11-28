import fs from "node:fs";
import path from "node:path";

export interface RenameOptions {
	/** Package name (lowercase slug). */
	name: string;
	/** Human-readable app name. */
	title: string;
	/** PWA short name, left unchanged when omitted. */
	shortName?: string;
	/** PWA description, left unchanged when omitted. */
	description?: string;
}

interface Edit {
	file: string;
	pattern: RegExp;
	replacement: (options: RenameOptions) => string | undefined;
}

const escapeHtml = (value: string) =>
	value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

const constant = (name: string, value: string | undefined) =>
	value === undefined ? undefined : `const ${name} = ${JSON.stringify(value)};`;

// Each pattern matches whatever the current value is, so running the tool
// again (or with new values) rewrites the same places. Replacements are
// functions' results used as literal text: `$` is escaped by `literal`.
const literal = (value: string) => value.replace(/\$/g, "$$$$");

const EDITS: Edit[] = [
	{
		file: "package.json",
		pattern: /^(\t"name": )"[^"]*"/m,
		replacement: ({ name }) => `$1${JSON.stringify(name)}`,
	},
	{
		file: "index.html",
		pattern: /<title>[^<]*<\/title>/,
		replacement: ({ title }) => `<title>${literal(escapeHtml(title))}</title>`,
	},
	{
		file: "vite.config.ts",
		pattern: /^const APP_NAME = "[^"]*";/m,
		replacement: ({ title }) => literalOrUndefined(constant("APP_NAME", title)),
	},
	{
		file: "vite.config.ts",
		pattern: /^const APP_SHORT_NAME = "[^"]*";/m,
		replacement: ({ shortName }) =>
			literalOrUndefined(constant("APP_SHORT_NAME", shortName)),
	},
	{
		file: "vite.config.ts",
		pattern: /^const APP_DESCRIPTION =\s*"[^"]*";/m,
		replacement: ({ description }) =>
			literalOrUndefined(constant("APP_DESCRIPTION", description)),
	},
	{
		file: "README.md",
		pattern: /^# .*/m,
		replacement: ({ title }) => `# ${literal(title)}`,
	},
	{
		file: "README.md",
		pattern: /^(\s+cd )[\w.-]+$/m,
		replacement: ({ name }) => `$1${name}`,
	},
	{
		file: "CONTRIBUTING.md",
		pattern: /^# Contributing to .*/m,
		replacement: ({ title }) => `# Contributing to ${literal(title)}`,
	},
	{
		file: "AGENTS.md",
		pattern: /^(Guide for coding agents operating in )`[^`]*`/m,
		replacement: ({ name }) => `$1\`${name}\``,
	},
	{
		file: "src/routes/__root.tsx",
		pattern: /(<h1 className="text-xl font-bold">)[^<]*(<\/h1>)/,
		replacement: ({ title }) => `$1${literal(title.replace(/[{}<>]/g, ""))}$2`,
	},
];

function literalOrUndefined(value: string | undefined) {
	return value === undefined ? undefined : literal(value);
}

/**
 * Rewrites the app name across the repository files under `root`.
 *
 * @returns The relative paths of the files that changed.
 */
export function rename(root: string, options: RenameOptions): string[] {
	if (!/^[a-z0-9][a-z0-9-]*$/.test(options.name)) {
		throw new Error(`invalid name "${options.name}": use a lowercase slug`);
	}
	if (!options.title.trim()) {
		throw new Error("title must not be empty");
	}
	// They are written inside double-quoted string literals.
	for (const value of [options.title, options.shortName, options.description]) {
		if (value?.includes('"') || value?.includes("\\")) {
			throw new Error(
				"title, short name and description must not contain quotes",
			);
		}
	}

	const contents = new Map<string, string>();
	const original = new Map<string, string>();

	for (const { file, pattern, replacement } of EDITS) {
		const next = replacement(options);
		if (next === undefined) {
			continue;
		}

		const filePath = path.join(root, file);
		if (!contents.has(file)) {
			if (!fs.existsSync(filePath)) {
				throw new Error(`${file} not found in ${root}`);
			}
			const text = fs.readFileSync(filePath, "utf-8");
			contents.set(file, text);
			original.set(file, text);
		}

		const text = contents.get(file) as string;
		if (!pattern.test(text)) {
			throw new Error(`${file}: pattern ${pattern} not found`);
		}
		contents.set(file, text.replace(pattern, next));
	}

	const changed: string[] = [];
	for (const [file, text] of contents) {
		if (text !== original.get(file)) {
			fs.writeFileSync(path.join(root, file), text);
			changed.push(file);
		}
	}

	return changed;
}
