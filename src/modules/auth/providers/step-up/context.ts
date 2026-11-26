import { createContext, useContext } from "react";

/** Rejection of `requestStepUp` when the user closes the step-up dialog. */
export class StepUpCancelledError extends Error {
	constructor() {
		super("Step-up cancelled");
		this.name = "StepUpCancelledError";
	}
}

interface StepUpContextValue {
	/**
	 * Asks the user to confirm their identity with an emailed code. Resolves once
	 * the session is elevated; rejects with `StepUpCancelledError` when the user
	 * closes the dialog, or with the `APIError` that ended the flow.
	 */
	requestStepUp: () => Promise<void>;
}

export const StepUpContext = createContext<StepUpContextValue | null>(null);

/** Access `requestStepUp`. Must be used within a `StepUpProvider`. */
export function useStepUp(): StepUpContextValue {
	const context = useContext(StepUpContext);

	if (!context) {
		throw new Error("useStepUp must be used within a StepUpProvider.");
	}

	return context;
}
