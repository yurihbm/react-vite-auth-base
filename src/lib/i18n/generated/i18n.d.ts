import { DEFAULT_NAMESPACE } from "@src/lib/i18n";

import Resources from "./resources";

declare module "i18next" {
	interface CustomTypeOptions {
		enableSelector: false;
		defaultNS: typeof DEFAULT_NAMESPACE;
		resources: Resources;
	}
}
