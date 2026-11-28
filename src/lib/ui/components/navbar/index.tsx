import type { JSX, MouseEvent, ReactNode } from "react";

import { ListIcon, XIcon } from "@phosphor-icons/react";
import { useEffect, useId, useRef, useState } from "react";

import { styles } from "./styles";

export interface NavbarProps {
	/** The app name, usually a link home. Rendered on one line, not a heading. */
	brand: ReactNode;
	/** Navigation links, e.g. `NavLink`s. Collapsed behind a menu below `md`. */
	children?: ReactNode;
	/** Always-visible controls on the right, e.g. an account menu. */
	actions?: ReactNode;
	/** Accessible name of the navigation landmark. */
	navLabel: string;
	/** Accessible name of the menu toggle shown below `md`. */
	menuLabel: string;
	className?: string;
}

/**
 * The app bar: brand on the left, navigation links and actions on the right.
 * Below `md` the links collapse behind a toggle; the menu closes on Escape
 * (returning focus to the toggle) and when one of its links is followed.
 */
export function Navbar({
	brand,
	children,
	actions,
	navLabel,
	menuLabel,
	className,
}: NavbarProps): JSX.Element {
	const [open, setOpen] = useState(false);
	const panelId = useId();
	const toggleRef = useRef<HTMLButtonElement>(null);
	const {
		root,
		bar,
		brand: brandSlot,
		nav,
		actions: actionsSlot,
		toggle,
		panel,
	} = styles();

	useEffect(() => {
		if (!open) {
			return;
		}

		function handleKeyDown(event: KeyboardEvent) {
			if (event.key === "Escape") {
				setOpen(false);
				toggleRef.current?.focus();
			}
		}

		document.addEventListener("keydown", handleKeyDown);

		return () => document.removeEventListener("keydown", handleKeyDown);
	}, [open]);

	function handlePanelClick(event: MouseEvent<HTMLElement>) {
		if ((event.target as HTMLElement).closest("a")) {
			setOpen(false);
		}
	}

	return (
		<header className={root({ className })}>
			<div className={bar()}>
				<div className={brandSlot()}>{brand}</div>
				<nav aria-label={navLabel} className={nav()}>
					{children}
				</nav>
				<div className={actionsSlot()}>
					{actions}
					<button
						ref={toggleRef}
						type="button"
						aria-label={menuLabel}
						aria-expanded={open}
						aria-controls={panelId}
						onClick={() => setOpen((value) => !value)}
						className={toggle()}
					>
						{open ? (
							<XIcon aria-hidden="true" size={20} />
						) : (
							<ListIcon aria-hidden="true" size={20} />
						)}
					</button>
				</div>
			</div>
			{open && (
				<nav
					id={panelId}
					aria-label={navLabel}
					className={panel()}
					onClick={handlePanelClick}
				>
					{children}
				</nav>
			)}
		</header>
	);
}
