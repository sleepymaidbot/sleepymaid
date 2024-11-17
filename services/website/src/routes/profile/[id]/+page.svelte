<script lang="ts">
	import * as Avatar from "$lib/components/ui/avatar";
	import { Separator } from "$lib/components/ui/separator";

	let { data } = $props();

	console.log(data);
</script>

{#if data.profile}
	<div class="flex items-center justify-center h-screen gap-4">
		<div class="border border-gray-200 rounded-lg p-4 items-center gap-4">
			<div class="flex h-5 items-center space-x-4 text-sm">
				<Avatar.Root>
					<Avatar.Image
						src={"https://cdn.discordapp.com/avatars/" + data.profile.userId + "/" + data.profile.avatarHash + ".webp"}
						alt={data.profile.userName}
					/>
					<Avatar.Fallback>{data.profile.userName.slice(0, 2).toUpperCase()}</Avatar.Fallback>
				</Avatar.Root>
				<Separator orientation="vertical" />
				<div>
					<h1>{data.profile.displayName}</h1>
					<h3>{data.profile.currency} coins</h3>
				</div>
			</div>
			{#if data.user?.userId === data.profile.userId}
				<Separator />
				<div></div>
			{/if}
		</div>
	</div>
{:else}
	<h1>Loading...</h1>
{/if}
