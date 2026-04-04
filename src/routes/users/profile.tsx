import { createFileRoute, useNavigate } from "@tanstack/react-router";

import { privateRouteBeforeLoad, useAuth, useLogout } from "@src/modules/auth";
import { Button } from "@src/modules/shared";

export const Route = createFileRoute("/users/profile")({
	component: ProfileComponent,
	beforeLoad: privateRouteBeforeLoad,
});

function ProfileComponent() {
	const { user } = useAuth<true>();
	const { mutate: logout, isPending } = useLogout();
	const navigate = useNavigate();

	function handleLogout() {
		logout(undefined, {
			onSuccess: () => {
				navigate({
					to: "/",
				});
			},
		});
	}

	return (
		<section className="mx-auto flex max-w-96 flex-col gap-4">
			<h2 className="text-lg font-bold">User Profile</h2>
			<pre className="overflow-x-auto rounded bg-background-elevated p-2">
				{JSON.stringify(user, null, 2)}
			</pre>
			<Button disabled={isPending} onClick={handleLogout}>
				Logout
			</Button>
		</section>
	);
}
