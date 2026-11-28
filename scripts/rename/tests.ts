import fs from "node:fs";
import os from "node:os";
import path from "node:path";

import { afterEach, beforeEach, describe, expect, test } from "vitest";

import { rename } from "./rename.ts";

const REPO_ROOT = path.resolve(import.meta.dirname, "../..");
const FILES = [
	"package.json",
	"index.html",
	"vite.config.ts",
	"README.md",
	"CONTRIBUTING.md",
	"AGENTS.md",
	"src/routes/__root.tsx",
];

const OPTIONS = {
	name: "acme-app",
	title: "Acme App",
	shortName: "Acme",
	description: "The Acme web app.",
};

describe("rename", () => {
	let root: string;

	const read = (file: string) =>
		fs.readFileSync(path.join(root, file), "utf-8");

	beforeEach(() => {
		root = fs.mkdtempSync(path.join(os.tmpdir(), "rename-"));
		for (const file of FILES) {
			fs.mkdirSync(path.dirname(path.join(root, file)), { recursive: true });
			fs.copyFileSync(path.join(REPO_ROOT, file), path.join(root, file));
		}
	});

	afterEach(() => {
		fs.rmSync(root, { recursive: true, force: true });
	});

	test("rewrites the app name in every file", () => {
		const changed = rename(root, OPTIONS);

		expect(changed.toSorted()).toEqual(FILES.toSorted());
		expect(JSON.parse(read("package.json")).name).toBe("acme-app");
		expect(read("index.html")).toContain("<title>Acme App</title>");
		expect(read("vite.config.ts")).toContain('const APP_NAME = "Acme App";');
		expect(read("vite.config.ts")).toContain('const APP_SHORT_NAME = "Acme";');
		expect(read("vite.config.ts")).toContain(
			'const APP_DESCRIPTION = "The Acme web app.";',
		);
		expect(read("README.md")).toMatch(/^# Acme App$/m);
		expect(read("README.md")).toContain("cd acme-app");
		expect(read("CONTRIBUTING.md")).toMatch(/^# Contributing to Acme App$/m);
		expect(read("AGENTS.md")).toContain("operating in `acme-app`");
		expect(read("src/routes/__root.tsx")).toContain(
			'<Link to="/">Acme App</Link>',
		);
	});

	test("keeps the backend template name untouched", () => {
		rename(root, OPTIONS);

		expect(read("README.md")).toContain("[Go net/http Auth Base]");
	});

	test("leaves short name and description when omitted", () => {
		rename(root, { name: "acme-app", title: "Acme App" });

		expect(read("vite.config.ts")).toContain(
			'const APP_SHORT_NAME = "Auth Base";',
		);
	});

	test("keeps dollar signs in the title literal", () => {
		rename(root, { ...OPTIONS, title: "Pay $& Go" });

		expect(read("index.html")).toContain("<title>Pay $&amp; Go</title>");
		expect(read("README.md")).toMatch(/^# Pay \$& Go$/m);
	});

	test("is idempotent", () => {
		rename(root, OPTIONS);

		expect(rename(root, OPTIONS)).toEqual([]);
	});

	test("rejects an invalid name", () => {
		expect(() => rename(root, { ...OPTIONS, name: "Acme App" })).toThrow(
			"invalid name",
		);
	});

	test("rejects quotes in the description", () => {
		expect(() => rename(root, { ...OPTIONS, description: 'say "hi"' })).toThrow(
			"quotes",
		);
	});

	test.each(['Acme "App"', "Acme \\ App"])(
		"rejects quotes in the title (%s)",
		(title) => {
			expect(() => rename(root, { ...OPTIONS, title })).toThrow("quotes");
		},
	);

	test("fails when a file is missing", () => {
		fs.rmSync(path.join(root, "index.html"));

		expect(() => rename(root, OPTIONS)).toThrow("index.html not found");
	});
});
