import { useApiErrorMessage } from "@lib/api";
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
	/** Disables the action, e.g. when the link has no token. */
	isDisabled?: boolean;
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
	isDisabled = false,
	error,
}: RevertConfirmProps) {
	const apiErrorMessage = useApiErrorMessage(error);
	const cooldown = useCooldown(error);

	return (
		<div className={base()}>
			{isSuccess ? (
				<Alert color="success" description={successMessage} />
			) : (
				<>
					<p>{description}</p>
					{!!error && <Alert color="danger" description={apiErrorMessage} />}
					<Button
						disabled={isPending || isDisabled || cooldown.remaining > 0}
						onClick={onConfirm}
					>
						{confirmLabel}
					</Button>
				</>
			)}
		</div>
	);
}
