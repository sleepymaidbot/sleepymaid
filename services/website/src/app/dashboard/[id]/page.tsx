"use client";

import { Minus, Plus } from "lucide-react";
import { useContext } from "react";
import { SettingContext } from "./settingContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";

const Page = () => {
	const settings = useContext(SettingContext);
	if (!settings?.settings) {
		return null;
	}

	if (!settings?.settings) {
		return <div className="right-content w-full flex-grow p-4">{JSON.stringify(settings)}</div>;
	}

	const adminRoles = settings.roles
		.filter((role) => settings.settings?.adminRoles?.includes(role.id))
		.sort((a, b) => b.position - a.position)
		.map((obj) => {
			if (obj.color === "0") {
				return { ...obj, color: "c4c9ce" };
			}

			return obj;
		});

	const moderatorRoles = settings.roles
		.filter((role) => settings.settings?.modRoles?.includes(role.id))
		.sort((a, b) => b.position - a.position)
		.map((obj) => {
			if (obj.color === "0") {
				return { ...obj, color: "c4c9ce" };
			}

			return obj;
		});

	const canBeAdmin = settings.roles
		.filter((role) => {
			return !settings.settings?.adminRoles?.includes(role.id) && !settings.settings?.modRoles?.includes(role.id);
		})
		.sort((a, b) => b.position - a.position);
	const canBeModerator = settings.roles
		.filter((role) => {
			return !settings.settings?.modRoles?.includes(role.id) && !settings.settings?.adminRoles?.includes(role.id);
		})
		.sort((a, b) => b.position - a.position);

	return (
		<div className="right-content w-full flex-grow p-4">
			<div className="h-full w-full border-spacing-1 rounded-lg border-2 border-solid">
				<ScrollArea className="h-full w-full">
					<div className="p-4">
						<div className="text-2xl font-bold">{settings.settings.guildName}</div>
						<div className="text-sm">
							<div className="font-medium">
								{settings.roles.length} Roles・ {settings.channels.length} Channels ・ {settings.emojis.length} Emojis
							</div>
						</div>
						<Separator className="my-4" />
						<div className="flex gap-4">
							<div>
								<Label>Bot Nickname</Label>
								<Input disabled type="default" value={settings.botNickname} />
							</div>
							<div>
								<Label>Bot Prefix</Label>
								<Input disabled type="default" value="/" />
							</div>
						</div>
						<Separator className="my-4" />
						<div className="flex gap-4">
							<div>
								<Label>Admin Roles</Label>
								{adminRoles.map((role) => (
									<div
										className="my-1 rounded-md border-2 p-1 px-4"
										key={role.id}
										style={{ borderColor: "#" + role.color }}
									>
										{role.name}
									</div>
								))}
								<Popover>
									<PopoverTrigger className="my-1 w-full">
										<Button className="my-1 w-full" variant="outline">
											<Plus />
										</Button>
									</PopoverTrigger>
									<PopoverContent className="my-1 w-full">
										<ScrollArea className="flex h-[200px] w-[350px] flex-col gap-2">
											<div className="pr-4">
												{canBeAdmin.map((role) => (
													<div
														className="my-1 rounded-md border-2 p-1 px-4"
														key={role.id}
														style={{ borderColor: "#" + role.color }}
													>
														{role.name}
													</div>
												))}
											</div>
										</ScrollArea>
									</PopoverContent>
								</Popover>
							</div>
							<div>
								<Label>Moderator Roles</Label>
								{moderatorRoles.map((role) => (
									<div
										className="my-1 flex rounded-md border-2 p-1 px-4"
										key={role.id}
										style={{ borderColor: "#" + role.color }}
									>
										<div>
											{" "}
											<Minus />{" "}
										</div>
										{role.name}
									</div>
								))}
								<Popover>
									<PopoverTrigger className="my-1 w-full">
										<Button className="my-1 w-full" variant="outline">
											<Plus />
										</Button>
									</PopoverTrigger>
									<PopoverContent className="my-1 w-full">
										<ScrollArea className="flex h-[200px] w-[350px] flex-col gap-2">
											<div className="pr-4">
												{canBeModerator.map((role) => (
													<div
														className="my-1 rounded-md border-2 p-1 px-4"
														key={role.id}
														style={{ borderColor: "#" + role.color }}
													>
														{role.name}
													</div>
												))}
											</div>
										</ScrollArea>
									</PopoverContent>
								</Popover>
							</div>
						</div>
					</div>
				</ScrollArea>
			</div>
		</div>
	);
};

export default Page;
