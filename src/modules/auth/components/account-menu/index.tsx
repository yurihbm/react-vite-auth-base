import { CaretDownIcon } from "@phosphor-icons/react";
import { useNavigate } from "@tanstack/react-router";

import { useTranslate } from "@lib/i18n";
import { Avatar, DropdownMenu } from "@lib/ui";
import { useAuth } from "@modules/auth/hooks";
import { useLogout } from "@modules/auth/services";

import { styles } from "./styles";

/**
 * The signed-in user's menu in the app bar: their avatar and name, with links
 * to the account page and to log out. Renders nothing when signed out.
 */
export function AccountMenu() {
	const t = useTranslate("auth");
	const { user } = useAuth();
	const { mutate: logout, isPending } = useLogout();
	const navigate = useNavigate();
	const { trigger, name } = styles();

	if (!user) {
		return null;
	}

	function handleLogout() {
		logout(undefined, {
			onSuccess: () => {
				navigate({ to: "/" });
			},
		});
	}

	return (
		<DropdownMenu>
			<DropdownMenu.Trigger asChild>
				<button type="button" className={trigger()}>
					<Avatar name={user.name} size="sm" />
					<span className={name()}>{user.name}</span>
					<span className="sr-only">{t("accountMenu.trigger")}</span>
					<CaretDownIcon aria-hidden="true" size={14} />
				</button>
			</DropdownMenu.Trigger>
			<DropdownMenu.Item onSelect={() => navigate({ to: "/account" })}>
				{t("accountMenu.account")}
			</DropdownMenu.Item>
			<DropdownMenu.Separator />
			<DropdownMenu.Item disabled={isPending} onSelect={handleLogout}>
				{t("accountMenu.logout")}
			</DropdownMenu.Item>
		</DropdownMenu>
	);
}
