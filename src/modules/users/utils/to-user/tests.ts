import { describe, expect, test } from "vitest";

import { toUser } from ".";

describe("toUser", () => {
	test("converts the API user, turning unix seconds into ISO dates", () => {
		expect(
			toUser({
				uuid: "6f1f7c52-6f0c-4a52-9a43-0a3a1c2f6b11",
				name: "John Doe",
				email: "john@doe.com",
				role: "user",
				created_at: 1_710_000_000,
				updated_at: 1_710_100_000,
			}),
		).toEqual({
			uuid: "6f1f7c52-6f0c-4a52-9a43-0a3a1c2f6b11",
			name: "John Doe",
			email: "john@doe.com",
			role: "user",
			createdAt: "2024-03-09T16:00:00.000Z",
			updatedAt: "2024-03-10T19:46:40.000Z",
		});
	});
});
