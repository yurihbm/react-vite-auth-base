import fs from "node:fs";
import path from "node:path";
import process from "node:process";
import { parseArgs } from "node:util";

const USAGE =
	"Usage: node .claude/skills/react-component-scaffolder/scripts/scaffold.ts <ComponentName> [--module <name>] [--root <dir>]";

const { values, positionals } = parseArgs({
	allowPositionals: true,
	options: {
		module: { type: "string" },
		root: { type: "string", default: process.cwd() },
	},
});

const name = positionals[0];
if (!name || !/^[A-Z][A-Za-z0-9]*$/.test(name)) {
	console.error(USAGE);
	console.error("<ComponentName> must be PascalCase, e.g. StatusPill");
	process.exit(1);
}

const kebab = name.replace(/([a-z0-9])([A-Z])/g, "$1-$2").toLowerCase();
const scope = values.module
	? path.join("src", "modules", values.module, "components")
	: path.join("src", "lib", "ui", "components");
const alias = values.module ? `@modules/${values.module}` : "@lib/ui";

const componentsDir = path.join(values.root, scope);
const barrelPath = path.join(componentsDir, "index.ts");
const targetDir = path.join(componentsDir, kebab);

if (!fs.existsSync(barrelPath)) {
	console.error(`Barrel not found: ${barrelPath}. Run from the project root.`);
	process.exit(1);
}
if (fs.existsSync(targetDir)) {
	console.error(`Already exists: ${targetDir}`);
	process.exit(1);
}

const templatesDir = path.join(import.meta.dirname, "..", "templates");
fs.mkdirSync(targetDir);
for (const file of ["index.tsx", "styles.ts", "stories.tsx", "tests.tsx"]) {
	const template = fs.readFileSync(
		path.join(templatesDir, `${file}.txt`),
		"utf-8",
	);
	fs.writeFileSync(
		path.join(targetDir, file),
		template.replaceAll("{{Name}}", name),
	);
}

// Insert the export in alphabetical position among the `from "./x"` lines.
const exportLine = `export { ${name}, type ${name}Props } from "./${kebab}";`;
const lines = fs.readFileSync(barrelPath, "utf-8").trimEnd().split("\n");
const fromPath = (line: string) => /from "\.\/([^"/]+)/.exec(line)?.[1];
const next = lines.findIndex((line) => {
	const other = fromPath(line);
	return other !== undefined && other > kebab;
});
lines.splice(next === -1 ? lines.length : next, 0, exportLine);
fs.writeFileSync(barrelPath, `${lines.join("\n")}\n`);

console.log(`Created ${path.join(scope, kebab)}/ and exported it from ${path.join(scope, "index.ts")}.

Next steps:
- [ ] Replace the placeholder markup, variants and the TODO doc comment
- [ ] Update tests.tsx and stories.tsx to the real behavior
- [ ] Import it as \`import { ${name} } from "${alias}"\`
- [ ] pnpm lint && pnpm typecheck && pnpm test --project "unit/integration" ${path.join(scope, kebab, "tests.tsx")}`);
