import type { PropsWithChildren } from 'react';
import '../styles/formatters.css';

export function Underline({ children }: PropsWithChildren<{}>) {
	return <span className="underline">{children}</span>;
}
