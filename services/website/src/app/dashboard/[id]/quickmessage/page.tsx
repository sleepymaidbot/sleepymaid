"use client";

import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { SettingContext } from "../_settingContext";
import { useContext } from "react";
import { Textarea } from "@/components/ui/textarea";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Form, FormField, FormItem, FormLabel, FormControl, FormDescription, FormMessage } from "@/components/ui/form";
import { zodResolver } from "@hookform/resolvers/zod";
import { api } from "@/trpc/react";

const quickMessageSchema = z.object({
	guildId: z.string(),
	messageName: z.string(),
	channelId: z.string(),
	messageId: z.string().optional(),
	messageJson: z.string(),
});

export default function QuickMessage() {
	const settings = useContext(SettingContext)!;
	if (!settings.guildSettings || !settings.guildSettings.guildId) {
		return null;
	}

	const form = useForm<z.infer<typeof quickMessageSchema>>({
		resolver: zodResolver(quickMessageSchema),
		defaultValues: {
			guildId: settings.guildSettings.guildId,
			channelId: "",
			messageId: "",
			messageJson: "",
		},
	});

	const mutation = api.guilds.sendQuickMessage.useMutation();

	async function onSubmit(values: z.infer<typeof quickMessageSchema>) {
		values.guildId = settings.guildSettings!.guildId;
		mutation.mutate(values);
	}

	return (
		<div className="right-content w-full flex-grow p-4">
			<div className="h-full w-full border-spacing-1 rounded-lg border-2 border-solid">
				<ScrollArea className="h-full w-full">
					<div className="p-2">Quick Message for {settings.guildSettings.guildName}</div>
					<div className="p-4">
						<Form {...form}>
							<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
								<FormField
									control={form.control}
									name="messageName"
									render={({ field }) => (
										<FormItem>
											<FormLabel>Message Name</FormLabel>
											<FormControl>
												<Input placeholder="Message Name" {...field} />
											</FormControl>
											<FormDescription>This is the name of the message.</FormDescription>
											<FormMessage />
										</FormItem>
									)}
								/>
								<FormField
									control={form.control}
									name="channelId"
									render={({ field }) => (
										<FormItem>
											<FormLabel>Channel Id</FormLabel>
											<FormControl>
												<Input placeholder="Channel Id" {...field} />
											</FormControl>
											<FormDescription>This is the channel id where you want to send the message.</FormDescription>
											<FormMessage />
										</FormItem>
									)}
								/>
								<FormField
									control={form.control}
									name="messageId"
									render={({ field }) => (
										<FormItem>
											<FormLabel>Message Id (optional)</FormLabel>
											<FormControl>
												<Input placeholder="Message Id" {...field} />
											</FormControl>
											<FormDescription>
												If provided, instead of sending the message, it will edit the message with the provided id.
											</FormDescription>
											<FormMessage />
										</FormItem>
									)}
								/>
								<FormField
									control={form.control}
									name="messageJson"
									render={({ field }) => (
										<FormItem>
											<FormLabel>Message Json</FormLabel>
											<FormControl>
												<Textarea placeholder="Message" {...field} />
											</FormControl>
											<FormDescription>This is the message json where you want to send the message.</FormDescription>
											<FormMessage />
										</FormItem>
									)}
								/>
								<Button type="submit">Submit</Button>
							</form>
						</Form>
					</div>
				</ScrollArea>
			</div>
		</div>
	);
}
