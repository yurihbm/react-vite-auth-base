import { createFileRoute, useNavigate } from "@tanstack/react-router";

import { Container } from "@lib/ui";
import { UserDetail } from "@modules/users";

export const Route = createFileRoute(
	"/_authenticated/_admin/admin/users/$uuid",
)({
	component: UserComponent,
});

const { useParams } = Route;

function UserComponent() {
	const { uuid } = useParams();
	const navigate = useNavigate();

	return (
		<Container className="py-6">
			<UserDetail
				uuid={uuid}
				onDeleted={() => navigate({ to: "/admin/users", search: {} })}
			/>
		</Container>
	);
}
