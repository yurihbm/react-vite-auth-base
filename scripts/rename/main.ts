import { parseArgs } from "node:util";

import { rename } from "./rename.ts";

const USAGE =
	'Usage: pnpm rename --name <package-name> --title "<App Title>" [--short-name <name>] [--description <text>]';

const { values } = parseArgs({
	options: {
		name: { type: "string" },
		title: { type: "string" },
		"short-name": { type: "string" },
		description: { type: "string" },
	},
});

if (!values.name || !values.title) {
	console.error(USAGE);
	process.exit(1);
}

try {
	const changed = rename(process.cwd(), {
		name: values.name,
		title: values.title,
		shortName: values["short-name"],
		description: values.description,
	});

	console.log(
		changed.length > 0
			? `Updated:\n${changed.map((file) => `  ${file}`).join("\n")}`
			: "Nothing to change.",
	);
} catch (error) {
	console.error(error instanceof Error ? error.message : error);
	process.exit(1);
}
