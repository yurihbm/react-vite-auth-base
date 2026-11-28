import fs from "node:fs";
import path from "node:path";
import process from "node:process";
import { parseArgs } from "node:util";

const USAGE =
	"Usage: node .claude/skills/api-service-scaffolder/scripts/scaffold.ts <ServiceName> --module <name> --kind <query|mutation> --path </endpoint> [--root <dir>]";

const { values, positionals } = parseArgs({
	allowPositionals: true,
	options: {
		module: { type: "string" },
		kind: { type: "string" },
		path: { type: "string" },
		root: { type: "string", default: process.cwd() },
	},
});

const Name = positionals[0];
if (
	!Name ||
	!/^[A-Z][A-Za-z0-9]*$/.test(Name) ||
	!values.module ||
	(values.kind !== "query" && values.kind !== "mutation") ||
	!values.path?.startsWith("/")
) {
	console.error(USAGE);
	console.error(
		"<ServiceName> must be PascalCase (e.g. ListSessions) and --path must start with /",
	);
	process.exit(1);
}

const name = Name.charAt(0).toLowerCase() + Name.slice(1);
const kebab = Name.replace(/([a-z0-9])([A-Z])/g, "$1-$2").toLowerCase();
const CONST = kebab.toUpperCase().replaceAll("-", "_");
const replacements: Record<string, string> = {
	Name,
	name,
	kebab,
	CONST,
	module: values.module,
	path: values.path,
};

const scope = path.join("src", "modules", values.module, "services");
const servicesDir = path.join(values.root, scope);
const barrelPath = path.join(servicesDir, "index.ts");
const targetDir = path.join(servicesDir, kebab);

if (!fs.existsSync(barrelPath)) {
	console.error(`Barrel not found: ${barrelPath}. Run from the project root.`);
	process.exit(1);
}
if (fs.existsSync(targetDir)) {
	console.error(`Already exists: ${targetDir}`);
	process.exit(1);
}

const templatesDir = path.join(import.meta.dirname, "..", "templates");
const render = (template: string) => {
	const content = fs.readFileSync(path.join(templatesDir, template), "utf-8");
	return content.replace(
		/{{(\w+)}}/g,
		(_, key: string) => replacements[key] as string,
	);
};

fs.mkdirSync(targetDir);
const prefix = values.kind;
fs.writeFileSync(path.join(targetDir, "index.ts"), render(`${prefix}.ts.txt`));
fs.writeFileSync(
	path.join(targetDir, "tests.ts"),
	render(`${prefix}-tests.ts.txt`),
);

// Insert the export in alphabetical position among the export statements.
const names =
	values.kind === "query"
		? `use${Name}, ${name}Key, ${CONST}_QUERY_OPTIONS`
		: `use${Name}, ${name}Key`;
const exportLine = `export { ${names} } from "./${kebab}";`;
const barrel = fs.readFileSync(barrelPath, "utf-8");
const statements = barrel.match(/^export[\s\S]*?;$/gm) ?? [];
if (statements.join("").replace(/\s/g, "") !== barrel.replace(/\s/g, "")) {
	console.error(
		`${barrelPath} has more than export statements; add the export by hand.`,
	);
	process.exit(1);
}
const fromPath = (statement: string) =>
	/from "\.\/([^"/]+)/.exec(statement)?.[1];
const next = statements.findIndex((statement) => {
	const other = fromPath(statement);
	return other !== undefined && other > kebab;
});
statements.splice(next === -1 ? statements.length : next, 0, exportLine);
fs.writeFileSync(barrelPath, `${statements.join("\n")}\n`);

console.log(`Created ${path.join(scope, kebab)}/ and exported it from ${path.join(scope, "index.ts")}.

Next steps:
- [ ] Replace the placeholder schema or body type, doc comments and test data with the real contract (see the backend docs)
- [ ] Move the schema to the module's schemas/ folder if other code shares it
- [ ] Invalidate or update queries in onSuccess if the mutation changes cached data
- [ ] pnpm lint && pnpm typecheck && pnpm test --project "unit/integration" ${path.join(scope, kebab, "tests.ts")}`);
