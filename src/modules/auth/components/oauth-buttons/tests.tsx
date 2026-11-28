import { cleanup, fireEvent, render } from "@testing-library/react";
import { afterEach, describe, expect, test, vi } from "vitest";

import { startOAuthLogin } from "@modules/auth/utils";

import { OAuthButtons } from ".";

vi.mock("@modules/auth/utils", () => ({
	startOAuthLogin: vi.fn(),
}));

describe("OAuthButtons", () => {
	afterEach(() => {
		cleanup();
		vi.clearAllMocks();
	});

	test("renders correctly", () => {
		const { container } = render(<OAuthButtons />);

		expect(container).toMatchSnapshot();
	});

	test.each(["google", "github", "microsoft"] as const)(
		"starts the %s login with the redirect target",
		(provider) => {
			const { getByRole } = render(<OAuthButtons redirectTo="/dashboard" />);

			fireEvent.click(
				getByRole("button", { name: `oauthButtons.${provider}` }),
			);

			expect(startOAuthLogin).toHaveBeenCalledWith(provider, "/dashboard");
		},
	);

	test("redirects home by default", () => {
		const { getByRole } = render(<OAuthButtons />);

		fireEvent.click(getByRole("button", { name: "oauthButtons.google" }));

		expect(startOAuthLogin).toHaveBeenCalledWith("google", "/");
	});

	test("renders outline buttons with a decorative provider icon", () => {
		const { getByRole } = render(<OAuthButtons />);

		const button = getByRole("button", { name: "oauthButtons.github" });

		expect(button.className).toContain("border-border-control");
		expect(button.querySelector("svg")?.getAttribute("aria-hidden")).toBe(
			"true",
		);
	});
});
