import type { PropsWithChildren } from 'react';
import '../styles/Step.css';

export default function Step({ children }: PropsWithChildren<Record<string, never>>) {
	return (
		<div className="step-component">
			<div>{children}</div>
		</div>
	);
}
