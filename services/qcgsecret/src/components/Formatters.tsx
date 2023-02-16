import type { PropsWithChildren } from 'react';
import '../styles/Formatters.css';

export function Underline({ children }: PropsWithChildren<{}>) {
	return <span className="underline">{children}</span>;
}
