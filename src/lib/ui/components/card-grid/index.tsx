import type { HTMLAttributes } from "react";

import { styles } from "./styles";

export type CardGridProps = HTMLAttributes<HTMLDivElement>;

export function CardGrid({ className, ...rest }: CardGridProps) {
	return <div className={styles({ className })} {...rest} />;
}
