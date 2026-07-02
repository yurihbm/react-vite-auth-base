import type {
	ReactElement,
	KeyboardEvent as ReactKeyboardEvent,
	ReactNode,
	Ref,
	RefCallback,
	RefObject,
} from "react";

import {
	Children,
	cloneElement,
	createContext,
	isValidElement,
	useContext,
} from "react";

import { usePopover } from "@src/modules/shared/hooks/use-popover";

import { Portal } from "../portal";
import { styles } from "./styles";

interface PopoverContextValue {
	open: boolean;
	toggle: () => void;
	triggerRef: RefObject<HTMLElement | null>;
	handleTriggerKeyDown: (e: ReactKeyboardEvent<HTMLElement>) => void;
}

const PopoverContext = createContext<PopoverContextValue | null>(null);

function usePopoverContext(): PopoverContextValue {
	const ctx = useContext(PopoverContext);
	if (!ctx) throw new Error("Popover.Trigger must be rendered inside Popover");
	return ctx;
}

export interface PopoverProps {
	children: ReactNode;
	className?: string;
}

export interface PopoverTriggerProps {
	children: ReactNode;
	asChild?: boolean;
}

export interface PopoverContentProps {
	children: ReactNode;
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

export function PopoverTrigger({
	children,
	asChild = false,
}: PopoverTriggerProps) {
	const { open, triggerRef, toggle, handleTriggerKeyDown } =
		usePopoverContext();

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
			"aria-haspopup": "dialog",
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
			aria-haspopup="dialog"
			aria-expanded={open}
			onClick={toggle}
			onKeyDown={handleTriggerKeyDown}
		>
			{children}
		</button>
	);
}

export function Popover({ children, className }: PopoverProps) {
	const {
		open,
		triggerRef,
		contentRef,
		contentStyle,
		toggle,
		handleTriggerKeyDown,
		handleContentKeyDown,
	} = usePopover();

	const childArray = Children.toArray(children);
	const triggerChild = childArray.find(
		(c) => isValidElement(c) && c.type === PopoverTrigger,
	);
	const contentChild = childArray.find(
		(c) => isValidElement(c) && c.type === PopoverContent,
	) as ReactElement<PopoverContentProps> | undefined;

	const { content } = styles();

	return (
		<PopoverContext.Provider
			value={{ open, triggerRef, toggle, handleTriggerKeyDown }}
		>
			{triggerChild}
			{open && (
				<Portal>
					<div
						ref={contentRef as RefObject<HTMLDivElement>}
						role="dialog"
						tabIndex={-1}
						style={contentStyle}
						className={content({
							className: [className, contentChild?.props.className],
						})}
						onKeyDown={handleContentKeyDown}
					>
						{contentChild?.props.children}
					</div>
				</Portal>
			)}
		</PopoverContext.Provider>
	);
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars -- props are read directly from the element by Popover, not invoked as a function
function PopoverContent(_props: PopoverContentProps): null {
	return null;
}

Popover.Trigger = PopoverTrigger;
Popover.Content = PopoverContent;
