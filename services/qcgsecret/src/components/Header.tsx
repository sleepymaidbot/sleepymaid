import type { PropsWithChildren } from 'react';
import { BsLink45Deg } from '@react-icons/all-files/bs/BsLink45Deg';
import '../styles/Header.css';

export type IHeader = {
	title: string;
	id: string;
};

export default function Header({ title, id, children }: PropsWithChildren<IHeader>) {
	const url = window.location.pathname.split('#')[0] + '#' + id;
	return (
		<div id={id} className="header-component">
			<div className="component-aligned">
				<span>
					<h1>{title}</h1>
				</span>
				<span className="component-icon">
					{' '}
					<a className="anchor-icon" href={url}>
						<BsLink45Deg size={20}></BsLink45Deg>
					</a>
				</span>
			</div>
			<p>{children}</p>
		</div>
	);
}
