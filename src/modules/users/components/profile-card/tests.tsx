import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";

import { useUpdateUser } from "@modules/users/services";

import { ProfileCard } from ".";

vi.mock("@modules/users/services", () => ({
	useUpdateUser: vi.fn(),
}));

const USER = {
	uuid: "6f1f7c52-6f0c-4a52-9a43-0a3a1c2f6b11",
	name: "John Doe",
	email: "john@doe.com",
	role: "admin" as const,
	createdAt: "2024-03-09T16:00:00.000Z",
	updatedAt: "2024-03-10T16:00:00.000Z",
};

describe("ProfileCard", () => {
	beforeEach(() => {
		vi.mocked(useUpdateUser).mockReturnValue({
			mutate: vi.fn(),
			isPending: false,
			isSuccess: false,
			error: null,
		} as unknown as ReturnType<typeof useUpdateUser>);
	});

	afterEach(() => {
		cleanup();
	});

	test("is a region titled by its h2", () => {
		render(<ProfileCard user={USER} />);

		expect(
			screen.getByRole("region", { name: "accountPage.profile.title" }),
		).toBeTruthy();
		expect(
			screen.getByRole("heading", {
				level: 2,
				name: "accountPage.profile.title",
			}),
		).toBeTruthy();
	});

	test("lists the email, role and member since date", () => {
		render(<ProfileCard user={USER} />);

		const terms = screen.getAllByRole("term").map((term) => term.textContent);
		const definitions = screen
			.getAllByRole("definition")
			.map((definition) => definition.textContent);

		expect(terms).toEqual([
			"accountPage.profile.email",
			"accountPage.profile.role",
			"accountPage.profile.memberSince",
		]);
		expect(definitions).toEqual([
			"john@doe.com",
			"admin",
			new Date(USER.createdAt).toLocaleDateString(),
		]);
	});

	test("edits the name inline", () => {
		render(<ProfileCard user={USER} />);

		expect(
			(
				screen.getByLabelText(
					"editNameForm.input.name.label",
				) as HTMLInputElement
			).value,
		).toBe("John Doe");
	});
});
