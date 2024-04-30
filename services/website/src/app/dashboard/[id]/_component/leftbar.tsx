"use client";

import { HomeIcon, ListTodo, MessageCircleMore } from "lucide-react";
import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useRouter } from "next/navigation";
import { RouterOutputs, api } from "@/trpc/react";
import { useState } from "react";

const LeftBar = async ({ params }: { readonly params: { id: string } }) => {
	const [settings, _setSettings] = useState<RouterOutputs["guilds"]["getGuildSettings"]>(
		api.guilds.getGuildSettings.useQuery(params.id)!.data!,
	);
	const router = useRouter();
	if (!settings?.settings) {
		return null;
	}
	if (!settings.hasBot) {
		router.push("/invite" + params.id);
		return null;
	}

	return (
		<div className="mx-2 h-full w-1/6 flex-none p-4">
			<div className="h-full border-spacing-1 rounded-lg border-2 border-solid p-4">
				<div className="flex items-center">
					<Button asChild className="w-full py-4" variant="ghost">
						<Link href="/dashboard/">
							<div className="flex items-center ">
								<Avatar className="mr-2">
									<AvatarImage alt="Guild Icon" src={settings.settings.guildIcon ?? ""} />
									<AvatarFallback>GI</AvatarFallback>
								</Avatar>
								<div className="ml-2 space-y-1 text-sm ">
									<div className="font-medium">{settings.settings.guildName}</div>
									<div>Change guild</div>
								</div>
							</div>
						</Link>
					</Button>
				</div>
				<Separator className="my-2" />
				<Button asChild className="my-1 w-full py-4" variant="ghost">
					<Link href={"/dashboard/" + settings.settings.guildId + "/overview"}>
						<div className="flex items-center">
							<HomeIcon className="mr-2" />
							<div className="text-sm">Overview</div>
						</div>
					</Link>
				</Button>
				<Button asChild className="my-1 w-full py-4" variant="ghost">
					<Link href={"/dashboard/" + settings.settings.guildId + "/messages"}>
						<div className="flex items-center">
							<MessageCircleMore className="mr-2" />
							<div className="text-sm">Messages</div>
						</div>
					</Link>
				</Button>
				<Button asChild className="my-1 w-full py-4" variant="ghost">
					<Link href={"/dashboard/" + settings.settings.guildId + "/rolemenu"}>
						<div className="flex items-center">
							<ListTodo className="mr-2" />
							<div className="text-sm">Role Menus</div>
						</div>
					</Link>
				</Button>
			</div>
		</div>
	);
};

export default LeftBar;
