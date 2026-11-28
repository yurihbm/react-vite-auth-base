import type { Icon } from "@phosphor-icons/react";

import {
	ListChecksIcon,
	ShieldCheckIcon,
	UserCircleIcon,
	UsersIcon,
} from "@phosphor-icons/react";
import { Link } from "@tanstack/react-router";

import { useTranslate } from "@lib/i18n";
import {
	Card,
	CardGrid,
	Container,
	Heading,
	Inline,
	PageHeader,
	Text,
} from "@lib/ui";
import { useAuth } from "@modules/auth";
import { ButtonLink } from "@modules/shared";

import { styles } from "./styles";

type ShortcutKey = "account" | "security" | "users" | "auditLogs";

const SHORTCUTS: Record<ShortcutKey, { to: string; icon: Icon }> = {
	account: { to: "/account", icon: UserCircleIcon },
	security: { to: "/account/security", icon: ShieldCheckIcon },
	users: { to: "/admin/users", icon: UsersIcon },
	auditLogs: { to: "/admin/audit-logs", icon: ListChecksIcon },
};

/**
 * The home page: a short pitch with log in and sign up for visitors, and a
 * welcome with shortcuts (plus the admin pages for admins) once signed in.
 */
export function HomePage() {
	const t = useTranslate("home");
	const { user } = useAuth();
	const {
		guest,
		guestText,
		user: userSlot,
		shortcut,
		shortcutCard,
		shortcutBody,
		shortcutIcon,
		shortcutText,
	} = styles();

	if (!user) {
		return (
			<Container className={guest()}>
				<div className={guestText()}>
					<Heading level={1} size="xl">
						{t("guest.title")}
					</Heading>
					<Text variant="muted">{t("guest.description")}</Text>
				</div>
				<Inline className="justify-center">
					<ButtonLink to="/login" search={{ redirect: "/" }}>
						{t("guest.logIn")}
					</ButtonLink>
					<ButtonLink
						to="/register"
						search={{ redirect: "/" }}
						variant="outline"
					>
						{t("guest.createAccount")}
					</ButtonLink>
				</Inline>
			</Container>
		);
	}

	const keys: ShortcutKey[] =
		user.role === "admin"
			? ["account", "security", "users", "auditLogs"]
			: ["account", "security"];

	return (
		<Container className={userSlot()}>
			<PageHeader
				title={t("user.title", { name: user.name })}
				description={t("user.description")}
			/>
			<CardGrid>
				{keys.map((key) => {
					const { to, icon: ShortcutIcon } = SHORTCUTS[key];

					return (
						<Link key={key} to={to} className={shortcut()}>
							<Card
								className={shortcutCard()}
								classNames={{ body: shortcutBody() }}
							>
								<ShortcutIcon
									aria-hidden="true"
									className={shortcutIcon()}
									size={24}
								/>
								<div className={shortcutText()}>
									<Heading level={2} size="sm">
										{t(`shortcuts.${key}.title`)}
									</Heading>
									<Text variant="muted">
										{t(`shortcuts.${key}.description`)}
									</Text>
								</div>
							</Card>
						</Link>
					);
				})}
			</CardGrid>
		</Container>
	);
}
