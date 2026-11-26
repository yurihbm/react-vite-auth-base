interface ViteTypeOptions {
	strictImportMetaEnv: unknown;
}

interface ImportMetaEnv {
	readonly VITE_API_BASE_URL: string;
	readonly VITE_DISABLE_DEV_TOOLS: boolean;
}

interface ImportMeta {
	readonly env: ImportMetaEnv;
}
