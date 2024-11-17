<script lang="ts">
	import { ScrollArea } from "$lib/components/ui/scroll-area/index.js";
	import * as Avatar from "$lib/components/ui/avatar";
	import { Button } from "$lib/components/ui/button";

	let { data } = $props();
</script>

<div class="flex flex-col items-center justify-start min-h-screen p-4">
	<h1 class="mb-4">Hi, {data.user.displayName}!</h1>
	<ScrollArea class="h-[250px] w-[400px] rounded-md border p-4 pr-6">
		<div class="flex flex-col mx-1">
			{#each data.guilds as guild}
				<div class="mb-2">
					<Button variant="outline" href={`/dashboard/${guild.id}`} class="flex items-center justify-start px-1">
						<Avatar.Root class="mr-3 my-1">
							<Avatar.Image src={`https://cdn.discordapp.com/icons/${guild.id}/${guild.icon}.png`} alt={guild.name} />
							<Avatar.Fallback>
								{guild.name.slice(0, 2).toUpperCase()}
							</Avatar.Fallback>
						</Avatar.Root>
						<p class="text-left">{guild.name}</p>
					</Button>
				</div>
			{/each}
		</div>
	</ScrollArea>
</div>
