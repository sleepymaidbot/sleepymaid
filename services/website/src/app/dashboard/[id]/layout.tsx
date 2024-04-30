"use client";

import LeftBar from "./_component/leftbar";

export default function Layout({
	children,
	params,
}: {
	readonly children: React.ReactNode;
	readonly params: { id: string };
}) {
	return (
		<div className="flex h-full">
			<LeftBar params={params} />
			{children}
		</div>
	);
}
