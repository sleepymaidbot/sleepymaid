import type { PropsWithChildren } from 'react';
import '../styles/Header.css';

export type IHeader = {
	title: string;
	id: string;
};

export default function Header({ title, id, children }: PropsWithChildren<IHeader>) {
	return (
		<div id={id} className="header-component">
			<h1>{title}</h1>
			<p>{children}</p>
		</div>
	);
}
