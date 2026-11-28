import {
	act,
	cleanup,
	fireEvent,
	render,
	screen,
} from "@testing-library/react";
import { useState } from "react";
import { afterEach, describe, expect, test } from "vitest";

import { useFocusFirstInvalid } from ".";

function TestForm({ invalid }: { invalid: string[] }) {
	const { ref, focusFirstInvalid } = useFocusFirstInvalid<HTMLFormElement>();
	const [errors, setErrors] = useState<string[]>([]);

	return (
		<form
			ref={ref}
			onSubmit={(event) => {
				event.preventDefault();
				setErrors(invalid);
				focusFirstInvalid();
			}}
		>
			{["first", "second", "third"].map((name) => (
				<input
					key={name}
					aria-invalid={errors.includes(name)}
					aria-label={name}
				/>
			))}
			<button type="submit">Submit</button>
		</form>
	);
}

describe("useFocusFirstInvalid", () => {
	afterEach(() => {
		cleanup();
	});

	test("focuses the first field marked invalid once the errors render", () => {
		render(<TestForm invalid={["second", "third"]} />);

		act(() => {
			fireEvent.submit(screen.getByRole("button", { name: "Submit" }));
		});

		expect(document.activeElement).toBe(
			screen.getByRole("textbox", { name: "second" }),
		);
	});

	test("leaves focus alone when no field is invalid", () => {
		render(<TestForm invalid={[]} />);

		const submit = screen.getByRole("button", { name: "Submit" });
		submit.focus();

		act(() => {
			fireEvent.submit(submit);
		});

		expect(document.activeElement).toBe(submit);
	});

	test("focuses again on every failed attempt", () => {
		render(<TestForm invalid={["first"]} />);

		const first = screen.getByRole("textbox", { name: "first" });
		const submit = screen.getByRole("button", { name: "Submit" });

		act(() => {
			fireEvent.submit(submit);
		});
		submit.focus();
		act(() => {
			fireEvent.submit(submit);
		});

		expect(document.activeElement).toBe(first);
	});
});
