import { PropsWithChildren } from 'react';

interface IVideo {
	link: string;
	width: number;
}

export default function Video({ link, width }: PropsWithChildren<IVideo>) {
	return <video controls width={width} src={link} preload="none" />;
}
