import type { OAuthProvider } from "@modules/auth/utils";

import { useTranslate } from "@lib/i18n";
import { Button } from "@lib/ui";
import { base } from "@modules/auth/components/login-form/styles";
import { startOAuthLogin } from "@modules/auth/utils";

const PROVIDERS: OAuthProvider[] = ["google", "github", "microsoft"];

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
			{PROVIDERS.map((provider) => (
				<Button
					key={provider}
					color="secondary"
					onClick={() => startOAuthLogin(provider, redirectTo)}
				>
					{t(`oauthButtons.${provider}`)}
				</Button>
			))}
		</div>
	);
}
