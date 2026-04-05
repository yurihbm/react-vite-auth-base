import Resources from "./resources";

declare module "i18next" {
	interface CustomTypeOptions {
		enableSelector: false;
		defaultNS: "shared";
		resources: Resources;
	}
}
