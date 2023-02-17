import type { PropsWithChildren } from 'react';
import { Disclosure, DisclosureContent, useDisclosureState } from 'ariakit/disclosure';
import '../styles/Dropdown.css';
import { BsArrowDownLeft } from '@react-icons/all-files/bs/BsArrowDownLeft';
import { BsArrowUpLeft } from '@react-icons/all-files/bs/BsArrowUpLeft';

export interface IDropdown {
	title: string;
}

export default function Dropdown({ title, children }: PropsWithChildren<IDropdown>) {
	const disclosure = useDisclosureState();
	const icon = disclosure.open ? (
		<BsArrowUpLeft color="white" size={20} />
	) : (
		<BsArrowDownLeft color="white" size={20} />
	);

	return (
		<div className="ext">
			<div className="wrapper">
				<Disclosure state={disclosure} className="button">
					<div className="button-container">
						<span className="button-text">{title}</span>
						<span className="icon">{icon}</span>
					</div>
				</Disclosure>
				<DisclosureContent state={disclosure} className="content">
					<p>{children}</p>
				</DisclosureContent>
			</div>
		</div>
	);
}
