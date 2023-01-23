import type { PropsWithChildren } from 'react';
import '../styles/header.css';

export interface IHeader {
	title: string;
}

export default function Header({ title, children }: PropsWithChildren<IHeader>) {
	return (
		<div className="header-component">
			<h1>{title}</h1>
			{children}
		</div>
	);
}
