import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";

import { useAuth } from "@src/modules/auth";

import { Button, TextInput } from "../modules/shared";

export const Route = createFileRoute("/")({
	component: Index,
});

function Index() {
	const { user, isPending, isAuthenticated } = useAuth();
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
			<section>
				<h2 className="text-lg font-bold">User Info</h2>
				{isPending && <p>Loading...</p>}
				{!isPending && !isAuthenticated && (
					<p className="text-danger">
						You are not authenticated. Please log in to see your user info.
					</p>
				)}
				{isAuthenticated && (
					<pre className="overflow-x-auto rounded bg-background-elevated p-4">
						{JSON.stringify(user, null, 2)}
					</pre>
				)}
			</section>
		</div>
	);
}
