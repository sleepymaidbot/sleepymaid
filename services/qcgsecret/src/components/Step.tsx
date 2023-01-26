import type { PropsWithChildren } from 'react';
import '../styles/Step.css';

export default function Step({ children }: PropsWithChildren<{}>) {
	return (
		<div className="step-component">
			<div>{children}</div>
		</div>
	);
}
