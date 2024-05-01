"use client";

import { useRouter } from "next/navigation";
import Loading from "../loading";
import LeftBar from "./_component/leftbar";
import { SettingContext } from "./_settingContext";
import { api } from "@/trpc/react";

export default function Layout({
	children,
	params,
}: {
	readonly children: React.ReactNode;
	readonly params: { id: string };
}) {
	const { isPending, isError, data, error } = api.guilds.getGuildSettings.useQuery(params.id)!;
	const router = useRouter();

	if (isPending) {
		return <Loading />;
	}

	if (isError) {
		return <span>Error: {error.message}</span>;
	}

	if (!data?.settings) {
		router.push("/dashboard");
		return;
	}

	if (!data.hasBot) {
		router.push("/invite" + params.id);
		return null;
	}

	return (
		<div className="flex h-full">
			<SettingContext.Provider value={data}>
				<LeftBar />
				{children}
			</SettingContext.Provider>
		</div>
	);
}
