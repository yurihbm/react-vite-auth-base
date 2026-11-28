import type { OAuthProvider } from "@modules/auth/utils";
import type { Icon } from "@phosphor-icons/react";

import {
	GithubLogoIcon,
	GoogleLogoIcon,
	WindowsLogoIcon,
} from "@phosphor-icons/react";

import { useTranslate } from "@lib/i18n";
import { Button } from "@lib/ui";
import { base } from "@modules/auth/components/login-form/styles";
import { startOAuthLogin } from "@modules/auth/utils";

const PROVIDERS: OAuthProvider[] = ["google", "github", "microsoft"];

const PROVIDER_ICONS: Record<OAuthProvider, Icon> = {
	google: GoogleLogoIcon,
	github: GithubLogoIcon,
	microsoft: WindowsLogoIcon,
};

interface OAuthButtonsProps {
	redirectTo?: string;
}

/**
 * OAuthButtons renders one button per OAuth provider. Each one sends the
 * browser to the provider login and brings it back to `redirectTo` once signed
 * in.
 */
export function OAuthButtons({ redirectTo = "/" }: OAuthButtonsProps) {
	const t = useTranslate("auth");

	return (
		<div className={base()}>
			{PROVIDERS.map((provider) => {
				const ProviderIcon = PROVIDER_ICONS[provider];

				return (
					<Button
						key={provider}
						variant="outline"
						onClick={() => startOAuthLogin(provider, redirectTo)}
					>
						<ProviderIcon aria-hidden="true" size={20} />
						{t(`oauthButtons.${provider}`)}
					</Button>
				);
			})}
		</div>
	);
}
