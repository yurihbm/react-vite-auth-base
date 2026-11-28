import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useRouter } from "@tanstack/react-router";
import {
	act,
	cleanup,
	fireEvent,
	render,
	screen,
} from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";

import { jsonResponse, mockFetch } from "@lib/tests";
import {
	StepUpCancelledError,
	useStepUp,
} from "@modules/auth/providers/step-up/context";
import { handleSessionExpired } from "@modules/auth/utils/session-expired";

import { StepUpProvider } from ".";

vi.mock("@tanstack/react-router", () => ({
	useRouter: vi.fn(),
}));

vi.mock("@modules/auth/utils/session-expired", () => ({
	handleSessionExpired: vi.fn(),
}));

vi.mock("@lib/api", async (importOriginal) => ({
	...(await importOriginal<typeof import("@lib/api")>()),
	useApiErrorMessage: (error: unknown) =>
		error instanceof Error ? `translated:${error.message}` : "unknown",
}));

const SENT = jsonResponse({ message: "auth.stepUp.codeSent" }, 202);
const VERIFIED = jsonResponse({
	data: { step_up_until: 1_710_000_000 },
	message: "auth.stepUp.verified",
});

function error(key: string, status: number, headers = {}) {
	return jsonResponse({ error: key, message: "x" }, status, headers);
}

/** Calls `requestStepUp` on click and exposes how its promise settled. */
function Trigger({ onSettled }: { onSettled: (result: unknown) => void }) {
	const { requestStepUp } = useStepUp();

	return (
		<button
			type="button"
			onClick={() =>
				requestStepUp().then(
					() => onSettled("resolved"),
					(reason) => onSettled(reason),
				)
			}
		>
			trigger
		</button>
	);
}

function renderProvider() {
	const onSettled = vi.fn();
	const queryClient = new QueryClient();

	render(
		<QueryClientProvider client={queryClient}>
			<StepUpProvider>
				<Trigger onSettled={onSettled} />
			</StepUpProvider>
		</QueryClientProvider>,
	);

	return { onSettled, queryClient };
}

async function open() {
	await act(async () => {
		fireEvent.click(screen.getByRole("button", { name: "trigger" }));
	});
}

async function submit(code = "123456") {
	fireEvent.change(screen.getByLabelText("stepUpDialog.input.code.label"), {
		target: { value: code },
	});
	await act(async () => {
		fireEvent.click(
			screen.getByRole("button", { name: "stepUpDialog.submitButton" }),
		);
	});
}

describe("StepUpProvider", () => {
	const router = { state: {}, navigate: vi.fn() };

	beforeEach(() => {
		vi.stubEnv("VITE_API_BASE_URL", "http://localhost:8080");
		vi.mocked(useRouter).mockReturnValue(
			router as unknown as ReturnType<typeof useRouter>,
		);
	});

	afterEach(() => {
		cleanup();
		vi.clearAllMocks();
		vi.unstubAllEnvs();
		vi.unstubAllGlobals();
	});

	test("sends the code and opens the dialog when a step-up is requested", async () => {
		const fetchMock = mockFetch({ "POST /auth/step-up": SENT });
		renderProvider();

		expect(screen.queryByRole("dialog")).toBeNull();

		await open();

		expect(fetchMock.callsTo("POST /auth/step-up")).toHaveLength(1);
		expect(screen.getByRole("dialog")).toBeDefined();
	});

	test("resolves once the code is verified and closes the dialog", async () => {
		const fetchMock = mockFetch({
			"POST /auth/step-up": SENT,
			"POST /auth/step-up/verify": VERIFIED,
		});
		const { onSettled } = renderProvider();

		await open();
		await submit();

		const [call] = fetchMock.callsTo("POST /auth/step-up/verify");
		expect(JSON.parse(String(call.init.body))).toEqual({ code: "123456" });
		expect(onSettled).toHaveBeenCalledWith("resolved");
		await vi.waitFor(() => expect(screen.queryByRole("dialog")).toBeNull());
	});

	test("continues to code entry when a code was already sent (429 cooldown)", async () => {
		mockFetch({
			"POST /auth/step-up": error("auth.stepUp.cooldown", 429),
			"POST /auth/step-up/verify": VERIFIED,
		});
		const { onSettled } = renderProvider();

		await open();

		expect(screen.queryByText("translated:auth.stepUp.cooldown")).toBeNull();

		await submit();

		expect(onSettled).toHaveBeenCalledWith("resolved");
	});

	test("stays in the dialog on an invalid code", async () => {
		mockFetch({
			"POST /auth/step-up": SENT,
			"POST /auth/step-up/verify": error("auth.stepUp.invalidCode", 401),
		});
		const { onSettled } = renderProvider();

		await open();
		await submit("000000");

		expect(
			await screen.findByText("translated:auth.stepUp.invalidCode"),
		).toBeDefined();
		expect(screen.getByRole("dialog")).toBeDefined();
		expect(onSettled).not.toHaveBeenCalled();
	});

	test("aborts with the message when the user is locked", async () => {
		mockFetch({
			"POST /auth/step-up": SENT,
			"POST /auth/step-up/verify": error("auth.stepUp.userLocked", 429),
		});
		const { onSettled } = renderProvider();

		await open();
		await submit();

		expect(
			await screen.findByText("translated:auth.stepUp.userLocked"),
		).toBeDefined();
		expect(screen.queryByLabelText("stepUpDialog.input.code.label")).toBeNull();
		expect(onSettled).not.toHaveBeenCalled();
	});

	test("handles an expired session and rejects when the session was revoked", async () => {
		mockFetch({
			"POST /auth/step-up": SENT,
			"POST /auth/step-up/verify": error("auth.stepUp.sessionRevoked", 401),
		});
		const { onSettled, queryClient } = renderProvider();

		await open();
		await submit();

		expect(handleSessionExpired).toHaveBeenCalledWith(queryClient, router);
		expect(onSettled).toHaveBeenCalledWith(
			expect.objectContaining({ key: "auth.stepUp.sessionRevoked" }),
		);
		await vi.waitFor(() => expect(screen.queryByRole("dialog")).toBeNull());
	});

	test("rejects and closes when verifying fails because the session expired", async () => {
		mockFetch({
			"POST /auth/step-up": SENT,
			"POST /auth/step-up/verify": error("auth.unauthorized", 401),
			"POST /auth/refresh": error("auth.refresh.missingRefreshToken", 401),
		});
		const { onSettled } = renderProvider();

		await open();
		await submit();

		await vi.waitFor(() =>
			expect(onSettled).toHaveBeenCalledWith(
				expect.objectContaining({ key: "auth.unauthorized" }),
			),
		);
		await vi.waitFor(() => expect(screen.queryByRole("dialog")).toBeNull());
	});

	test("rejects and closes when the session expires while sending the code", async () => {
		mockFetch({
			"POST /auth/step-up": error("auth.unauthorized", 401),
			"POST /auth/refresh": error("auth.refresh.missingRefreshToken", 401),
		});
		const { onSettled } = renderProvider();

		await open();

		await vi.waitFor(() => expect(onSettled).toHaveBeenCalledTimes(1));
		await vi.waitFor(() => expect(screen.queryByRole("dialog")).toBeNull());
	});

	test("rejects and closes on another 401 from verify", async () => {
		mockFetch({
			"POST /auth/step-up": SENT,
			"POST /auth/step-up/verify": error("auth.invalidToken", 401),
		});
		const { onSettled } = renderProvider();

		await open();
		await submit();

		expect(onSettled).toHaveBeenCalledWith(
			expect.objectContaining({ key: "auth.invalidToken" }),
		);
		await vi.waitFor(() => expect(screen.queryByRole("dialog")).toBeNull());
	});

	test("stays in the dialog when the challenge expired", async () => {
		mockFetch({
			"POST /auth/step-up": SENT,
			"POST /auth/step-up/verify": error("auth.stepUp.noChallenge", 401),
		});
		const { onSettled } = renderProvider();

		await open();
		await submit();

		expect(
			await screen.findByText("translated:auth.stepUp.noChallenge"),
		).toBeDefined();
		expect(screen.getByRole("dialog")).toBeDefined();
		expect(onSettled).not.toHaveBeenCalled();
	});

	test("rejects with a cancellation when the dialog is closed", async () => {
		mockFetch({ "POST /auth/step-up": SENT });
		const { onSettled } = renderProvider();

		await open();
		await act(async () => {
			fireEvent.click(screen.getByRole("button", { name: "Close" }));
		});

		expect(onSettled).toHaveBeenCalledWith(expect.any(StepUpCancelledError));
		await vi.waitFor(() => expect(screen.queryByRole("dialog")).toBeNull());
	});

	test("resends the code", async () => {
		const fetchMock = mockFetch({ "POST /auth/step-up": SENT });
		renderProvider();

		await open();
		await act(async () => {
			fireEvent.click(
				screen.getByRole("button", { name: /resendButton\.(label|cooldown)/ }),
			);
		});

		// The initial send starts the cooldown, so resend is disabled until it ends.
		expect(fetchMock.callsTo("POST /auth/step-up")).toHaveLength(1);
	});
});
