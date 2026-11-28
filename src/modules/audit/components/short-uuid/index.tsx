import { CheckIcon, CopyIcon } from "@phosphor-icons/react";
import { Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";

import { useTranslate } from "@lib/i18n";

import { styles } from "./styles";

const VISIBLE_CHARS = 8;
const COPIED_FEEDBACK_MS = 2000;

export interface ShortUuidProps {
	uuid: string;
	/** Links to the user's admin page, for actor and user resource IDs. */
	linkToUser?: boolean;
}

/**
 * A UUID shortened to its first characters, with the full value on hover
 * (`title`) and a button that copies it.
 */
export function ShortUuid({ uuid, linkToUser = false }: ShortUuidProps) {
	const t = useTranslate("audit");
	const [copied, setCopied] = useState(false);
	const { root, link, copy } = styles();
	const short = `${uuid.slice(0, VISIBLE_CHARS)}…`;

	useEffect(() => {
		if (!copied) {
			return;
		}

		const timer = window.setTimeout(() => setCopied(false), COPIED_FEEDBACK_MS);

		return () => window.clearTimeout(timer);
	}, [copied]);

	async function handleCopy() {
		await navigator.clipboard.writeText(uuid);
		setCopied(true);
	}

	return (
		<span className={root()}>
			{linkToUser ? (
				<Link
					to="/admin/users/$uuid"
					params={{ uuid }}
					title={uuid}
					className={link()}
				>
					{short}
				</Link>
			) : (
				<span title={uuid}>{short}</span>
			)}
			<button
				type="button"
				aria-label={
					copied ? t("auditLogsList.copiedId") : t("auditLogsList.copyId")
				}
				onClick={handleCopy}
				className={copy()}
			>
				{copied ? (
					<CheckIcon aria-hidden="true" size={14} />
				) : (
					<CopyIcon aria-hidden="true" size={14} />
				)}
			</button>
		</span>
	);
}
