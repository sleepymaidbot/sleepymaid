import type { PropsWithChildren } from 'react';

export function Underline({ children }: PropsWithChildren<Record<string, never>>) {
	return <span className="underline">{children}</span>;
}
