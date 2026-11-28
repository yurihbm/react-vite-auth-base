import { writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";

import lighthouse from "lighthouse";
import open from "open";
import { chromium } from "playwright";
import { build, preview } from "vite";

const CDP_PORT = 9222;
const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
const REPORT_PATH = join(tmpdir(), `lighthouse-report-${timestamp}.html`);

await build({ logLevel: "warn" });

const server = await preview({ preview: { port: 3000 } });
const [url] = server.resolvedUrls.local;

const browser = await chromium.launch({
	args: [`--remote-debugging-port=${CDP_PORT}`],
});

try {
	const { report } = await lighthouse(url, {
		port: CDP_PORT,
		output: "html",
		logLevel: "info",
	});

	await writeFile(REPORT_PATH, report);
} finally {
	await browser.close();
	await new Promise((resolve, reject) =>
		server.httpServer.close((error) => (error ? reject(error) : resolve())),
	);
}

await open(REPORT_PATH);
