import { Link } from "@tanstack/react-router";

import { useApiErrorMessage } from "@lib/api";
import { useTranslate } from "@lib/i18n";
import { Alert, Button } from "@lib/ui";
import { base } from "@modules/auth/components/login-form/styles";
import { useCooldown } from "@modules/auth/hooks";

interface RevertConfirmProps {
	description: string;
	confirmLabel: string;
	successMessage: string;
	onConfirm: () => void;
	isPending?: boolean;
	isSuccess?: boolean;
	/** The link lacks its token: explain that instead of offering the action. */
	isLinkInvalid?: boolean;
	error?: unknown;
}

/**
 * RevertConfirm asks for an explicit click before undoing a change from an
 * emailed link, since mail scanners prefetch links and must not trigger it. The
 * page title belongs to the surrounding layout.
 */
export function RevertConfirm({
	description,
	confirmLabel,
	successMessage,
	onConfirm,
	isPending = false,
	isSuccess = false,
	isLinkInvalid = false,
	error,
}: RevertConfirmProps) {
	const t = useTranslate("auth");
	const apiErrorMessage = useApiErrorMessage(error);
	const cooldown = useCooldown(error);

	if (isLinkInvalid) {
		return (
			<div className={base()}>
				<Alert
					color="warning"
					title={t("revertLink.invalid.title")}
					description={t("revertLink.invalid.description")}
				/>
				<Link to="/" className="self-start text-sm underline">
					{t("revertLink.invalid.action")}
				</Link>
			</div>
		);
	}

	return (
		<div className={base()}>
			{isSuccess ? (
				<Alert color="success" description={successMessage} />
			) : (
				<>
					<p>{description}</p>
					{!!error && <Alert color="danger" description={apiErrorMessage} />}
					<Button
						disabled={isPending || cooldown.remaining > 0}
						onClick={onConfirm}
					>
						{confirmLabel}
					</Button>
				</>
			)}
		</div>
	);
}
