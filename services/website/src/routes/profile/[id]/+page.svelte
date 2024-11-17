<script lang="ts">
	import * as Avatar from "$lib/components/ui/avatar";
	import { Separator } from "$lib/components/ui/separator";
	import { formatNumber } from "$lib/utils.js";

	let { data } = $props();
</script>

{#if data.profile}
	<div class="flex items-center justify-center h-screen gap-4">
		<div class="border border-gray-200 rounded-lg p-4">
			<div class="flex flex-col gap-4">
				<div class="flex h-5 items-center space-x-4 text-sm">
					<Avatar.Root>
						<Avatar.Image
							src={"https://cdn.discordapp.com/avatars/" +
								data.profile.userId +
								"/" +
								data.profile.avatarHash +
								".webp"}
							alt={data.profile.userName}
						/>
						<Avatar.Fallback>{data.profile.userName.slice(0, 2).toUpperCase()}</Avatar.Fallback>
					</Avatar.Root>
					<Separator orientation="vertical" />
					<div>
						<h1>{data.profile.displayName}</h1>
						<h3>{formatNumber(data.profile.currency)} coins</h3>
					</div>
				</div>
				{#if data.fullProfile}
					<Separator />
					<div>
						<h1>Daily streak information</h1>
						<p>
							Current streak: {data.fullProfile.dailyStreak} days
						</p>
						{#if data.fullProfile.dailyTimestamp}
							<p>
								Cooldown: {new Date(data.fullProfile.dailyTimestamp.getTime() + 86400000).toLocaleString()}
							</p>
						{/if}
					</div>
					<Separator />
					<div>
						<h1>Weekly streak information</h1>
						<p>
							Current streak: {data.fullProfile.weeklyStreak} weeks
						</p>
						{#if data.fullProfile.weeklyTimestamp}
							<p>
								Cooldown: {new Date(data.fullProfile.weeklyTimestamp.getTime() + 604800000).toLocaleString()}
							</p>
						{/if}
					</div>
					<Separator />
					<div>
						<h1>Monthly streak information</h1>
						<p>
							Current streak: {data.fullProfile.monthlyStreak} months
						</p>
						{#if data.fullProfile.monthlyTimestamp}
							<p>
								Cooldown: {new Date(data.fullProfile.monthlyTimestamp.getTime() + 2592000000).toLocaleString()}
							</p>
						{/if}
					</div>
				{/if}
			</div>
		</div>
	</div>
{:else}
	<h1>Loading...</h1>
{/if}
