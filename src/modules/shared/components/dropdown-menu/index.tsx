import type {
	ReactElement,
	KeyboardEvent as ReactKeyboardEvent,
	ReactNode,
	Ref,
	RefCallback,
	RefObject,
} from "react";
import type { DropdownMenuItemVariants } from "./styles";

import {
	Children,
	cloneElement,
	createContext,
	isValidElement,
	useContext,
} from "react";

import { useDropdownMenu } from "@src/modules/shared/hooks/use-dropdown-menu";

import { Portal } from "../portal";
import { itemStyles, menuStyles, separatorStyles } from "./styles";

interface DropdownMenuContextValue {
	open: boolean;
	toggle: () => void;
	triggerRef: RefObject<HTMLElement | null>;
	handleTriggerKeyDown: (e: ReactKeyboardEvent<HTMLElement>) => void;
}

const DropdownMenuContext = createContext<DropdownMenuContextValue | null>(
	null,
);

function useDropdownMenuContext(): DropdownMenuContextValue {
	const ctx = useContext(DropdownMenuContext);
	if (!ctx)
		throw new Error(
			"DropdownMenu.Trigger must be rendered inside DropdownMenu",
		);
	return ctx;
}

export interface DropdownMenuProps {
	children: ReactNode;
	className?: string;
}

export interface DropdownMenuTriggerProps {
	children: ReactNode;
	asChild?: boolean;
}

export interface DropdownMenuItemProps extends DropdownMenuItemVariants {
	children: ReactNode;
	onSelect?: () => void;
	disabled?: boolean;
	className?: string;
}

export interface DropdownMenuSeparatorProps {
	className?: string;
}

function composeRefs<T>(
	...refs: (Ref<T> | null | undefined)[]
): RefCallback<T> {
	return (node: T | null) => {
		for (const ref of refs) {
			if (typeof ref === "function") {
				ref(node);
			} else if (ref != null) {
				(ref as RefObject<T | null>).current = node;
			}
		}
	};
}

export function DropdownMenuTrigger({
	children,
	asChild = false,
}: DropdownMenuTriggerProps) {
	const { open, triggerRef, toggle, handleTriggerKeyDown } =
		useDropdownMenuContext();

	if (asChild && isValidElement(children)) {
		const child = children as ReactElement<Record<string, unknown>>;
		const existingRef = child.props.ref as Ref<unknown> | undefined;
		const existingOnClick = child.props.onClick as
			| ((e: React.MouseEvent) => void)
			| undefined;
		const existingOnKeyDown = child.props.onKeyDown as
			| ((e: React.KeyboardEvent) => void)
			| undefined;
		return cloneElement(child, {
			// eslint-disable-next-line react-hooks/refs -- composeRefs writes .current only outside render, inside a ref callback
			ref: composeRefs(existingRef, triggerRef as Ref<unknown>),
			"aria-haspopup": "menu",
			"aria-expanded": String(open),
			onClick: (e: React.MouseEvent) => {
				existingOnClick?.(e);
				if (!e.defaultPrevented) toggle();
			},
			onKeyDown: (e: React.KeyboardEvent) => {
				existingOnKeyDown?.(e);
				if (!e.defaultPrevented)
					handleTriggerKeyDown(e as ReactKeyboardEvent<HTMLElement>);
			},
		});
	}

	return (
		<button
			type="button"
			ref={triggerRef as Ref<HTMLButtonElement>}
			aria-haspopup="menu"
			aria-expanded={open}
			onClick={toggle}
			onKeyDown={handleTriggerKeyDown}
		>
			{children}
		</button>
	);
}

export function DropdownMenu({ children, className }: DropdownMenuProps) {
	const {
		open,
		triggerRef,
		menuRef,
		menuStyle,
		toggle,
		close,
		handleTriggerKeyDown,
		handleMenuKeyDown,
	} = useDropdownMenu();

	const childArray = Children.toArray(children);
	const triggerChild = childArray.find(
		(c) => isValidElement(c) && c.type === DropdownMenuTrigger,
	);
	const menuChildren = childArray.filter(
		(c) => !isValidElement(c) || c.type !== DropdownMenuTrigger,
	);

	return (
		<DropdownMenuContext.Provider
			value={{ open, triggerRef, toggle, handleTriggerKeyDown }}
		>
			{triggerChild}
			{open && (
				<Portal>
					<div
						ref={menuRef as RefObject<HTMLDivElement>}
						role="menu"
						tabIndex={-1}
						style={menuStyle}
						className={menuStyles({ className })}
						onKeyDown={handleMenuKeyDown}
						onClick={close}
					>
						{menuChildren}
					</div>
				</Portal>
			)}
		</DropdownMenuContext.Provider>
	);
}

function DropdownMenuItem({
	children,
	onSelect,
	disabled,
	color,
	className,
}: DropdownMenuItemProps) {
	return (
		<button
			type="button"
			role="menuitem"
			aria-disabled={disabled || undefined}
			className={itemStyles({ color, className })}
			onClick={() => {
				if (!disabled) {
					onSelect?.();
				}
			}}
		>
			{children}
		</button>
	);
}

function DropdownMenuSeparator({ className }: DropdownMenuSeparatorProps) {
	return <div role="separator" className={separatorStyles({ className })} />;
}

DropdownMenu.Trigger = DropdownMenuTrigger;
DropdownMenu.Item = DropdownMenuItem;
DropdownMenu.Separator = DropdownMenuSeparator;
