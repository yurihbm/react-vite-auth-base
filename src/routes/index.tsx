import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";

import { useTranslate } from "@lib/i18n";
import { Button, TextInput } from "@lib/ui";
import { useAuth } from "@modules/auth";

export const Route = createFileRoute("/")({
	component: Index,
});

function Index() {
	const { isAuthenticated } = useAuth();
	const [count, setCount] = useState(0);
	const [text, setText] = useState("");

	const t = useTranslate("home");

	return (
		<div className="mx-auto flex max-w-96 flex-col gap-4">
			<TextInput
				label={t("input.label")}
				placeholder={t("input.placeholder")}
				value={text}
				onChange={({ target }) => setText(target.value)}
				message={`${t("input.message")}: ${text.length}`}
			/>
			<Button className="w-full" onClick={() => setCount((c) => c + 1)}>
				{t("count")}: {count}
			</Button>

			{isAuthenticated && (
				<Button
					color="secondary"
					as={Link}
					to="/users/profile"
					className="w-full"
				>
					{t("profile")}
				</Button>
			)}
		</div>
	);
}
