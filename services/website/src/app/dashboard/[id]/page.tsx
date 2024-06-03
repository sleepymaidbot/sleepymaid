/* eslint-disable react-hooks/rules-of-hooks */
/* eslint-disable drizzle/enforce-delete-with-where */
"use client";

import type { CheckGuildInformationResponseRolesMessage } from "@sleepymaid/shared";
import { Minus, Plus, Save } from "lucide-react";
import { useContext, useEffect, useMemo, useState } from "react";
import { SettingContext } from "./_settingContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";

const Role = ({
	role,
	guildRoles,
}: {
	readonly guildRoles: Map<string, CheckGuildInformationResponseRolesMessage>;
	readonly role: string;
}) => {
	const roleInfo = guildRoles.get(role);
	if (!roleInfo) {
		console.log("Role not found", role);
		return null;
	}

	return (
		<div
			className="my-1 rounded-md border-2 p-1 px-4"
			key={role}
			style={{ borderColor: "#" + roleInfo.color ?? "c4c9ce" }}
		>
			{roleInfo.name}
		</div>
	);
};

const Page = () => {
	const settings = useContext(SettingContext)!;
	if (!settings!.guildSettings) {
		return null;
	}

	const [saveButtonDisabled, setSaveButtonDisabled] = useState(true);

	const guildRoles = useMemo(() => {
		return new Map<string, CheckGuildInformationResponseRolesMessage>(
			settings.roles
				.sort((a, b) => b.position - a.position)
				.map((role) => {
					if (role.color !== "0") {
						return [role.id, role];
					}

					return [role.id, { ...role, color: "c4c9ce" }];
				}),
		);
	}, [settings.roles]);

	const [adminRoles, setAdminRoles] = useState(new Set(settings.guildSettings.adminRoles));
	const [moderatorRoles, setModeratorRoles] = useState(new Set(settings.guildSettings.modRoles));

	const canBeAdmin = useMemo(() => {
		return settings.roles
			.filter((role) => {
				return (
					!settings.guildSettings?.adminRoles?.includes(role.id) && !settings.guildSettings?.modRoles?.includes(role.id)
				);
			})
			.sort((a, b) => b.position - a.position)
			.map((role) => role.id);
	}, [settings.guildSettings, settings.roles]);

	const canBeModerator = useMemo(() => {
		return settings.roles
			.filter((role) => {
				return (
					!settings.guildSettings?.modRoles?.includes(role.id) && !settings.guildSettings?.adminRoles?.includes(role.id)
				);
			})
			.sort((a, b) => b.position - a.position)
			.map((role) => role.id);
	}, [settings.guildSettings, settings.roles]);

	useEffect(() => {
		setSaveButtonDisabled(
			!adminRoles.size ||
				!moderatorRoles.size ||
				adminRoles.size !== settings.guildSettings!.adminRoles.length ||
				moderatorRoles.size !== settings.guildSettings!.modRoles.length,
		);
	}, [adminRoles, moderatorRoles, settings.guildSettings]);

	return (
		<div className="right-content w-full flex-grow p-4">
			<div className="h-full w-full border-spacing-1 rounded-lg border-2 border-solid">
				<ScrollArea className="h-full w-full">
					<div className="p-4">
						<div className="flex justify-between">
							<div>
								<div className="text-2xl font-bold">{settings.guildSettings.guildName}</div>
								<div className="text-sm">
									<div className="font-medium">
										{settings.roles.length} Roles・ {settings.channels.length} Channels ・ {settings.emojis.length}{" "}
										Emojis
									</div>
								</div>
							</div>
							<div className="flex gap-4">
								<Button className="my-1" disabled={saveButtonDisabled}>
									<Save />
									Save
								</Button>
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
								{[...adminRoles].map((role) => (
									<Role guildRoles={guildRoles} key={role} role={role} />
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
													<Role guildRoles={guildRoles} key={role} role={role} />
												))}
											</div>
										</ScrollArea>
									</PopoverContent>
								</Popover>
							</div>
							<div>
								<Label>Moderator Roles</Label>
								{[...moderatorRoles].map((role) => (
									<Role guildRoles={guildRoles} key={role} role={role} />
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
													<Role guildRoles={guildRoles} key={role} role={role} />
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
