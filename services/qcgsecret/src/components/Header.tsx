import type { PropsWithChildren } from 'react';
import '../styles/Header.css';

export type IHeader = {
	title: string;
};

export default function Header({ title, children }: PropsWithChildren<IHeader>) {
	return (
		<div className="header-component">
			<h1 className="text-5xl">{title}</h1>
			<p>{children}</p>
		</div>
	);
}
