import { ChevronRight } from "lucide-react";
import Link from "next/link";
import { Suspense } from "react";
import Loading from "./loading";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import type { UserGuilds } from "@/server/api/routers/users";
import { api } from "@/trpc/server";

export default async function Dashboard() {
	const guilds: UserGuilds[] | null = await api.users.getUserGuilds();
	if (!guilds) {
		return <Loading />;
	}

	const list = [...guilds];

	return (
		<div className="h-[95%] overflow-hidden">
			<div className="container flex min-h-screen flex-col items-center justify-center">
				<ScrollArea className="w-100 h-96 rounded-md border">
					<div className="p-4">
						<Suspense fallback={<Loading />}>
							{list.map((guild) => {
								if (!guild) {
									return null;
								}

								if (guild.hasPermission) {
									return (
										<div key={guild.id}>
											<Button asChild className="items-left flex w-[100%] text-left" variant="ghost">
												<Link href={`/dashboard/${guild.id}`}>
													<Avatar>
														<AvatarImage
															src={`https://cdn.discordapp.com/icons/` + guild.id + "/" + guild.icon + ".png"}
														/>
														<AvatarFallback>Icon</AvatarFallback>
													</Avatar>
													<span className="text-bold flex items-center justify-center pl-4 text-lg">{guild.name}</span>
													<ChevronRight />
												</Link>
											</Button>
											<Separator className="my-2" />
										</div>
									);
								} else {
									return (
										<div key={guild.id}>
											<Button className="items-left flex w-[100%] text-left" disabled variant="ghost">
												<Avatar>
													<AvatarImage
														src={`https://cdn.discordapp.com/icons/` + guild.id + "/" + guild.icon + ".png"}
													/>
													<AvatarFallback>Icon</AvatarFallback>
												</Avatar>
												<span className="text-bold flex items-center justify-center pl-4 text-lg">{guild.name}</span>
											</Button>
											<Separator className="my-2" />
										</div>
									);
								}
							})}
						</Suspense>
					</div>
				</ScrollArea>
			</div>
		</div>
	);
}
