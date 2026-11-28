interface ViteTypeOptions {
	strictImportMetaEnv: unknown;
}

interface ImportMetaEnv {
	readonly VITE_API_BASE_URL: string;
	/** Defined from `APP_NAME` in `vite.config.ts`. */
	readonly VITE_APP_NAME: string;
	readonly VITE_DISABLE_DEV_TOOLS?: string;
}

interface ImportMeta {
	readonly env: ImportMetaEnv;
}
