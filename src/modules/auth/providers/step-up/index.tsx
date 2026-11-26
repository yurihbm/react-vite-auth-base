import type { PropsWithChildren } from "react";

import { useQueryClient } from "@tanstack/react-query";
import { useRouter } from "@tanstack/react-router";
import { useCallback, useMemo, useRef, useState } from "react";

import { APIError } from "@lib/api";
import { StepUpDialog } from "@modules/auth/components/step-up-dialog";
import { useCooldown } from "@modules/auth/hooks/use-cooldown";
import { useRequestStepUp, useVerifyStepUp } from "@modules/auth/services";
import { handleSessionExpired } from "@modules/auth/utils/session-expired";

import { StepUpCancelledError, StepUpContext } from "./context";

const SESSION_REVOKED_KEY = "auth.stepUp.sessionRevoked";

/** 401 keys the user recovers from in the dialog (retype or resend). */
const RECOVERABLE_KEYS = new Set([
	"auth.stepUp.invalidCode",
	"auth.stepUp.noChallenge",
]);

/**
 * Whether an error ends the step-up: any other 401 means the session is gone
 * (revoked, invalid, or expired after a failed refresh).
 */
function endsStepUp(error: unknown): error is APIError {
	return (
		error instanceof APIError &&
		error.status === 401 &&
		!RECOVERABLE_KEYS.has(error.key)
	);
}

interface Deferred {
	promise: Promise<void>;
	resolve: () => void;
	reject: (reason: unknown) => void;
}

function createDeferred(): Deferred {
	let resolve!: () => void;
	let reject!: (reason: unknown) => void;
	const promise = new Promise<void>((res, rej) => {
		resolve = res;
		reject = rej;
	});

	return { promise, resolve, reject };
}

/**
 * StepUpProvider exposes `requestStepUp` and renders the dialog that emails a
 * code and checks it. Mount it inside the router and query client providers.
 */
export function StepUpProvider({ children }: PropsWithChildren) {
	const queryClient = useQueryClient();
	const router = useRouter();

	const [open, setOpen] = useState(false);
	const deferredRef = useRef<Deferred | null>(null);

	const requestCode = useRequestStepUp();
	const verifyCode = useVerifyStepUp();
	const cooldown = useCooldown(requestCode.error);

	function sendCode() {
		requestCode.mutate(undefined, {
			onSuccess: () => cooldown.start(),
			onError: (error) => {
				if (endsStepUp(error)) {
					settle({ error });
				}
			},
		});
	}

	function settle(outcome: { error?: unknown }) {
		const deferred = deferredRef.current;

		deferredRef.current = null;
		setOpen(false);
		requestCode.reset();
		verifyCode.reset();

		if (outcome.error) {
			deferred?.reject(outcome.error);
			return;
		}

		deferred?.resolve();
	}

	function handleSubmit(code: string) {
		verifyCode.mutate(
			{ code },
			{
				onSuccess: () => settle({}),
				onError: (error) => {
					if (!endsStepUp(error)) {
						return;
					}

					if (error.key === SESSION_REVOKED_KEY) {
						handleSessionExpired(queryClient, router);
					}
					settle({ error });
				},
			},
		);
	}

	const requestStepUp = useCallback(() => {
		// Concurrent requests share one dialog.
		if (deferredRef.current) {
			return deferredRef.current.promise;
		}

		deferredRef.current = createDeferred();
		setOpen(true);
		sendCode();

		return deferredRef.current.promise;
		// oxlint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	const value = useMemo(() => ({ requestStepUp }), [requestStepUp]);

	return (
		<StepUpContext.Provider value={value}>
			{children}
			<StepUpDialog
				open={open}
				isSending={requestCode.isPending}
				isVerifying={verifyCode.isPending}
				sendError={requestCode.error}
				verifyError={verifyCode.error}
				resendIn={cooldown.remaining}
				onSubmit={handleSubmit}
				onResend={sendCode}
				onCancel={() => settle({ error: new StepUpCancelledError() })}
			/>
		</StepUpContext.Provider>
	);
}
