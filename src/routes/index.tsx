import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";

import { useAuth } from "@src/modules/auth";

import { Button, TextInput } from "../modules/shared";

export const Route = createFileRoute("/")({
	component: Index,
});

function Index() {
	const { isAuthenticated } = useAuth();
	const [count, setCount] = useState(0);
	const [text, setText] = useState("");

	return (
		<div className="mx-auto flex max-w-96 flex-col gap-4">
			<TextInput
				label="Write something"
				placeholder="Type here..."
				value={text}
				onChange={({ target }) => setText(target.value)}
				message={`Text length: ${text.length}`}
			/>
			<Button className="w-full" onClick={() => setCount((c) => c + 1)}>
				Count: {count}
			</Button>

			{isAuthenticated && (
				<Button
					color="secondary"
					as={Link}
					to="/users/profile"
					className="w-full"
				>
					Go to Profile
				</Button>
			)}
		</div>
	);
}
