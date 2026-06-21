import { cleanup, render, within } from "@testing-library/react";
import { afterEach, describe, expect, test } from "vitest";

import { useDialogStack } from ".";

export function Harness({ open }: { open: boolean }) {
	const { index, isTop } = useDialogStack(open);
	return (
		<output>
			{index},{String(isTop)}
		</output>
	);
}

describe("useDialogStack", () => {
	afterEach(() => {
		cleanup();
	});

	test("returns index -1 and isTop false while closed", () => {
		const { getByRole } = render(<Harness open={false} />);

		expect(getByRole("status").textContent).toBe("-1,false");
	});

	test("only the latest opened dialog is the top of the stack", () => {
		const first = render(<Harness open />);
		const second = render(<Harness open />);

		expect(within(first.container).getByRole("status").textContent).toBe(
			"0,false",
		);
		expect(within(second.container).getByRole("status").textContent).toBe(
			"1,true",
		);
	});

	test("closing the top dialog promotes the next one to top", () => {
		const first = render(<Harness open />);
		const second = render(<Harness open />);
		second.unmount();

		expect(within(first.container).getByRole("status").textContent).toBe(
			"0,true",
		);
	});

	test("closing a dialog frees its position for the next one opened", () => {
		const first = render(<Harness open />);
		first.unmount();

		const second = render(<Harness open />);

		expect(within(second.container).getByRole("status").textContent).toBe(
			"0,true",
		);
	});
});
